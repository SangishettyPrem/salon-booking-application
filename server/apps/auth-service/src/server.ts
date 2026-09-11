import app from "./app.js";

import { env } from "@/config/env.config.js";
import { connectDB } from "@/database/database.js";
import { logger } from "@/utils/logger.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

const startServer = async () => {
  await connectDB();
  await connectRabbitMQ();

  const server = app.listen(env.port, "0.0.0.0", () => {
    logger.info(`Auth service running on port ${env.port}`);
  });

  const shutdown = async () => {
    logger.info("Shutting down auth service...");

    server.close(async () => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer();
