/**
 * Winston 기반 로깅 설정 파일
 * - 콘솔 출력
 * - 날짜별 로그 파일 저장
 * - 고정 로그 파일 저장
 * - JSON 형식 로그
 * - 사용자 ID 포함
 * - 오래된 로그 자동 삭제 (100일 경과 시)
 */

import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

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
      } catch (err) {
        console.error(`⚠️ 로그 삭제 실패: ${file}`, (err as Error).message);
      }
    }
  });
};

deleteOldLogs();

// 로그 레벨 설정 (.env에서 LOG_LEVEL 지정 가능)
const logLevel = process.env.LOG_LEVEL || 'info';

// 사용자 ID를 메시지에 포함시키는 포맷
const addUserIdFormat = format((info) => {
  if (info.userId) {
    info.message = `[userId=${info.userId}] ${info.message}`;
  }
  return info;
});

// Winston 로거 생성
const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    addUserIdFormat(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: dateLogPath }),
    new transports.File({ filename: dateErrorLogPath, level: 'error' }),
    new transports.File({ filename: fixedLogPath }),
    new transports.File({ filename: fixedErrorLogPath, level: 'error' }),
  ],
});

export default logger;
