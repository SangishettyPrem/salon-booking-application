import { logger } from "@/utils/logger.js";
import mongoose from "mongoose";
import { env } from "../config/env.config.js";
import { AppError } from "@/handlers/AppError.js";

export const connectDB = async () => {
  try {
    if (!env.mongoDBUri) {
      logger.error("MONGODB_URI is not defined");
      throw new AppError("MONGODB_URI is not defined", 500, "CONFIG_ERROR");
    }
    await mongoose.connect(env.mongoDBUri);
    logger.info("Connected to Auth Service Database");
  } catch (error) {
    logger.error("Failed to Connected Auth Service Database: ", error);
    process.exit(1);
  }
};
