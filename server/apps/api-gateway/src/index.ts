import express from "express";
import helmet from "helmet";
import cors from "cors";
import proxy from "express-http-proxy";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { proxyOptions } from "@/utils/proxyOptions.js";
import { logger } from "@/utils/logger.js";
import { env } from "@/config/env.config.js";
import { corsOptions } from "@/middlewares/cors.middleware.js";
import { errorHandler } from "@/middlewares/errorHandler.middleware.js";
import { attachUser } from "./middlewares/auth.middleware.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";

const app = express();


app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(rateLimiter);

// Global attachUser to extract JWT headers / cookies if present and forward downstream
app.use(attachUser);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GlowBook Salon Booking API Gateway",
    services: {
      auth: env.services.authServiceURL,
      salon: env.services.salonServiceURL,
      bookings: env.services.bookingServiceURL,
      payments: env.services.paymentServiceURL,
    },
  });
});

// 1. Auth Service (/api/auth)
app.use(
  "/api/auth",
  proxy(env.services.authServiceURL, {
    ...proxyOptions,
  }),
);

// 2. Salon Service (/api/salon)
app.use(
  "/api/salon",
  proxy(env.services.salonServiceURL, {
    ...proxyOptions,
  }),
);

// 3. Booking Service (/api/bookings)
app.use(
  "/api/bookings",
  proxy(env.services.bookingServiceURL, {
    ...proxyOptions,
  }),
);

// 4. Payment Service (/api/payments)
app.use(
  "/api/payments",
  proxy(env.services.paymentServiceURL, {
    ...proxyOptions,
  }),
);

app.use(errorHandler);

export default app;
