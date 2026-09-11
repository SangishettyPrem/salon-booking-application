import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./handlers/errorHandler.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: "notification-service",
    status: "healthy",
  });
});

app.use(errorHandler);

export default app;
