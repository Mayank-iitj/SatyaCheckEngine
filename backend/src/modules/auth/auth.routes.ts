import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// ── Admin Login Endpoint ────────────────────────────────────────────────
router.post("/admin/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Predefined credentials
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@satyacheck.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const payload = {
      id: "admin-id-001",
      email: ADMIN_EMAIL,
      role: "ADMIN",
      name: "System Admin"
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "satyacheck-dev-jwt-secret-2024", {
      expiresIn: "12h"
    });

    return res.json({ token, user: payload });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

export default router;
