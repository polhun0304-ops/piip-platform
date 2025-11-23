"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// packages/backend/src/config/mongodb.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000; // 3초
const connectDB = (retryCount = 0) => {
    return new Promise((resolve, reject) => {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            logger_1.default.error("❌ MONGO_URI 환경 변수가 설정되지 않았습니다.");
            return reject(new Error("MONGO_URI 누락"));
        }
        mongoose_1.default
            .connect(mongoURI)
            .then(() => {
            logger_1.default.info("✅ MongoDB 연결 성공");
            resolve();
        })
            .catch((error) => {
            logger_1.default.error(`❌ MongoDB 연결 실패 (${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);
            if (retryCount < MAX_RETRIES - 1) {
                logger_1.default.info(`🔁 ${RETRY_DELAY_MS / 1000}초 후 재시도합니다...`);
                setTimeout(() => {
                    connectDB(retryCount + 1).then(resolve).catch(reject);
                }, RETRY_DELAY_MS);
            }
            else {
                logger_1.default.error("🚫 최대 재시도 횟수를 초과했습니다. 서버를 종료합니다.");
                reject(error);
            }
        });
    });
};
exports.default = connectDB;
