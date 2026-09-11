import app from "./app.js";

import { env } from "@/config/env.config.js";
import { connectDB } from "@/database/database.js";
import { logger } from "@/utils/logger.js";
import redis from "./config/redis.js";

const startServer = async () => {
  await connectDB();
  await redis.ping();

  const server = app.listen(env.port, "0.0.0.0", () => {
    logger.info(`Salon service running on port ${env.port}`);
  });

  const shutdown = async () => {
    logger.info("Shutting down salon service...");

    server.close(async () => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer();
