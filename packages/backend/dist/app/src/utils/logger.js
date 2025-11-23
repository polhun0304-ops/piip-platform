"use strict";
/**
 * Winston 기반 로깅 설정 파일
 * - 콘솔 출력
 * - 날짜별 로그 파일 저장
 * - 고정 로그 파일 저장
 * - JSON 형식 로그
 * - 사용자 ID 포함
 * - 오래된 로그 자동 삭제 (100일 경과 시)
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 로그 저장 디렉토리 생성
const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}
// 오늘 날짜 기반 파일명 생성
const today = new Date().toISOString().split('T')[0];
const dateLogPath = path.join(logDir, `${today}.log`);
const dateErrorLogPath = path.join(logDir, `${today}.error.log`);
const fixedLogPath = path.join(logDir, 'server.log');
const fixedErrorLogPath = path.join(logDir, 'error.log');
// 날짜별 로그 중 100일 이상 지난 파일 삭제
const MAX_LOG_AGE_DAYS = 100;
const deleteOldLogs = () => {
    const files = fs.readdirSync(logDir);
    const now = Date.now();
    files.forEach((file) => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        const ageInDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > MAX_LOG_AGE_DAYS && file.match(/^\d{4}-\d{2}-\d{2}/)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`🗑️ 오래된 로그 삭제됨: ${file}`);
            }
            catch (err) {
                console.error(`⚠️ 로그 삭제 실패: ${file}`, err.message);
            }
        }
    });
};
deleteOldLogs();
// 로그 레벨 설정 (.env에서 LOG_LEVEL 지정 가능)
const logLevel = process.env.LOG_LEVEL || 'info';
// 사용자 ID를 메시지에 포함시키는 포맷
const addUserIdFormat = (0, winston_1.format)((info) => {
    if (info.userId) {
        info.message = `[userId=${info.userId}] ${info.message}`;
    }
    return info;
});
// Winston 로거 생성
const logger = (0, winston_1.createLogger)({
    level: logLevel,
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), addUserIdFormat(), winston_1.format.json()),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: dateLogPath }),
        new winston_1.transports.File({ filename: dateErrorLogPath, level: 'error' }),
        new winston_1.transports.File({ filename: fixedLogPath }),
        new winston_1.transports.File({ filename: fixedErrorLogPath, level: 'error' }),
    ],
});
exports.default = logger;
