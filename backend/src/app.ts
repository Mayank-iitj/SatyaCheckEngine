import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

import { requestLogger } from "./middleware/logger";
import { errorHandler, notFoundHandler } from "./middleware/error";
import featuresRoutes from "./modules/features/features.routes";
import textVerifyRoutes from "./modules/satyacheck/text-verify.routes";
import mediaVerifyRoutes from "./modules/satyacheck/media-verify.routes";
import claimVerifyRoutes from "./modules/satyacheck/claim-verify.routes";
import callGuardianRoutes from "./modules/satyacheck/call-guardian.routes";
import c2paVerifyRoutes from "./modules/satyacheck/c2pa-verify.routes";
import { elevenlabsRoutes } from "./modules/satyacheck/elevenlabs.routes";
import chatRoutes from "./modules/chat/chat.routes";

const app = express();

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins dynamically
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(requestLogger);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(hpp());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    name: "SatyaCheck API",
  });
});

app.get("/", (req, res) => res.send("SatyaCheck API is running."));
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ── Innovation Features Routes ──────────────────────────────────────────
app.use("/api/features", apiLimiter, featuresRoutes);
app.use("/api/satyacheck", apiLimiter, textVerifyRoutes);
app.use("/api/satyacheck", apiLimiter, mediaVerifyRoutes);
app.use("/api/satyacheck", apiLimiter, claimVerifyRoutes);
app.use("/api/satyacheck", apiLimiter, callGuardianRoutes);
app.use("/api/satyacheck", apiLimiter, c2paVerifyRoutes);
app.use("/api/satyacheck", apiLimiter, elevenlabsRoutes);
app.use("/api/chat", apiLimiter, chatRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
