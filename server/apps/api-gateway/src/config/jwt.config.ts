import { env } from "@/config/env.config.js";

const publicKey = env.jwt.jwtPublicKey.replace(/\\n/g, "\n");
export const jwtConfig = {
  publicKey: publicKey,
  algorithm: "RS256" as const,
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
};
