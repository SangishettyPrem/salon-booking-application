import { env } from "@/config/env.config.js";
import {
  buildBookingCancelledEmail,
  buildBookingCompletedEmail,
  buildBookingConfirmedEmail,
  buildBookingCreatedEmailForCustomer,
  buildBookingCreatedEmailForSalonOwner,
  type BookingCreatedPayloadForCustomer_SalonOwner,
  type BookingEmailPayload,
} from "@/templates/booking.email.templates.js";
import { emailTransporter } from "@/utils/email.transporter.js";
import { logger } from "@/utils/logger.js";
import { Resend } from "resend";

const resend = new Resend(env.resend.apiKey);

export const sendBookingConfirmedEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingConfirmedEmail(payload);

  emailTransporter
    .sendMail({
      from: env.smtp.mailFrom,
      to: payload.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })
    .then(() => {
      logger.info("Booking confirmed email sent successfully");
    })
    .catch((error) => {
      logger.error("Failed to send booking confirmed email: ", error);
    });
};

export const sendBookingCancelledEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingCancelledEmail(payload);

  emailTransporter
    .sendMail({
      from: env.smtp.mailFrom,
      to: payload.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })
    .then(() => {
      logger.info("Booking cancelled email sent successfully");
    })
    .catch((error) => {
      logger.error("Failed to send booking cancelled email: ", error);
    });
};

export const sendBookingCompletedEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingCompletedEmail(payload);

  emailTransporter
    .sendMail({
      from: env.smtp.mailFrom,
      to: payload.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })
    .then(() => {
      logger.info("Booking completed email sent successfully");
    })
    .catch((error) => {
      logger.error("Failed to send booking completed email: ", error);
    });
};

export const sendBookingCreatedEmailForCustomer = async (
  payload: BookingCreatedPayloadForCustomer_SalonOwner,
) => {
  const customerPayload = {
    salonEmail: payload.salonEmail,
    salonName: payload.salonName,
    salonAddress: payload.salonAddress,
    salonPhone: payload.salonPhone,
    date: payload.date,
    slotTime: payload.time,
    bookingCode: payload.bookingCode,
    serviceName: payload.serviceName,
    price: payload.price,
  };
  const emailContent = buildBookingCreatedEmailForCustomer(customerPayload);

  emailTransporter
    .sendMail({
      from: env.smtp.mailFrom,
      to: payload.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })
    .then(() => {
      logger.info("Booking created email sent successfully to customer");
    })
    .catch((error) => {
      logger.error("Failed to send booking created email to customer: ", error);
    });

  const salonPayload = {
    customerName: payload.customerName,
    date: payload.date,
    slotTime: payload.time,
    bookingCode: payload.bookingCode,
    serviceName: payload.serviceName,
    price: payload.price,
  };
  const emailContentSalonOwner =
    buildBookingCreatedEmailForSalonOwner(salonPayload);

  emailTransporter
    .sendMail({
      from: env.smtp.mailFrom,
      to: payload.salonEmail,
      subject: emailContentSalonOwner.subject,
      html: emailContentSalonOwner.html,
      text: emailContentSalonOwner.text,
    })
    .then(() => {
      logger.info("Booking created email sent successfully to salon owner");
    })
    .then(() => {
      logger.info("Booking created email sent successfully to salon owner");
    })
    .catch((error) => {
      logger.error(
        "Failed to send booking created email to salon owner: ",
        error,
      );
    });
};
