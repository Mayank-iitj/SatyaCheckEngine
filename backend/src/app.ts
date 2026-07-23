import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { config } from "./config";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import institutionRoutes from "./modules/institutions/institutions.routes";
import credentialRoutes from "./modules/credentials/credentials.routes";
import verifyRoutes from "./modules/verify/verify.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import shareRoutes from "./modules/share/share.routes";

// New Innovation Routes
import jobsRoutes from "./modules/jobs/jobs.routes";
import expiryRoutes from "./modules/expiry/expiry.routes";
import equivalencyRoutes from "./modules/equivalency/equivalency.routes";
import plagiarismRoutes from "./modules/plagiarism/plagiarism.routes";
import recoveryRoutes from "./modules/recovery/recovery.routes";
import skillsRoutes from "./modules/skills/skills.routes";
import fraudRoutes from "./modules/fraud/fraud.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import bridgeRoutes from "./modules/bridge/bridge.routes";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.routes";
import offlineRoutes from "./modules/offline/offline.routes";

import { requestLogger } from "./middleware/logger";
import { errorHandler, notFoundHandler } from "./middleware/error";

const app = express();

// ── Security Middleware ─────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// ── Logging Middleware ──────────────────────────────────────────────────
app.use(requestLogger);

// ── Rate Limiting ───────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const verifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification requests, please slow down" },
});

// ── Body Parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static Files (local IPFS fallback) ──────────────────────────────────
app.use("/api/files", express.static(path.join(__dirname, "..", "uploads")));

// ── Health Check ────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    name: "ProofMind API",
  });
});

// ── API Routes ──────────────────────────────────────────────────────────
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/institutions", apiLimiter, institutionRoutes);
app.use("/api/credentials", apiLimiter, credentialRoutes);
app.use("/api/verify", verifyLimiter, verifyRoutes);
app.use("/api/analytics", apiLimiter, analyticsRoutes);
app.use("/api/share-links", apiLimiter, shareRoutes);

// ── New Innovation Routes ───────────────────────────────────────────────
app.use("/api/jobs", apiLimiter, jobsRoutes);
app.use("/api/expiry", apiLimiter, expiryRoutes);
app.use("/api/equivalency", apiLimiter, equivalencyRoutes);
app.use("/api/plagiarism", apiLimiter, plagiarismRoutes);
app.use("/api/recovery", apiLimiter, recoveryRoutes);
app.use("/api/skills", apiLimiter, skillsRoutes);
app.use("/api/fraud", apiLimiter, fraudRoutes);
app.use("/api/notifications", apiLimiter, notificationsRoutes);
app.use("/api/bridge", apiLimiter, bridgeRoutes);
app.use("/api/leaderboard", leaderboardRoutes); // public, no strict limit
app.use("/api/offline", apiLimiter, offlineRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

export default app;
