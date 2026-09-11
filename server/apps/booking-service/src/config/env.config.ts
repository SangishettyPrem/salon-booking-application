import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number(),
  MONGODB_URI: z.url(),
  RABBITMQ_URL: z.url(),
  APP_URL: z.url(),
  REDIS_URL: z.url(),
  SALON_SERVICE_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten());
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  mongoDBUri: parsed.data.MONGODB_URI,
  rabbitMQ: parsed.data.RABBITMQ_URL,
  appUrl: parsed.data.APP_URL,
  redisURL: parsed.data.REDIS_URL,
  salonServiceURL: parsed.data.SALON_SERVICE_URL,
};
