"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = verifyJWT;
exports.requireAdmin = requireAdmin;
exports.requireDetective = requireDetective;
exports.requireAdminOrSelf = requireAdminOrSelf;
const jwt = __importStar(require("jsonwebtoken"));
/**
 * JWT 토큰 검증 미들웨어
 */
function verifyJWT(req, res, next) {
    try {
        const auth = req.header("authorization") || req.header("Authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const token = auth.slice("Bearer ".length);
        const secret = process.env.JWT_SECRET || "default-secret-key";
        if (!secret) {
            console.error("JWT_SECRET is not set");
            return res.status(500).json({ error: "Auth not configured" });
        }
        const payload = jwt.verify(token, secret);
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            detectiveId: payload.detectiveId,
        };
        next();
    }
    catch (e) {
        console.error("JWT verification failed:", e);
        return res.status(401).json({ error: "Invalid token" });
    }
}
/**
 * 관리자 권한 확인 미들웨어
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
}
/**
 * 탐정 권한 확인 미들웨어
 */
function requireDetective(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== "detective" && req.user.role !== "admin") {
        return res.status(403).json({ error: "Detective access required" });
    }
    next();
}
/**
 * 관리자 또는 본인 확인 미들웨어
 */
function requireAdminOrSelf(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const targetUserId = req.params.id || req.params.userId;
    if (req.user.role !== "admin" && req.user.userId !== targetUserId) {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
