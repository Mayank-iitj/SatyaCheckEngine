import { Router } from "express";
import { runSocialScanner, getScannerStatus } from "../../jobs/social-scanner";

const router = Router();

// GET /api/scanner/status
router.get("/status", (req, res) => {
  const status = getScannerStatus();
  res.json(status);
});

// POST /api/scanner/run
router.post("/run", async (req, res) => {
  try {
    const result = await runSocialScanner();
    res.json(result);
  } catch (error) {
    console.error("Manual scan error:", error);
    res.status(500).json({ error: "Failed to trigger scan." });
  }
});

export default router;
