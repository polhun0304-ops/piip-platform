import { Request, Response, NextFunction } from "express";
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
export declare function verifyJWT(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
/**
 * 관리자 권한 확인 미들웨어
 */
export declare function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
/**
 * 탐정 권한 확인 미들웨어
 */
export declare function requireDetective(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
/**
 * 관리자 또는 본인 확인 미들웨어
 */
export declare function requireAdminOrSelf(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
