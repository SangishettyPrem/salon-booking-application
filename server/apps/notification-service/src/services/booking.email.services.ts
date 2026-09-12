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
import { logger } from "@/utils/logger.js";
import { Resend } from "resend";

const resend = new Resend(env.resend.apiKey);

export const sendBookingConfirmedEmail = async (
  payload: BookingEmailPayload,
) => {
  const emailContent = buildBookingConfirmedEmail(payload);

  const { data, error } = await resend.emails.send({
    from: env.smtp.mailFrom,
    to: payload.email,
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
    to: payload.email,
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
    to: payload.email,
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

  const { data, error: customerError } = await resend.emails.send({
    from: env.smtp.mailFrom,
    to: payload.customerEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
  if (customerError) {
    logger.error(
      "Failed to send booking created email to customer: ",
      customerError,
    );
    throw customerError;
  }
  logger.info("Booking created email sent successfully to customer");

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

  const { data: salonData, error: salonError } = await resend.emails.send({
    from: env.smtp.mailFrom,
    to: payload.salonEmail,
    subject: emailContentSalonOwner.subject,
    html: emailContentSalonOwner.html,
    text: emailContentSalonOwner.text,
  });
  if (salonError) {
    logger.error(
      "Failed to send booking created email to salon owner: ",
      salonError,
    );
    throw salonError;
  }
  logger.info("Booking created email sent successfully to salon owner");
};
