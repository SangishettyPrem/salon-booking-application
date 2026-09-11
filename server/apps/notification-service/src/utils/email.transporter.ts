import { env } from "@/config/env.config.js";
import nodemailer from "nodemailer";

export const emailTransporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

export const verifyEmailTransport = async (): Promise<void> => {
  await emailTransporter.verify();
};
