import { env } from "@/config/env.config.js";
import type { StringValue } from "ms";

const publicKey = env.jwt.jwtPublicKey.replace(/\\n/g, "\n");

const privateKey = env.jwt.jwtPrivateKey.replace(/\\n/g, "\n");

export const jwtConfig = {
  privateKey: privateKey,
  publicKey: publicKey,
  algorithm: "RS256" as const,
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
  accessTokenExpiresIn: env.jwt.accessExpiresIn as StringValue,
};
