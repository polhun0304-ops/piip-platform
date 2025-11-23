import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

// Local request type that carries validated payloads
type ValidatedRequest = Request & { validated?: Record<string, unknown> };

export const validateBody =
  (schema: ZodSchema<unknown>) =>
  (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: result.error.flatten() });
    }
    req.validated = { ...(req.validated ?? {}), body: result.data };
    return next();
  };

export const validateQuery =
  (schema: ZodSchema<unknown>) =>
  (req: ValidatedRequest, res: Response, next: NextFunction) => {
    // Express의 req.query는 문자열 기반이므로 Zod에서 coerce를 사용해 파싱합니다.
    const result = schema.safeParse(req.query ?? {});
    if (!result.success) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: result.error.flatten() });
    }
    req.validated = { ...(req.validated ?? {}), query: result.data };
    return next();
  };
