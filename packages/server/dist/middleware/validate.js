"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
function validateBody(schema) {
    return (req, res, next) => {
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
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            return res.status(422).json({
                code: "VALIDATION_ERROR",
                message: "Invalid query parameters",
                details: result.error.flatten(),
            });
        }
        req.query = result.data;
        next();
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            return res.status(422).json({
                code: "VALIDATION_ERROR",
                message: "Invalid path parameters",
                details: result.error.flatten(),
            });
        }
        req.params = result.data;
        next();
    };
}
