import { env } from "@/config/env.config.js";
import { type CorsOptions } from "cors";

const whiteListedIp = [env.services.appURL];

export const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    console.log("origin: ", origin);
    if (!origin || whiteListedIp.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed By CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
};
