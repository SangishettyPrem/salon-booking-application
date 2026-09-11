import { redis } from "@/config/redis.js";
import crypto from "node:crypto";

export const acquireLock = async (
  key: string,
  ttlSeconds: number,
): Promise<string | null> => {
  const lockValue = crypto.randomUUID();

  const result = await redis.set(key, lockValue, "EX", ttlSeconds, "NX");

  return result === "OK" ? lockValue : null;
};

export const releaseLock = async (
  key: string,
  lockValue: string,
): Promise<void> => {
  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  await redis.eval(script, 1, key, lockValue);
};
