import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number(),
  REDIS_URL: z.url(),
  MONGODB_URI: z.url(),
  RABBITMQ_URL: z.url(),
  APP_URL: z.url(),
  BOOKING_SERVICE_URL: z.url(),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
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
  redisURL: parsed.data.REDIS_URL,
  appUrl: parsed.data.APP_URL,
  bookingServiceUrl: parsed.data.BOOKING_SERVICE_URL,
  razorpay: {
    keyId: parsed.data.RAZORPAY_KEY_ID,
    keySecret: parsed.data.RAZORPAY_KEY_SECRET,
  },
};
