import app from "./index.js";
import { logger } from "./utils/logger.js";
import { env } from "./config/env.config.js";

const startServer = () => {
  app.listen(env.port, "0.0.0.0", () => {
    logger.info(`=================================================`);
    logger.info(`🚀 API Gateway running at http://localhost:${env.port}`);
    logger.info(`🔐 Auth Service URL:     ${env.services.authServiceURL}`);
    logger.info(`🏪 Salon Service URL:    ${env.services.salonServiceURL}`);
    logger.info(`📅 Booking Service URL:  ${env.services.bookingServiceURL}`);
    logger.info(`💳 Payment Service URL:  ${env.services.paymentServiceURL}`);
    logger.info(
      `💳 Notification Service URL:  ${env.services.notificationServiceURL}`,
    );
    logger.info(`=================================================`);
  });
};

startServer();
