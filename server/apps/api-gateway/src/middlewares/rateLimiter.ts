import type { Request, Response, NextFunction } from "express";
import redis from "../config/redis.js";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ip = req.ip || "unknown";
    const key = `rate-limit:${ip}`;

    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    if (currentCount > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next();
  }
};
