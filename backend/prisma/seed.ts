import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SatyaCheck SEBI Hackathon Database...\n");

  // ── 1. Create Users & Intermediaries ──────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@sebi.gov.in" },
    update: {},
    create: { email: "admin@sebi.gov.in", name: "SEBI Official", role: "ADMIN" },
  });

  const zerodhaUser = await prisma.user.upsert({
    where: { email: "compliance@zerodha.com" },
    update: {},
    create: { email: "compliance@zerodha.com", name: "Zerodha Compliance", role: "INTERMEDIARY" },
  });

  const zerodha = await prisma.intermediary.upsert({
    where: { registrationNo: "INZ000031633" },
    update: {},
    create: { registrationNo: "INZ000031633", name: "Zerodha Broking Limited", publicKey: "pub_key_mock_ed25519_zerodha" },
  });

  console.log("✅ Seeded Users & Intermediaries");

  // ── 2. Legitimate Intermediary Broadcast & Phishing Notice ────────────
  await prisma.circular.createMany({
    data: [
      { title: "Margin Pledge Requirements Update", content: "As per the latest SEBI guidelines, all margin pledges must be authorized via OTP.", issuerId: zerodha.id, signature: "valid_signature_ed25519_abc123", c2paHash: "hash_xyz_valid" },
      { title: "URGENT: SEBI Fines Zerodha - Withdraw Funds Immediately", content: "SEBI has levied a 500Cr fine. Click here to withdraw your funds: http://zerodha-wealth.in", issuerId: "UNKNOWN_PHISHING", signature: "INVALID_SIGNATURE", c2paHash: null },
    ],
  });
  console.log("✅ Seeded Circulars (Legitimate & Phishing)");

  // ── 3. Typo-squatting Catch (Scam Domains) ────────────────────────────
  await prisma.scamDomain.createMany({
    data: [
      { domain: "zerodha-wealth.in", targetBroker: "Zerodha", similarityScore: 92.5, status: "BLOCKED" },
      { domain: "groww-invest-now.com", targetBroker: "Groww", similarityScore: 88.0, status: "ACTIVE" },
      { domain: "upstox-trading-bot.co", targetBroker: "Upstox", similarityScore: 91.2, status: "BLOCKED" },
      { domain: "angelone-premium.net", targetBroker: "Angel One", similarityScore: 85.5, status: "ACTIVE" },
      { domain: "icicidirect-login-secure.org", targetBroker: "ICICI Direct", similarityScore: 94.1, status: "BLOCKED" },
    ],
  });
  console.log("✅ Seeded Scam Domains (Clone Radar)");

  // ── 4. Deepfake Records ────────────────────────────────────────
  await prisma.deepfakeRecord.createMany({
    data: [
      { mediaUrl: "https://satya-mock-s3.bucket/nse_ceo_advisory.mp4", confidence: 98.7, anomalies: JSON.stringify([{ type: "LIP_SYNC", timeSec: 12.5, severity: "HIGH" }, { type: "BLINK_RATE", timeSec: 24.1, severity: "MEDIUM" }]) },
      { mediaUrl: "https://satya-mock-s3.bucket/hdfc_chairman_fake.mp4", confidence: 94.2, anomalies: JSON.stringify([{ type: "PULSE_RATE_INCONSISTENCY", timeSec: 5.2, severity: "HIGH" }]) },
      { mediaUrl: "https://satya-mock-s3.bucket/adani_statement_fake.mp4", confidence: 99.1, anomalies: JSON.stringify([{ type: "VOICE_CLONING_ARTIFACTS", timeSec: 1.5, severity: "HIGH" }, { type: "LIP_SYNC", timeSec: 8.4, severity: "HIGH" }]) },
      { mediaUrl: "https://satya-mock-s3.bucket/sebi_chairperson_deepfake.mp4", confidence: 88.5, anomalies: JSON.stringify([{ type: "FACIAL_BLURRING", timeSec: 30.1, severity: "MEDIUM" }]) },
      { mediaUrl: "https://satya-mock-s3.bucket/rbi_governor_clone.mp4", confidence: 96.8, anomalies: JSON.stringify([{ type: "SYNTHETIC_AUDIO", timeSec: 0.5, severity: "HIGH" }, { type: "MICRO_EXPRESSIONS_MISSING", timeSec: 10.0, severity: "MEDIUM" }]) },
    ],
  });
  console.log("✅ Seeded Deepfake Records (X-Ray Sandbox)");

  // ── 5. ZKP Whistleblower Drop ─────────────────────────────────────────
  await prisma.whistleblowerReport.createMany({
    data: [
      { zkProofHash: "0x8fa4c2b8b9a13d31...valid_zk_snark", companyName: "Adani Enterprises (Demo)", reportData: "ENCRYPTED_PAYLOAD_EVIDENCE_OF_ROUNDTRIPPING", status: "INVESTIGATING" },
      { zkProofHash: "0x12bb456cdef98765...valid_zk_snark", companyName: "Reliance Industries (Demo)", reportData: "ENCRYPTED_PAYLOAD_UNPUBLISHED_EARNINGS", status: "UNVERIFIED" },
      { zkProofHash: "0x9876abcde1234567...valid_zk_snark", companyName: "Paytm (Demo)", reportData: "ENCRYPTED_PAYLOAD_COMPLIANCE_BREACH", status: "RESOLVED" },
      { zkProofHash: "0x55aa66bb77cc88dd...valid_zk_snark", companyName: "Vedanta (Demo)", reportData: "ENCRYPTED_PAYLOAD_BOARD_MEETING_MINUTES", status: "INVESTIGATING" },
      { zkProofHash: "0xdeadbeef12345678...valid_zk_snark", companyName: "Zomato (Demo)", reportData: "ENCRYPTED_PAYLOAD_TAX_EVASION", status: "UNVERIFIED" },
    ],
  });
  console.log("✅ Seeded Whistleblower Reports");

  // ── 6. 5 Heatmap Campaigns ─────────────────────────────────────────────
  
  const campaigns = [
    { name: "Suzlon WhatsApp Pump", assetName: "Suzlon Energy" },
    { name: "Yes Bank Fake Rumor", assetName: "Yes Bank" },
    { name: "Hindenburg Short Attack (Fake)", assetName: "Adani Green" },
    { name: "Crypto ICO Scam Net", assetName: "BitRupee Token" },
    { name: "SME IPO Gray Market Ring", assetName: "TechNova IPO" }
  ];

  for (let c of campaigns) {
    const campaign = await prisma.heatmapCampaign.create({ data: { name: c.name, assetName: c.assetName } });
    
    // Generate 15-20 nodes per campaign
    const numNodes = 15 + Math.floor(Math.random() * 5);
    const nodeDocs = [];
    
    // Patient zero
    const pzId = crypto.randomUUID();
    nodeDocs.push({ id: pzId, campaignId: campaign.id, handle: "Patient_Zero", type: "CHANNEL", platform: "TELEGRAM", isPatientZero: true });

    const platforms = ["TELEGRAM", "TWITTER", "WHATSAPP"];
    const types = ["USER", "GROUP"];
    
    for(let i=1; i<numNodes; i++) {
      nodeDocs.push({
        id: crypto.randomUUID(),
        campaignId: campaign.id,
        handle: `Node_${i}_${c.name.substring(0,3)}`,
        type: types[Math.floor(Math.random() * types.length)],
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        isPatientZero: false
      });
    }

    await prisma.heatmapNode.createMany({ data: nodeDocs });

    // Generate edges connecting them back to patient zero or each other
    const edges = [];
    for(let i=1; i<numNodes; i++) {
      // Pick a random source that is an earlier node (simulating spread)
      const sourceIdx = Math.floor(Math.random() * i);
      edges.push({
        sourceId: nodeDocs[sourceIdx].id,
        targetId: nodeDocs[i].id,
        messageHash: `hash_${c.assetName}_${i}`
      });
    }

    await prisma.heatmapEdge.createMany({ data: edges });
  }

  console.log("✅ Seeded 5 Heatmap Campaigns");

  console.log("\n🎉 Database seeded successfully with 5 distinct Heatmap Campaigns!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
