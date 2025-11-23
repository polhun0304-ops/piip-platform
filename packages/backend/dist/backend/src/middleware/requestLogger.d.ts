/**
 * 요청 정보를 자동으로 로깅하는 Express 미들웨어
 * - 요청 메서드, URL, IP, 사용자 ID 포함
 * - logger.ts와 연동됨
 */
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
export declare const requestLogger: (req: AuthRequest, _res: Response, next: NextFunction) => void;
