import { getRabbitChannel } from "../config/rabbitmq.js";

export const publishBookingEvent = (routingKey: string, payload: unknown) => {
  const channel = getRabbitChannel();

  const message = Buffer.from(JSON.stringify(payload));

  channel.publish("booking.events", routingKey, message, {
    persistent: true,
    contentType: "application/json",
  });

  console.log(`Published event: ${routingKey}`);
};
