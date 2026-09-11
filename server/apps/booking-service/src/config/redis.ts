import { Redis } from "ioredis";
import { env } from "./env.config.js";

export const redis = new Redis(env.redisURL);
