import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
type ValidatedRequest = Request & {
    validated?: Record<string, unknown>;
};
export declare const validateBody: (schema: ZodSchema<unknown>) => (req: ValidatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateQuery: (schema: ZodSchema<unknown>) => (req: ValidatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export {};
