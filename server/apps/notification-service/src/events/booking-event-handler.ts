import {
  sendBookingCancelledEmail,
  sendBookingCompletedEmail,
  sendBookingConfirmedEmail,
  sendBookingCreatedEmailForCustomer,
} from "@/services/booking.email.services.js";

export const handleBookingEvent = async (routingKey: string, payload: any) => {
  console.log("booking event");
  switch (routingKey) {
    case "booking.confirmed":
      await sendBookingConfirmedEmail(payload);
      break;
    case "booking.cancelled":
      await sendBookingCancelledEmail(payload);
      break;
    case "booking.completed":
      await sendBookingCompletedEmail(payload);
      break;
    case "booking.created":
      await sendBookingCreatedEmailForCustomer(payload);
      break;
    default:
      console.log("Unknown Event");
      break;
  }
};
