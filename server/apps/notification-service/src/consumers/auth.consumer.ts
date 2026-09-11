import { getRabbitChannel } from "@/config/rabbitmq.js";
import { handleAuthEvent } from "../events/auth-event-handler.js";

export const startAuthConsumer = async () => {
  const channel = getRabbitChannel();

  const queue = await channel.assertQueue("notification.auth.queue", {
    durable: true,
  });

  await channel.bindQueue(queue.queue, "auth.events", "#");

  channel.consume(queue.queue, async (message) => {
    if (!message) {
      return;
    }
    try {
      const routingKey = message.fields.routingKey;
      const payload = JSON.parse(message.content.toString());
      await handleAuthEvent(routingKey, payload);
      channel.ack(message);
    } catch (error) {
      console.error("Failed to process message:", error);
      channel.nack(message, false, false);
    }
  });
};
