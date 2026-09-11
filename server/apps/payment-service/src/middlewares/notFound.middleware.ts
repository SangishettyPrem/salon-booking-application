import type { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on Payment Service`,
  });
};
