import { getRabbitChannel } from "../config/rabbitmq.js";

export const publishAuthEvent = (routingKey: string, payload: unknown) => {
  const channel = getRabbitChannel();

  const message = Buffer.from(JSON.stringify(payload));

  channel.publish("auth.events", routingKey, message, {
    persistent: true,
    contentType: "application/json",
  });

  console.log(`Published event: ${routingKey}`);
};
