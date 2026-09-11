import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5001),
  MONGODB_URI: z.url(),
  RABBITMQ_URL: z.url(),

  // JWT Config
  JWT_ACCESS_PRIVATE_KEY_PATH: z.string().min(1),
  JWT_ACCESS_PUBLIC_KEY_PATH: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_ISSUER: z.string().default("salon-booking-auth"),
  JWT_AUDIENCE: z.string(),

  // Token Config
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().default(15),

  // Cookie Config
  COOKIE_SECURE: z
    .string()
    .transform((value) => value === "true")
    .default(false),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),

  // APP URL
  APP_URL: z.url(),
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

  jwt: {
    accessPrivateKeyPath: parsed.data.JWT_ACCESS_PRIVATE_KEY_PATH,
    accessPublicKeyPath: parsed.data.JWT_ACCESS_PUBLIC_KEY_PATH,
    accessExpiresIn: parsed.data.JWT_ACCESS_EXPIRES_IN,
    issuer: parsed.data.JWT_ISSUER,
    audience: parsed.data.JWT_AUDIENCE,
  },

  tokenSecret: {
    refreshTokenTTL: parsed.data.REFRESH_TOKEN_TTL,
    cookieSecure: parsed.data.COOKIE_SECURE,
    cookieSameSite: parsed.data.COOKIE_SAME_SITE,
  },

  appUrl: parsed.data.APP_URL,
  passwordResetExpiresMinutes: parsed.data.PASSWORD_RESET_EXPIRES_MINUTES,
};
