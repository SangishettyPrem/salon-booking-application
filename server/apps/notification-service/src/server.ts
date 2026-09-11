import app from "./app.js";
import { connectRabbitMQ } from "@/config/rabbitmq.js";
import { startAuthConsumer } from "@/consumers/auth.consumer.js";
import { startBookingConsumer } from "./consumers/booking.consumer.js";

const startServer = async () => {
  await connectRabbitMQ();

  await startAuthConsumer();
  await startBookingConsumer();

  app.listen(5005, "0.0.0.0", () => {
    console.log("Notification service running on port 5005");
  });
};

startServer();
