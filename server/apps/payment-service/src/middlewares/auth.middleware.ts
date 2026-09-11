import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@/handlers/AppError.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: string;
        email?: string;
      };
    }
  }
}

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const _id = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    if (_id && typeof _id === "string") {
      req.user = {
        _id,
        role: (role as string) || "customer",
      };
      return next();
    }

    // Direct Bearer token fallback
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded: any = jwt.decode(token);
        if (decoded && (decoded.sub || decoded._id)) {
          req.user = {
            _id: decoded.sub || decoded._id,
            role: decoded.role || "customer",
            email: decoded.email,
          };
          return next();
        }
      }
    }

    throw new AppError("Authentication required", 401);
  } catch (error) {
    next(error);
  }
};

export const allowedRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};
