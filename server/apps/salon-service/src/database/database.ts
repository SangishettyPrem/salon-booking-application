import { logger } from "@/utils/logger.js";
import mongoose from "mongoose";
import { env } from "../config/env.config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoDBUri);
    logger.info("Connected to Salon Service Database");
  } catch (error) {
    logger.error("Failed to Connected Salon Service Database: ", error);
    process.exit(1);
  }
};
