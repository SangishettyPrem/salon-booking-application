import { env } from "@/config/env.config.js";
import ms, { type StringValue } from "ms";
import { UAParser } from "ua-parser-js";
import type { SaveRefreshToken } from "./session.types.js";
import { SessionModel, type ISession } from "./session.model.js";
import { hashRefreshToken } from "../auth/auth.token.js";

export const getDeviceName = (userAgent: string) => {
  const parser = new UAParser(userAgent);

  const result = parser.getResult();
  return `${result.browser.name ?? "Unknown Browser"} (${result.os.name ?? "Unknown OS"})`;
};

export const saveRefreshToken = async ({
  _id,
  refreshToken,
  req,
}: SaveRefreshToken) => {
  const sessionExpires = ms(
    (env.tokenSecret.refreshTokenTTL || "7d") as StringValue,
  );
  const deviceName = getDeviceName(req.headers["user-agent"] as string);
  await SessionModel.create({
    refreshTokenHash: hashRefreshToken(refreshToken),
    userAgent: deviceName,
    userId: _id,
    isRevoked: false,
    ip: req.ip || "",
    expiresAt: new Date(Date.now() + sessionExpires),
  });
};

export const revokeRefreshToken = async (refreshToken: string) => {
  const hashToken = hashRefreshToken(refreshToken);
  await SessionModel.updateOne(
    {
      refreshTokenHash: hashToken,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    },
  );
};

export const findRefreshToken = async (
  refreshToken: string,
): Promise<ISession | null> => {
  const hashToken = hashRefreshToken(refreshToken);
  return SessionModel.findOne({
    refreshTokenHash: hashToken,
    isRevoked: false,
  });
};
