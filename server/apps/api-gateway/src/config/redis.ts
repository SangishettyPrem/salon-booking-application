import { Redis } from "ioredis";
import { env } from "./env.config.js";
import { logger } from "@/utils/logger.js";

export const redis = new Redis(env.redisURL);

export default redis;
