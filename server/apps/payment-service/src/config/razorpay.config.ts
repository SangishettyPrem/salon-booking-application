import Razorpay from "razorpay";
import { env } from "./env.config.js";

export const razorpayInstance = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});
