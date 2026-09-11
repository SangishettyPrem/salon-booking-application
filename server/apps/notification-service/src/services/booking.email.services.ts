import { env } from "@/config/env.config.js";
import {
  buildBookingCancelledEmail,
  buildBookingCompletedEmail,
  buildBookingConfirmedEmail,
  type BookingEmailPayload,
} from "@/templates/booking.email.templates.js";
import { emailTransporter } from "@/utils/email.transporter.js";

export const sendBookingConfirmedEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingConfirmedEmail(payload);

  await emailTransporter.sendMail({
    from: env.smtp.mailFrom,
    to: payload.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
};

export const sendBookingCancelledEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingCancelledEmail(payload);

  await emailTransporter.sendMail({
    from: env.smtp.mailFrom,
    to: payload.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
};

export const sendBookingCompletedEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingCompletedEmail(payload);

  await emailTransporter.sendMail({
    from: env.smtp.mailFrom,
    to: payload.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
};
