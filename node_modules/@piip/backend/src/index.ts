// packages/backend/src/index.ts
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import * as path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import * as jwt from "jsonwebtoken";

import connectDB from "./config/mongodb";
import logger from "./utils/logger";
import { initializeDatabase } from "./config/database";

import casesRouter from "./routes/cases";
import evidenceRouter from "./routes/evidence";
import twilioRouter from "./routes/twilio";
import filesRouter from "./routes/files";
import analysisRouter from "./routes/analysis";
import intakeRouter from "./routes/intake";
import assignmentsRouter from "./routes/assignments";
import detectivesRouter from "./routes/detectives";
import detectiveMatchRouter from "./routes/detectiveMatch";
import authRouter from "./routes/auth";
import pricingRouter from "./routes/pricing";
import quotesRouter from "./routes/quotes";
import dashboardRouter from "./routes/dashboard";
import templatesRouter from "./routes/templates";
import consultationsRouter from "./routes/consultations";
import chatRouter from "./routes/chat";
import aiRouter from "./routes/ai";
import e2eeRouter from "./routes/e2ee";

import { cleanupLocalUploads } from "./services/cleanup";

// 환경 변수
const PORT = process.env.PORT || 5001;
const FILE_RETENTION_DAYS = parseInt(
  process.env.FILE_RETENTION_DAYS || "0",
  10
);
const LOCAL_AUTOCLEAN =
  (process.env.LOCAL_AUTOCLEAN || "false").toLowerCase() === "true";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// 미들웨어
app.set("trust proxy", true);
app.use(cors());
app.use(
  express.json({
    verify: (req: express.Request & { rawBody?: string }, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    verify: (req: express.Request & { rawBody?: string }, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

// 정적 파일
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// 라우터
app.use("/api/auth", authRouter);
app.use("/api/cases", casesRouter);
app.use("/api/evidence", evidenceRouter);
app.use("/api/twilio", twilioRouter);
app.use("/api/files", filesRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/intake", intakeRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/detectives", detectivesRouter);
app.use("/api/detectives/match", detectiveMatchRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/consultations", consultationsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/ai", aiRouter);
app.use("/api/e2ee", e2eeRouter);

// Socket.IO handshake authentication using JWT from handshake.auth.token or Authorization header
io.use((socket, next) => {
  try {
    const authToken =
      socket.handshake.auth &&
      (socket.handshake.auth as { token?: string }).token;
    const headerAuth = (
      socket.handshake.headers as { authorization?: string } | undefined
    )?.authorization;
    const authValue = authToken || headerAuth;

    if (!authValue) {
      // 운영 환경에서는 익명 연결을 거부하고, 개발 환경에서만 허용합니다.
      if (
        (process.env.ALLOW_ANON_SOCKET || "false").toLowerCase() === "true" ||
        process.env.NODE_ENV !== "production"
      ) {
        return next();
      }
      return next(new Error("Unauthorized: missing token"));
    }

    let token = authValue as string;
    if (token.startsWith("Bearer ")) token = token.slice("Bearer ".length);

    const secret = process.env.JWT_SECRET || "default-secret-key";
    const payload = jwt.verify(token, secret) as {
      userId?: string;
      email?: string;
      role?: string;
      detectiveId?: string;
    };

    socket.data.user = payload;
    return next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn("Socket handshake authorization failed: %s", msg);
    return next(new Error("Unauthorized"));
  }
});

// 헬스 체크
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 소켓 연결
io.on("connection", (socket) => {
  logger.info(`🔌 Client connected: ${socket.id}`);
  // join/leave rooms for case-specific chat
  socket.on("join", (caseId: string) => {
    try {
      const room = `case_${caseId}`;
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room ${room}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("join error: %s", msg);
    }
  });

  socket.on("leave", (caseId: string) => {
    try {
      const room = `case_${caseId}`;
      socket.leave(room);
      logger.info(`Socket ${socket.id} left room ${room}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("leave error: %s", msg);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`❎ Client disconnected: ${socket.id}`);
  });
});

// attach io instance so routes can emit events
app.set("io", io);

// MongoDB 연결 및 서버 시작
connectDB()
  .then(() => {
    logger.info("✅ MongoDB 연결 완료, 서버 시작 준비 중...");
    return initializeDatabase();
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 API available at http://localhost:${PORT}/api`);
    });

    // 로컬 파일 자동 정리 스케줄러
    if (LOCAL_AUTOCLEAN && FILE_RETENTION_DAYS > 0) {
      const runCleanup = async () => {
        try {
          const result = await cleanupLocalUploads(FILE_RETENTION_DAYS);
          logger.info(
            `🧹 Local cleanup done: removedFiles=${result.removedFiles}, removedRows=${result.removedRows}`
          );
        } catch (e: unknown) {
          const errorMessage =
            e instanceof Error ? e.message : "Unknown error occurred";
          logger.error("Local cleanup failed:", errorMessage);
        }
      };
      setTimeout(runCleanup, 60 * 1000);
      setInterval(runCleanup, 24 * 60 * 60 * 1000);
    } else if (process.env.STORAGE_PROVIDER === "s3") {
      logger.info(
        "ℹ️ S3 storage in use. Configure S3 Lifecycle rules at the bucket level for retention. Set S3_AUTOCLEAN=true only if you explicitly add deletion logic."
      );
    }
  })
  .catch((err) => {
    logger.error(
      `❌ 서버 시작 중단: ${err instanceof Error ? err.message : "Unknown error"}`
    );
    process.exit(1);
  });
