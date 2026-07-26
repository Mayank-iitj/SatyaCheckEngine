import app from "./app";
import { config } from "./config";
import { initBlockchain } from "./lib/blockchain";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";
import { runSocialScanner } from "./jobs/social-scanner";

async function main() {
  logger.info("🧠 SatyaCheck API Server Starting...");
  logger.info(`📌 Environment: ${process.env.NODE_ENV || "development"}`);

  // Initialize blockchain connection
  initBlockchain();

  // Start server
  const server = app.listen(config.port, () => {
    logger.info(`\n🚀 SatyaCheck API running at http://localhost:${config.port}`);
    logger.info(`📋 Health check: http://localhost:${config.port}/api/health`);
    logger.info(`🔗 CORS origin: ${config.corsOrigin}`);
    logger.info(`⛓️  Chain ID: ${config.chainId}`);
    logger.info(`📦 IPFS Provider: ${config.ipfsProvider}\n`);
  });

  // Start Background Jobs
  logger.info("🕒 Initializing Social Scanner Job...");
  runSocialScanner(); // Run immediately
  const scannerInterval = setInterval(runSocialScanner, 5 * 60 * 1000); // 5 minutes

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      logger.info("HTTP server closed.");
      clearInterval(scannerInterval);
      try {
        await prisma.$disconnect();
        logger.info("Prisma disconnected.");
        process.exit(0);
      } catch (err) {
        logger.error({ err }, "Error during Prisma disconnect");
        process.exit(1);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "Server failed to start");
  process.exit(1);
});
