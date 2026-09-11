import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { logger } from "@/utils/logger.js";
import { corsOptions } from "@/middlewares/cors.middleware.js";
import { limiter } from "@/middlewares/limiter.middleware.js";
import { errorHandler } from "@/handlers/errorHandler.js";
import { notFound } from "@/middlewares/notFound.middleware.js";
import PaymentRoutes from "@/modules/payment/payment.route.js";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(limiter);
app.use(morgan("dev"));
app.use((req, _res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    service: "payment-service",
    status: "ok",
  });
});

app.use("/api/payments", PaymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
