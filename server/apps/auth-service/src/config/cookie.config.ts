import { type CookieOptions } from "express";
import ms, { type StringValue } from "ms";
import { env } from "./env.config.js";

const refreshTokenMaxAge = ms(
  (env.tokenSecret.refreshTokenTTL || "7d") as StringValue,
);

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv == "production" ? true : env.tokenSecret.cookieSecure,
  sameSite: "none",
  maxAge: refreshTokenMaxAge,
  path: "/",
};
