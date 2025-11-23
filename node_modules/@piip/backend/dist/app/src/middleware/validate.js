"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
        return res
            .status(400)
            .json({ error: "Validation failed", details: result.error.flatten() });
    }
    req.validated = { ...req.validated, body: result.data };
    return next();
};
exports.validateBody = validateBody;
const validateQuery = (schema) => (req, res, next) => {
    // Express의 req.query는 문자열 기반이므로 Zod에서 coerce를 사용해 파싱합니다.
    const result = schema.safeParse(req.query ?? {});
    if (!result.success) {
        return res
            .status(400)
            .json({ error: "Validation failed", details: result.error.flatten() });
    }
    req.validated = { ...req.validated, query: result.data };
    return next();
};
exports.validateQuery = validateQuery;
