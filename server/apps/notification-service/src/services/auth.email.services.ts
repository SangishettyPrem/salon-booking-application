import { env } from "@/config/env.config.js";
import {
  buildPasswordResetEmail,
  buildPasswordResetEmailSuccess,
  buildSendOTPEmail,
} from "@/templates/auth.email.templates.js";
import { emailTransporter } from "@/utils/email.transporter.js";
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
  emailTransporter
    .sendMail({
      from: env.smtp.mailFrom,
      to: payload.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })
    .then(() => {
      logger.info("Password reset email sent successfully");
    })
    .catch((err) => {
      logger.error("Failed to send password reset email: ", err);
    });
};

export const sendPasswordResetSuccessEmail = async (email: string) => {
  try {
    const emailContent = buildPasswordResetEmailSuccess();
    emailTransporter
      .sendMail({
        from: env.smtp.mailFrom,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
      .then(() => {
        logger.info("Password reset success email sent successfully");
      })
      .catch((error) =>
        logger.error("Failed to send password reset success email: ", error),
      );
  } catch (error) {
    logger.error("Failed to send password reset success email:", error);
  }
};

export const sendOTP = async (payload: SendOTPEmailData) => {
  try {
    const emailContent = buildSendOTPEmail(payload.otp);
    emailTransporter
      .sendMail({
        from: env.smtp.mailFrom,
        to: payload.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
      .then(() => {
        logger.info("OTP Email Send Successfully...");
      })
      .catch((error) => console.log("Failed to send OTP: ", error));
  } catch (error) {
    logger.error("Failed to send OTP email: ", error);
  }
};
