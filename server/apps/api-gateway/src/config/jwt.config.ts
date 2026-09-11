import fs from "node:fs";
import path from "node:path";
import { env } from "@/config/env.config.js";

export const jwtConfig = {
  publicKey: fs.readFileSync(
    path.resolve(process.cwd(), env.jwt.accessPublicKeyPath),
    "utf8",
  ),
  algorithm: "RS256" as const,
  issuer: env.jwt.issuer,
  audience: env.jwt.audience,
};

