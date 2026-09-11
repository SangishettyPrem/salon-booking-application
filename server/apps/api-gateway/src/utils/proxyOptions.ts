import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";
import type { ProxyOptions } from "express-http-proxy";

export const proxyOptions: ProxyOptions = {
  proxyReqPathResolver: (req: Request) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err: any, res: Response, next: NextFunction) => {
    if (err) {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({
        message: err.message || `Internal server error`,
        error: err.message,
      });
    } else {
      next();
    }
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers["content-type"]) {
      proxyReqOpts.headers["content-type"] = srcReq.headers["content-type"];
    }
    if (srcReq.user) {
      proxyReqOpts.headers["x-user-id"] = srcReq.user._id;
      proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
      if (srcReq.user.email) {
        proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
      }
    }
    return proxyReqOpts;
  },
  proxyReqBodyDecorator: (proxyReqBody, srcReq) => {
    return proxyReqBody;
  },
};
