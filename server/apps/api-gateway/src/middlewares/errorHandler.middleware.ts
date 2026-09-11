import { logger } from "@/utils/logger.js";
import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack || err.message);
  return res.status(500).json({
    status: false,
    message: err.message || "Internal server error",
  });
};
