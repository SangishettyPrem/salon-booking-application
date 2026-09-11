import app from "./app.js";
import { env } from "./config/env.config.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { connectDB } from "./database/database.js";
import { logger } from "./utils/logger.js";

const PORT = env.port;

const startServer = async () => {
  try {
    await connectDB();
    await connectRabbitMQ();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Payment Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start Payment Service", error);
    process.exit(1);
  }
};

startServer();
