import fs from "node:fs";
import path from "node:path";
import { env } from "@/config/env.config.js";
import type { StringValue } from "ms";

export const jwtConfig = {
  privateKey: fs.readFileSync(
    path.resolve(process.cwd(), env.jwt.accessPrivateKeyPath),
    "utf8",
  ),
  publicKey: fs.readFileSync(
    path.resolve(process.cwd(), env.jwt.accessPublicKeyPath),
    "utf8",
  ),
  algorithm: "RS256" as const,
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
  accessTokenExpiresIn: env.jwt.accessExpiresIn as StringValue,
};

