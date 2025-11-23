import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
  sub: string;
  role: "client" | "detective" | "admin";
  scopes?: string[];
}

const DEFAULT_SCOPES: Record<string, string[]> = {
  client: ["cases:read", "cases:write", "reports:read", "reports:write"],
  detective: [
    "cases:read",
    "reports:read",
    "reports:write",
    "evidences:upload",
  ],
  admin: ["admin:all"],
};

export function authMiddleware(allowAnonymousPaths: RegExp[] = []) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return (req: Request, res: Response, next: NextFunction) => {
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
      const decoded = jwt.verify(token, secret) as JWTPayload;
      const scopes = decoded.scopes?.length
        ? decoded.scopes
        : DEFAULT_SCOPES[decoded.role] || [];
      (req as any).user = {
        id: decoded.sub,
        role: decoded.role,
        scopes,
      };
      next();
    } catch (e: any) {
      return res
        .status(401)
        .json({ code: "UNAUTHORIZED", message: "Invalid token" });
    }
  };
}

export function requireScopes(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res
        .status(401)
        .json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    const hasAll = required.every(
      (s) => user.scopes.includes(s) || user.scopes.includes("admin:all")
    );
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
