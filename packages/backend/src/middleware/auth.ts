import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: "admin" | "detective" | "client";
    detectiveId?: string;
  };
}

/**
 * JWT 토큰 검증 미들웨어
 */
export function verifyJWT(req: AuthRequest, res: Response, next: NextFunction) {
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
    const payload = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      role: "admin" | "detective" | "client";
      detectiveId?: string;
    };
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      detectiveId: payload.detectiveId,
    };
    next();
  } catch (e) {
    console.error("JWT verification failed:", e);
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * 관리자 권한 확인 미들웨어
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
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
export function requireDetective(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
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
export function requireAdminOrSelf(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const targetUserId = req.params.id || req.params.userId;
  if (req.user.role !== "admin" && req.user.userId !== targetUserId) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}
