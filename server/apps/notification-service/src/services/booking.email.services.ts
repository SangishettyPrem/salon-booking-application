import { env } from "@/config/env.config.js";
import {
  buildBookingCancelledEmail,
  buildBookingCompletedEmail,
  buildBookingConfirmedEmail,
  type BookingEmailPayload,
} from "@/templates/booking.email.templates.js";
import { logger } from "@/utils/logger.js";
import { Resend } from "resend";

const resend = new Resend(env.resend.apiKey);

export const sendBookingConfirmedEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingConfirmedEmail(payload);

  const { data, error } = await resend.emails.send({
    from: env.smtp.mailFrom,
    to: [payload.email],
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
  if (error) {
    logger.error("Failed to send booking confirmed email: ", error);
    throw error;
  }
  logger.info("Booking confirmed email sent successfully");
};

export const sendBookingCancelledEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingCancelledEmail(payload);

  const { data, error } = await resend.emails.send({
    from: env.smtp.mailFrom,
    to: [payload.email],
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
  if (error) {
    logger.error("Failed to send booking cancelled email: ", error);
    throw error;
  }
  logger.info("Booking Cancelled email sent successfully");
};

export const sendBookingCompletedEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingCompletedEmail(payload);

  const { data, error } = await resend.emails.send({
    from: env.smtp.mailFrom,
    to: [payload.email],
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
  if (error) {
    logger.error("Failed to send booking completed email: ", error);
    throw error;
  }
  logger.info("Booking completed email sent successfully");
};
