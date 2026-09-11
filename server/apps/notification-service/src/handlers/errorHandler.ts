import type { NextFunction, Request, Response } from "express";
import { logger } from "@/utils/logger.js";

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error("Unhandled error:", error);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};
