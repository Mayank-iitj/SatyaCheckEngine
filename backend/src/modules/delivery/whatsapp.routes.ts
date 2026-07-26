import { Router } from "express";

const router = Router();

/**
 * Delivery Channel: WhatsApp Cloud API Webhook
 * Simulates receiving a forwarded message on WhatsApp and replying with a verdict in < 2 seconds.
 */
router.post("/webhook", async (req, res) => {
  try {
    // In a real app, verify the webhook signature from Meta/Twilio
    const { body } = req;

    // Simulate extracting message text or media URL
    let textToAnalyze = body.message?.text?.body || "";
    const mediaId = body.message?.image?.id; // If they forwarded an image
    const sender = body.contacts?.[0]?.wa_id || "unknown";

    if (!textToAnalyze && !mediaId) {
      return res.status(200).send("EVENT_RECEIVED");
    }

    console.log(`📱 Received WhatsApp message from ${sender}: ${textToAnalyze ? 'Text' : 'Media'}`);

    // Simulation: Route to the appropriate engine
    let replyMessage = "";

    if (mediaId) {
      replyMessage = `*SatyaCheck Media Scanner*\n⚠️ UNVERIFIED MEDIA.\nThis image has no C2PA signature. Treat as potentially manipulated. Forwarding to Layer 2 AI Detection...`;
    } else if (textToAnalyze) {
      // Simulate calling the text-verify engine internally
      // For demo, we just provide a mocked response based on keywords
      if (textToAnalyze.toLowerCase().includes("guaranteed") || textToAnalyze.toLowerCase().includes("buyback")) {
        replyMessage = `*SatyaCheck Text Analyzer*\n🔴 HIGH RISK (95/100)\n\nVerdict: SCAM\n\nExplanation: SEBI registered entities cannot offer guaranteed returns. This matches known pump-and-dump patterns.\n\nAdvice: Do not click any links. Report to cybercrime.gov.in.`;
      } else {
        replyMessage = `*SatyaCheck Text Analyzer*\n🟢 LOW RISK (12/100)\n\nVerdict: LEGITIMATE\n\nExplanation: This appears to be a standard market update with no actionable financial manipulation detected.`;
      }
    }

    // In a real app, send this reply via WhatsApp Cloud API
    console.log(`📤 Sending WhatsApp reply to ${sender}:\n${replyMessage}`);

    // Always return 200 OK to acknowledge receipt to the webhook provider
    res.status(200).json({ status: "EVENT_RECEIVED", simulatedReply: replyMessage });

  } catch (error: any) {
    console.error("WhatsApp Webhook Error:", error);
    res.status(500).send("ERROR");
  }
});

/**
 * Webhook Verification (GET)
 * Required by Meta/WhatsApp to verify the webhook URL.
 */
router.get("/webhook", (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN || "satyacheck_secret";
  
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  
  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).send("Missing parameters");
  }
});

export default router;
