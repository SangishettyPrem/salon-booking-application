import { env } from "@/config/env.config.js";
import nodemailer from "nodemailer";

export const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

export const verifyEmailTransport = async (): Promise<void> => {
  await emailTransporter.verify();
};
