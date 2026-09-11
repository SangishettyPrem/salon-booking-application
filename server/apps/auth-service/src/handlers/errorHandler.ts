import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError.js";
import { logger } from "@/utils/logger.js";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }

  logger.error("Unhandled error:", error);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};
