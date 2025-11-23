/**
 * 요청 정보를 자동으로 로깅하는 Express 미들웨어
 * - 요청 메서드, URL, IP, 사용자 ID 포함
 * - logger.ts와 연동됨
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import logger from "../utils/logger";

export const requestLogger = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const userId = req.user?.userId || "anonymous";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const method = req.method;
  const url = req.originalUrl;

  logger.info(`📥 ${method} ${url} from ${ip}`, { userId });
  next();
};
