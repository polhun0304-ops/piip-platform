"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireScopes = requireScopes;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DEFAULT_SCOPES = {
    client: ["cases:read", "cases:write", "reports:read", "reports:write"],
    detective: [
        "cases:read",
        "reports:read",
        "reports:write",
        "evidences:upload",
    ],
    admin: ["admin:all"],
};
function authMiddleware(allowAnonymousPaths = []) {
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    return (req, res, next) => {
        if (allowAnonymousPaths.some((re) => re.test(req.path))) {
            return next();
        }
        const header = req.header("authorization") || req.header("Authorization");
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Missing or invalid Authorization header",
            });
        }
        const token = header.substring("Bearer ".length);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const scopes = decoded.scopes?.length
                ? decoded.scopes
                : DEFAULT_SCOPES[decoded.role] || [];
            req.user = {
                id: decoded.sub,
                role: decoded.role,
                scopes,
            };
            next();
        }
        catch (e) {
            return res
                .status(401)
                .json({ code: "UNAUTHORIZED", message: "Invalid token" });
        }
    };
}
function requireScopes(required) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res
                .status(401)
                .json({ code: "UNAUTHORIZED", message: "Not authenticated" });
        }
        const hasAll = required.every((s) => user.scopes.includes(s) || user.scopes.includes("admin:all"));
        if (!hasAll) {
            return res
                .status(403)
                .json({
                code: "FORBIDDEN",
                message: "Insufficient scopes",
                details: { required, have: user.scopes },
            });
        }
        next();
    };
}
