// packages/backend/src/config/mongodb.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000; // 3초

const connectDB = (retryCount = 0): Promise<void> => {
  return new Promise((resolve, reject) => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      logger.error("❌ MONGO_URI 환경 변수가 설정되지 않았습니다.");
      return reject(new Error("MONGO_URI 누락"));
    }

    mongoose
      .connect(mongoURI)
      .then(() => {
        logger.info("✅ MongoDB 연결 성공");
        resolve();
      })
      .catch((error) => {
        logger.error(`❌ MongoDB 연결 실패 (${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);

        if (retryCount < MAX_RETRIES - 1) {
          logger.info(`🔁 ${RETRY_DELAY_MS / 1000}초 후 재시도합니다...`);
          setTimeout(() => {
            connectDB(retryCount + 1).then(resolve).catch(reject);
          }, RETRY_DELAY_MS);
        } else {
          logger.error("🚫 최대 재시도 횟수를 초과했습니다. 서버를 종료합니다.");
          reject(error);
        }
      });
  });
};

export default connectDB;
