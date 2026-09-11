import { Redis } from "ioredis";
import { env } from "./env.config.js";

const redis = new Redis(env.redisURL);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export default redis;
