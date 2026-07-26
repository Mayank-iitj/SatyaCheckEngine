import { Router } from "express";

const router = Router();

/**
 * Delivery Channel: Manifest V3 Browser Extension API
 * Highly optimized endpoint for fast, in-feed scoring of social media posts (X, Telegram web).
 */
router.post("/verify-feed", async (req, res) => {
  try {
    const { posts } = req.body; // Array of post objects { id, text, author }

    if (!posts || !Array.isArray(posts)) {
      return res.status(400).json({ error: "Expected an array of 'posts'." });
    }

    const startTime = Date.now();

    // Fast heuristic scoring for the extension (to keep latency < 500ms for bulk feed scanning)
    const results = posts.map(post => {
      const text = (post.text || "").toLowerCase();
      
      let riskScore = 10;
      let flag = false;
      let reason = "";

      if (text.includes("guaranteed return") || text.includes("sure shot")) {
        riskScore = 90;
        flag = true;
        reason = "SEBI prohibits guaranteed returns.";
      } else if (text.includes("insider info") || text.includes("pump")) {
        riskScore = 85;
        flag = true;
        reason = "Potential market manipulation / pump-and-dump.";
      } else if (text.includes("sebi registered") && !text.includes("inz")) {
        // Simple heuristic: claims registration but provides no INZ number
        riskScore = 60;
        flag = true;
        reason = "Claims SEBI registration without providing ID.";
      }

      return {
        id: post.id,
        riskScore,
        flagged: flag,
        badgeText: flag ? "High Risk" : "Verified",
        color: flag ? "red" : "green",
        reason
      };
    });

    const latency = Date.now() - startTime;

    res.json({
      success: true,
      count: posts.length,
      latencyMs: latency,
      results
    });

  } catch (error: any) {
    console.error("Extension API Error:", error);
    res.status(500).json({ error: "Failed to process feed verification." });
  }
});

export default router;
