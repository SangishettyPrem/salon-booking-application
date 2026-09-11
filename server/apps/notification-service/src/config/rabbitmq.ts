import amqp, { type Channel, type ChannelModel } from "amqplib";

let connection: ChannelModel;
let channel: Channel;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(process.env.RABBITMQ_URL!);

  channel = await connection.createChannel();

  await channel.assertExchange("auth.events", "topic", {
    durable: true,
  });
  await channel.assertExchange("booking.events", "topic", { durable: true });

  console.log("Notification Service connected to RabbitMQ");
};

export const getRabbitChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
};
