import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Validation Error",
        });
      }
      next(error);
    }
  };
};
