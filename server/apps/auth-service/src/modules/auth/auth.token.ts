import jwt, { type SignOptions } from "jsonwebtoken";
import type { AccessTokenPayload, RefreshTokenPayload } from "./auth.types.js";
import { env } from "@/config/env.config.js";
import crypto from "node:crypto";
import { jwtConfig } from "@/config/jwt.config.js";
import type { StringValue } from "ms";

export const generateAccessToken = (payload: {
  sub: string;
  role: string;
  type: "access";
}): string => {
  return jwt.sign(
    {
      sub: payload.sub,
      role: payload.role,
      type: "access",
    },
    jwtConfig.privateKey,
    {
      algorithm: "RS256",
      expiresIn: jwtConfig.accessTokenExpiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    },
  );
};

export const generateRefreshToken = (payload: {
  sub: string;
  type: "refresh";
}): string => {
  return jwt.sign(
    {
      sub: payload.sub,
      type: payload.type,
    },
    jwtConfig.privateKey,
    {
      algorithm: "RS256",
      expiresIn: "7d",
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    },
  );
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, jwtConfig.publicKey, {
    algorithms: ["RS256"],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, jwtConfig.publicKey, {
    algorithms: ["RS256"],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as RefreshTokenPayload;
};
