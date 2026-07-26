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
  const result = await runSocialScanner();
  res.json(result);
});

export default router;
