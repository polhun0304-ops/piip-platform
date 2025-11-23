"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
function notFound(req, res) {
    res.status(404).json({ code: "NOT_FOUND", message: "Route not found" });
}
function errorHandler(err, req, res, _next) {
    const status = err?.status || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ code: "INTERNAL_ERROR", message });
}
