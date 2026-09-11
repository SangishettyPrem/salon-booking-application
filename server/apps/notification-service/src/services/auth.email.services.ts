import { env } from "@/config/env.config.js";
import { emailTransporter } from "@/utils/email.transporter.js";
import {
  buildPasswordResetEmail,
  buildPasswordResetEmailSuccess,
  buildSendOTPEmail,
} from "@/templates/auth.email.templates.js";
import { logger } from "@/utils/logger.js";

interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
}

interface SendOTPEmailData {
  email: string;
  otp: string;
}

export const sendPasswordResetEmail = async (
  payload: PasswordResetEmailData,
): Promise<void> => {
  const emailContent = buildPasswordResetEmail(payload);

  await emailTransporter.sendMail({
    from: env.smtp.mailFrom,
    to: payload.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
};

export const sendPasswordResetSuccessEmail = async (email: string) => {
  try {
    const emailContent = buildPasswordResetEmailSuccess();
    await emailTransporter.sendMail({
      from: env.smtp.mailFrom,
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  } catch (error) {
    logger.error("Failed to send password reset success email:", error);
  }
};

export const sendOTP = async (payload: SendOTPEmailData) => {
  try {
    const emailContent = buildSendOTPEmail(payload.otp);
    await emailTransporter.sendMail({
      from: env.smtp.mailFrom,
      to: payload.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  } catch (error) {
    logger.error("Failed to send OTP email: ", error);
  }
};
