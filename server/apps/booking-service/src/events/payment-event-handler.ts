import { updatePaymentStatus } from "@/modules/booking/booking.service.js";

export const handlePaymentEvent = async (routingKey: string, payload: any) => {
  switch (routingKey) {
    case "payment.verified":
      await updatePaymentStatus(payload);
      break;
    default:
      console.log("Unknown payment event: ", routingKey);
  }
};
