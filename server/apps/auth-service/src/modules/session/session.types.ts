import type { Request } from "express";

export interface SaveRefreshToken {
  _id: string;
  refreshToken: string;
  req: Request;
}
