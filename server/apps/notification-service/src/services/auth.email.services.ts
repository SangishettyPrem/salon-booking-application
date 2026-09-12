import { env } from "@/config/env.config.js";
import {
  buildPasswordResetEmail,
  buildPasswordResetEmailSuccess,
  buildSendOTPEmail,
} from "@/templates/auth.email.templates.js";
import { logger } from "@/utils/logger.js";
import { Resend } from "resend";

interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
}

interface SendOTPEmailData {
  email: string;
  otp: string;
}

const resend = new Resend(env.resend.apiKey);

export const sendPasswordResetEmail = async (
  payload: PasswordResetEmailData,
): Promise<void> => {
  const emailContent = buildPasswordResetEmail(payload);
  console.log("emailcontent: ", emailContent);
  const { data, error } = await resend.emails.send({
    from: env.smtp.mailFrom,
    to: payload.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (error) {
    logger.error("Failed to send password reset email: ", error);
    throw error;
  }

  logger.info("Password reset email sent successfully");
};

export const sendPasswordResetSuccessEmail = async (email: string) => {
  try {
    const emailContent = buildPasswordResetEmailSuccess();
    const { data, error } = await resend.emails.send({
      from: env.smtp.mailFrom,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (error) {
      logger.error("Failed to send password reset success email: ", error);
      throw error;
    }

    logger.info("Password reset success email sent successfully");
  } catch (error) {
    logger.error("Failed to send password reset success email:", error);
  }
};

export const sendOTP = async (payload: SendOTPEmailData) => {
  try {
    const emailContent = buildSendOTPEmail(payload.otp);
    const { data, error } = await resend.emails.send({
      from: env.smtp.mailFrom,
      to: payload.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
    if (error) {
      logger.error("Failed to send OTP email: ", error);
      throw error;
    }
    logger.info("OTP Email Send Successfully...");
  } catch (error) {
    logger.error("Failed to send OTP email: ", error);
  }
};
