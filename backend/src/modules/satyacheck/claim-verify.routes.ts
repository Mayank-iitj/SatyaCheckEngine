import { Router, Request, Response } from "express";
import { ai } from "../../lib/ai";
import asyncHandler from "express-async-handler";

const router = Router();

// Known SEBI-registered entities for quick cross-reference
const KNOWN_SEBI_ENTITIES = {
  exchanges: ["NSE", "BSE", "MCX", "NCDEX", "NSE IFSC"],
  depositories: ["CDSL", "NSDL"],
  regulators: ["SEBI", "RBI", "IRDAI", "PFRDA"],
  majorBrokers: ["Zerodha", "Groww", "Upstox", "Angel One", "HDFC Securities", "ICICI Direct", "Sharekhan", "Motilal Oswal", "Kotak Securities", "Axis Direct"],
  mutualFunds: ["SBI MF", "HDFC MF", "ICICI Prudential MF", "Aditya Birla MF", "Nippon India MF", "Axis MF", "Mirae Asset MF", "Kotak MF"],
};

// Fetch real NSE announcement data (public API)
async function fetchNSEData(company: string): Promise<any> {
  try {
    const searchUrl = `https://www.nseindia.com/api/search/autocomplete?q=${encodeURIComponent(company)}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const data = await response.json();
      return { source: "NSE", data: data?.symbols?.slice(0, 3) || [] };
    }
  } catch {
    // Silently fail — we'll work with what we have
  }
  return null;
}

// Fetch SEBI registered intermediary data
async function fetchSEBIIntermediary(name: string): Promise<any> {
  try {
    const url = `https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRegisteredIntermediary=yes&type=IA&name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const html = await response.text();
      // Basic check: does SEBI's page mention the entity?
      const hasEntity = html.toLowerCase().includes(name.toLowerCase());
      return { source: "SEBI", found: hasEntity };
    }
  } catch {
    // Silently fail
  }
  return null;
}

const CLAIM_ANALYSIS_PROMPT = `You are SatyaCheck's Claim vs. Registry Cross-Checker for India's securities markets.

You analyze market-moving claims against official data and known facts about India's financial markets.

Your knowledge covers:
- SEBI regulations and typical announcement formats
- NSE/BSE corporate announcement requirements (buybacks must be filed, dividends announced via exchange)
- SEBI Investment Advisor (IA) registration requirements
- AMFI mutual fund NAV and scheme structures  
- RBI notifications format for monetary policy
- Common patterns in pump-and-dump schemes
- Legitimate IPO allotment processes (via ASBA/UPI, never via WhatsApp payment links)

Evaluate the claim against the provided context and real-world knowledge.

Respond ONLY with valid JSON:
{
  "verdict": "VERIFIED" | "LIKELY_FAKE" | "MISLEADING" | "UNVERIFIABLE" | "SUSPICIOUS",
  "riskLevel": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "confidence": <number 0-100>,
  "claimType": <string>,
  "discrepancies": [<specific factual discrepancies between claim and known facts>],
  "matchedFacts": [<facts from claim that align with official records or regulations>],
  "redFlags": [<regulatory or procedural red flags>],
  "officialProcess": <string: how the legitimate version of this announcement would look>,
  "explanation": <2-3 sentences plain English verdict>,
  "sources": [<list of authoritative sources to check, e.g., "NSE Corporate Filings", "SEBI SCORES">],
  "safetyAdvice": <1-2 sentences for the investor>
}`;

/**
 * POST /api/satyacheck/claim-verify
 * Market Claim vs. SEBI/NSE Registry Cross-Checker
 */
router.post(
  "/claim-verify",
  asyncHandler(async (req: Request, res: Response) => {
    const { claim, company, claimType } = req.body;

    if (!claim || claim.trim().length < 10) {
      res.status(400).json({ error: "Provide a 'claim' string of at least 10 characters." });
      return;
    }

    // Attempt to fetch real data in parallel
    const [nseData, sebiData] = await Promise.allSettled([
      company ? fetchNSEData(company) : Promise.resolve(null),
      company ? fetchSEBIIntermediary(company) : Promise.resolve(null),
    ]);

    const nseResult = nseData.status === "fulfilled" ? nseData.value : null;
    const sebiResult = sebiData.status === "fulfilled" ? sebiData.value : null;

    // Build context for the LLM
    const contextBlock = `
Claim to analyze: "${claim}"
${company ? `Company/Entity mentioned: ${company}` : ""}
${claimType ? `Claim type: ${claimType}` : ""}

Live Registry Data:
- NSE lookup: ${nseResult ? JSON.stringify(nseResult) : "Could not fetch (API unavailable)"}
- SEBI Intermediary lookup: ${sebiResult ? JSON.stringify(sebiResult) : "Could not fetch (API unavailable)"}

Known SEBI-registered entities context:
- Major exchanges: ${KNOWN_SEBI_ENTITIES.exchanges.join(", ")}
- Depositories: ${KNOWN_SEBI_ENTITIES.depositories.join(", ")}
- Major brokers: ${KNOWN_SEBI_ENTITIES.majorBrokers.join(", ")}

Key regulatory facts:
- Buybacks must be filed on NSE/BSE exchange portal BEFORE announcement
- IPO allotments are done by registrars (LINK, KFIN) — never via WhatsApp
- SEBI-registered IAs cannot promise guaranteed returns
- RBI monetary policy is announced on scheduled MPC dates only
- Dividends are declared in board meetings and filed with exchanges
`.trim();

    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: CLAIM_ANALYSIS_PROMPT },
        {
          role: "user",
          content: `${contextBlock}\n\nAnalyze the claim and respond ONLY with valid JSON.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1200,
    });

    const rawResponse = completion.choices[0]?.message?.content || "{}";
    let result: any;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      result = {
        verdict: "UNVERIFIABLE",
        riskLevel: "MEDIUM",
        confidence: 30,
        claimType: claimType || "general",
        discrepancies: [],
        matchedFacts: [],
        redFlags: ["Could not complete analysis"],
        officialProcess: "Verify directly with the named exchange or regulator.",
        explanation: "Analysis could not be fully completed. Please verify through official channels.",
        sources: ["NSE Corporate Filings (nseindia.com)", "BSE Corporate Announcements (bseindia.com)", "SEBI SCORES Portal"],
        safetyAdvice: "Always verify market-moving claims directly on NSE/BSE corporate announcement portals before acting.",
      };
    }

    res.json({
      engine: "satyacheck-claims-v1",
      analyzedAt: new Date().toISOString(),
      inputClaim: claim,
      company: company || null,
      claimType: claimType || null,
      liveDataFetched: {
        nse: !!nseResult,
        sebi: !!sebiResult,
      },
      ...result,
    });
  })
);

export default router;
