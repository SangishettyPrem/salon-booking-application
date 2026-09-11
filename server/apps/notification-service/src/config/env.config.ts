import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.url(),
  RABBITMQ_URL: z.url(),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.string().transform((value) => value === "true"),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().default(15),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  process.exit(1);
}

export const env = {
  appURL: parsed.data.APP_URL,
  resend: {
    apiKey: parsed.data.RESEND_API_KEY,
  },
  rabbitmq: {
    url: parsed.data.RABBITMQ_URL,
  },
  smtp: {
    host: parsed.data.SMTP_HOST,
    port: parsed.data.SMTP_PORT,
    secure: parsed.data.SMTP_SECURE,
    user: parsed.data.SMTP_USER,
    password: parsed.data.SMTP_PASSWORD,
    mailFrom: parsed.data.MAIL_FROM,
  },
  passwordResetExpiresMinutes: parsed.data.PASSWORD_RESET_EXPIRES_MINUTES,
};
