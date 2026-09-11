import amqp, { type Channel, type ChannelModel } from "amqplib";
import { env } from "./env.config.js";

let connection: ChannelModel;
let channel: Channel;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(env.rabbitMQ);

    channel = await connection.createChannel();

    await channel.assertExchange("auth.events", "topic", { durable: true });

    console.log("Connected to RabbitMQ");

    connection.on("error", (error) => {
      console.error("RabbitMQ connection error:", error);
    });

    connection.on("close", () => {
      console.log("RabbitMQ connection closed");
    });
  } catch (error) {
    console.error("RabbitMQ connection failed:", error);
    throw error;
  }
};

export const getRabbitChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
};
