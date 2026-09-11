import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.token.js";
import { AppError } from "@/handlers/AppError.js";

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Check x-user-id header from gateway
    const headerUserId = req.headers["x-user-id"];
    const headerUserRole = req.headers["x-user-role"];

    if (headerUserId && typeof headerUserId === "string") {
      req.user = {
        _id: headerUserId,
        role: (headerUserRole as string) || "customer",
      };
      return next();
    }

    // 2. Check Authorization header
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.split(" ")[1];
      let payload;
      if (token) {
        try {
          payload = verifyAccessToken(token);
        } catch (error: any) {
          if (error.name === "TokenExpiredError") {
            throw new AppError("Token Expired", 401, "ACCESS_TOKEN_EXPIRED");
          }
          next(error);
        }
        if (payload && payload.type === "access") {
          req.user = {
            _id: payload.sub,
            role: payload.role,
          };
          return next();
        }
      }
    }

    return next();
  } catch (error) {
    return next();
  }
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  next();
};
