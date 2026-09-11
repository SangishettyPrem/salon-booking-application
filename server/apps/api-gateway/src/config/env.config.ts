import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  APP_URL: z.url(),
  REDIS_URL: z.url(),
  AUTH_SERVICE_URL: z.url(),
  SALON_SERVICE_URL: z.url(),
  BOOKING_SERVICE_URL: z.url(),
  PAYMENT_SERVICE_URL: z.url(),
  NOTIFICATION_SERVICE_URL: z.url(),

  // JWT Config
  JWT_PUBLIC_KEY: z.string(),
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten());
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  services: {
    appURL: parsed.data.APP_URL,
    authServiceURL: parsed.data.AUTH_SERVICE_URL,
    salonServiceURL: parsed.data.SALON_SERVICE_URL,
    bookingServiceURL: parsed.data.BOOKING_SERVICE_URL,
    paymentServiceURL: parsed.data.PAYMENT_SERVICE_URL,
    notificationServiceURL: parsed.data.NOTIFICATION_SERVICE_URL,
  },
  redisURL: parsed.data.REDIS_URL,
  jwt: {
    jwtPublicKey: parsed.data.JWT_PUBLIC_KEY,
    issuer: parsed.data.JWT_ISSUER,
    audience: parsed.data.JWT_AUDIENCE,
  },
};
