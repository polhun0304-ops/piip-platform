import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
export declare const validateBody: (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateQuery: (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
