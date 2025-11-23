"use strict";
/**
 * 요청 정보를 자동으로 로깅하는 Express 미들웨어
 * - 요청 메서드, URL, IP, 사용자 ID 포함
 * - logger.ts와 연동됨
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const requestLogger = (req, _res, next) => {
    const userId = req.user?.userId || "anonymous";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const method = req.method;
    const url = req.originalUrl;
    logger_1.default.info(`📥 ${method} ${url} from ${ip}`, { userId });
    next();
};
exports.requestLogger = requestLogger;
