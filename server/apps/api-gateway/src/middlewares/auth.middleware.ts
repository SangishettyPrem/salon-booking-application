import { jwtConfig } from "@/config/jwt.config.js";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AccessTokenPayload extends jwt.JwtPayload {
  sub: string;
  role: string;
  type: "access";
  email?: string | undefined;
}

declare global {
  namespace Express {
    interface Request {
      user?:
        | {
            _id: string;
            role: string;
            email?: string | undefined;
          }
        | undefined;
    }
  }
}

// Attaches user to req.user if valid token exists in header or cookies (does not block unauthenticated public requests)
export const attachUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    } else if (req.cookies?.["access_token"] || req.cookies?.["at"]) {
      token = req.cookies?.["access_token"] || req.cookies?.["at"];
    }

    if (token) {
      const payload = jwt.verify(token, jwtConfig.publicKey, {
        algorithms: ["RS256"],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as unknown as AccessTokenPayload;

      if (payload && (payload.type === "access" || payload.sub)) {
        req.user = {
          _id: payload.sub,
          role: payload.role || "customer",
          email: payload.email,
        };
      }
    }
  } catch (error) {
    // If token expired/invalid, do not crash; downstream endpoints will decide if auth is mandatory
  }
  next();
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    } else if (req.cookies?.["access_token"] || req.cookies?.["at"]) {
      token = req.cookies?.["access_token"] || req.cookies?.["at"];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payload = jwt.verify(token, jwtConfig.publicKey, {
      algorithms: ["RS256"],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as unknown as AccessTokenPayload;

    if (payload.type !== "access" && !payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    req.user = {
      _id: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
