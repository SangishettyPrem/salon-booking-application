import type { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  return res.status(404).json({
    message: "Route Not Found",
    code: "ROUTE_NOT_FOUND",
    success: false,
  });
};
