// Simulates a cron job that runs periodically to scan social networks for emerging pump-and-dump schemes.

let isRunning = false;
let lastScanRun = new Date(0);
let activeAlerts: any[] = [];

// Helper to generate random robust data
const generateMockThreats = (count: number) => {
  const platforms = ["X", "Telegram", "WhatsApp Group", "Discord", "Reddit"];
  const threatTypes = ["PUMP_AND_DUMP", "VISHING_CAMPAIGN", "PHISHING_LINK", "FAKE_NEWS", "DEEPFAKE_AUDIO"];
  const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  
  const contentTemplates = [
    "Buy {{stock}} now! Insider news confirmed, guaranteed 100x return by Friday.",
    "URGENT: Your demat account is frozen. Click {{link}} to update KYC immediately.",
    "Leaked audio of {{ceo}} discussing massive acquisition! Load up on {{stock}}.",
    "Exclusive operators group reveals tomorrow's upper circuit stock. Join VIP channel now.",
    "Selling my portfolio and going all-in on {{stock}}. Whales are accumulating secretly.",
    "WARNING: SEBI to ban {{stock}} trading tomorrow. Sell everything!",
    "Customer Support: We detected suspicious activity. Please verify your OTP to secure your funds.",
    "Massive short squeeze incoming for {{stock}}. Do not miss this rocket emoji.",
    "Just received a tip from a highly placed SEBI official. {{stock}} is getting a clean chit.",
    "Free stock tips that hit 90% accuracy. DM me for tomorrow's jackpot pick."
  ];

  const stocks = ["Suzlon", "Yes Bank", "Paytm", "Reliance", "HDFC", "Adani Power", "Zomato", "Vodafone Idea", "IRFC", "RVNL"];
  const ceos = ["Ambani", "Adani", "Tata", "Murthy"];

  const newAlerts = [];
  
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    let severity = severities[Math.floor(Math.random() * severities.length)];
    
    // Adjust severity based on type
    if (type === "PUMP_AND_DUMP" && severity === "LOW") severity = "MEDIUM";
    if (type === "VISHING_CAMPAIGN") severity = "CRITICAL";

    let template = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
    
    // Fill templates
    template = template.replace("{{stock}}", stocks[Math.floor(Math.random() * stocks.length)]);
    template = template.replace("{{ceo}}", ceos[Math.floor(Math.random() * ceos.length)]);
    template = template.replace("{{link}}", "http://kyc-update-sebi-" + Math.floor(Math.random()*1000) + ".xyz");

    // Randomize timestamp within the last 5 minutes
    const randomTimeOffset = Math.floor(Math.random() * 5 * 60 * 1000);
    
    newAlerts.push({
      id: "thr_" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date(now - randomTimeOffset).toISOString(),
      platform,
      content: template,
      estimatedReach: Math.floor(Math.random() * 100000) + 500,
      threatType: type,
      severity,
      authorId: "anon_" + Math.floor(Math.random() * 9999),
      confidenceScore: (Math.random() * (0.99 - 0.75) + 0.75).toFixed(2)
    });
  }

  // Sort newest first
  return newAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const runSocialScanner = async () => {
  if (isRunning) return { status: "already_running" };
  
  isRunning = true;
  const startTime = Date.now();
  
  try {
    console.log("🔍 Starting Proactive Social-Feed Scan...");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate exactly 50 robust threats for the production demo
    const newAlerts = generateMockThreats(50);
    
    activeAlerts = newAlerts;
    lastScanRun = new Date();
    
    const durationMs = Date.now() - startTime;
    console.log(`✅ Scan complete. Found ${newAlerts.length} new threats in ${durationMs}ms.`);
    
    return {
      status: "success",
      scannedCount: Math.floor(Math.random() * 500000) + 100000,
      threatsFound: newAlerts.length,
      durationMs
    };
    
  } catch (error) {
    console.error("Social Scanner Error:", error);
    return { status: "error" };
  } finally {
    isRunning = false;
  }
};

export const getScannerStatus = () => {
  return {
    lastRun: lastScanRun.toISOString(),
    isScanningNow: isRunning,
    activeThreats: activeAlerts
  };
};
