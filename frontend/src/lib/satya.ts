// Proxy all requests through Next.js rewrites
const API_URL = "/api";

// ── SatyaCheck Core Engine API ───────────────────────────────────────────

export const satya = {
  /**
   * Engine 1: LLM Phishing / Text Analyzer
   * POST /api/satyacheck/text-verify
   */
  textVerify: async (data: { text?: string; url?: string }) => {
    const res = await fetch(`${API_URL}/satyacheck/text-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Analysis failed");
    return json;
  },

  /**
   * Engine 2: Deepfake / Media Scanner
   * POST /api/satyacheck/media-verify
   */
  mediaVerify: async (file?: File, url?: string) => {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (url) formData.append("url", url);

    const res = await fetch(`${API_URL}/satyacheck/media-verify`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Analysis failed");
    return json;
  },

  /**
   * Engine 3: Claim vs. SEBI/NSE Registry Cross-Checker
   * POST /api/satyacheck/claim-verify
   */
  claimVerify: async (data: { claim: string; company?: string; claimType?: string }) => {
    const res = await fetch(`${API_URL}/satyacheck/claim-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Analysis failed");
    return json;
  },

  /**
   * Engine 4: Call Guardian — Vishing / Voice Scam Detector
   * POST /api/satyacheck/call-guardian
   */
  callGuardian: async (data: { transcript?: string; callerClaim?: string; audioFile?: File }) => {
    const formData = new FormData();
    if (data.transcript) formData.append("transcript", data.transcript);
    if (data.callerClaim) formData.append("callerClaim", data.callerClaim);
    if (data.audioFile) formData.append("audio", data.audioFile);

    const res = await fetch(`${API_URL}/satyacheck/call-guardian`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Analysis failed");
    return json;
  },

  /**
   * Cognita AI Chat
   */
  chat: async (message: string) => {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Chat failed");
    return json;
  },
  /**
   * ElevenLabs TTS
   * POST /api/satyacheck/tts
   */
  generateTTS: async (text: string, voiceId?: string) => {
    const res = await fetch(`${API_URL}/satyacheck/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Failed to generate audio");
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};

export default satya;
