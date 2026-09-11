import { getRabbitChannel } from "@/config/rabbitmq.js";
import { handleBookingEvent } from "../events/booking-event-handler.js";

export const startBookingConsumer = async () => {
  const channel = getRabbitChannel();

  const queue = await channel.assertQueue("notification.booking.queue", {
    durable: true,
  });

  await channel.bindQueue(queue.queue, "booking.events", "#");

  channel.consume(queue.queue, async (message) => {
    if (!message) {
      return;
    }
    try {
      const routingKey = message.fields.routingKey;
      const payload = JSON.parse(message.content.toString());
      await handleBookingEvent(routingKey, payload);
      channel.ack(message);
    } catch (error) {
      console.error("Failed to process message:", error);
      channel.nack(message, false, false);
    }
  });
};
