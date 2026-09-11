import { Redis } from "ioredis";
import { env } from "./env.config.js";

const redis = new Redis(env.redisURL);

export default redis;
