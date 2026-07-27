import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

import { requestLogger } from "./middleware/logger";
import { errorHandler, notFoundHandler } from "./middleware/error";
import featuresRoutes from "./modules/features/features.routes";

const app = express();

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: "*",
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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
