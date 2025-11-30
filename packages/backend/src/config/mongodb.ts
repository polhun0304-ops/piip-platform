// packages/backend/src/config/mongodb.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000; // 3초

/**
 * Connect to MongoDB. In development, if the configured host is not resolvable
 * or connection repeatedly fails, fall back to an in-memory MongoDB instance
 * (mongodb-memory-server) to improve local dev/test stability.
 */
const connectDB = async (retryCount = 0): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    logger.error("❌ MONGO_URI 환경 변수가 설정되지 않았습니다.");
    throw new Error("MONGO_URI 누락");
  }

  try {
    await mongoose.connect(mongoURI);
    logger.info("✅ MongoDB 연결 성공");
    return;
  } catch (error: any) {
    logger.error(
      `❌ MongoDB 연결 실패 (${retryCount + 1}/${MAX_RETRIES}): ${error?.message || error}`
    );

    if (retryCount < MAX_RETRIES - 1) {
      logger.info(`🔁 ${RETRY_DELAY_MS / 1000}초 후 재시도합니다...`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    // If we're here, retries exhausted. In non-production, try an in-memory fallback.
    if (process.env.NODE_ENV !== "production") {
      try {
        logger.warn(
          "⚠️ Mongo 연결 실패 - 개발 모드에서 메모리 MongoDB로 폴백을 시도합니다."
        );
        // dynamic import to avoid requiring the package in production
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        logger.info(`🧪 mongodb-memory-server 시작: ${uri}`);
        await mongoose.connect(uri);
        logger.info("✅ MongoMemoryServer 연결 성공 (개발 폴백)");
        return;
      } catch (memErr: any) {
        logger.error(
          "❌ mongodb-memory-server로의 폴백에 실패했습니다:",
          memErr?.message || memErr
        );
        throw memErr;
      }
    }

    logger.error("🚫 최대 재시도 횟수를 초과했습니다. 서버를 종료합니다.");
    throw error;
  }
};

export default connectDB;
