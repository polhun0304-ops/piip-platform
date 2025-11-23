import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(422).json({
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
        details: result.error.flatten(),
      });
    }
    req.query = result.data as any;
    next();
  };
}

export function validateParams(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(422).json({
        code: "VALIDATION_ERROR",
        message: "Invalid path parameters",
        details: result.error.flatten(),
      });
    }
    req.params = result.data as any;
    next();
  };
}
