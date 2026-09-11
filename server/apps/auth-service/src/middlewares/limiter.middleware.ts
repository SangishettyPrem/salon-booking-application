import { rateLimit } from "express-rate-limit";
import { logger } from "@/utils/logger.js";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.info(`Rate limit exceeded for ${req.ip}`);
    res.status(429).json({ error: "Rate limit exceeded", success: false });
  },
});
