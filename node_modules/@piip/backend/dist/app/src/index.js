"use strict";
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
// packages/backend/src/index.ts
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path = __importStar(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongodb_1 = __importDefault(require("./config/mongodb"));
const logger_1 = __importDefault(require("./utils/logger"));
const database_1 = require("./config/database");
const cases_1 = __importDefault(require("./routes/cases"));
const evidence_1 = __importDefault(require("./routes/evidence"));
const twilio_1 = __importDefault(require("./routes/twilio"));
const files_1 = __importDefault(require("./routes/files"));
const analysis_1 = __importDefault(require("./routes/analysis"));
const intake_1 = __importDefault(require("./routes/intake"));
const assignments_1 = __importDefault(require("./routes/assignments"));
const detectives_1 = __importDefault(require("./routes/detectives"));
const detectiveMatch_1 = __importDefault(require("./routes/detectiveMatch"));
const auth_1 = __importDefault(require("./routes/auth"));
const pricing_1 = __importDefault(require("./routes/pricing"));
const quotes_1 = __importDefault(require("./routes/quotes"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const templates_1 = __importDefault(require("./routes/templates"));
const consultations_1 = __importDefault(require("./routes/consultations"));
const cleanup_1 = require("./services/cleanup");
// 환경 변수
const PORT = process.env.PORT || 5001;
const FILE_RETENTION_DAYS = parseInt(process.env.FILE_RETENTION_DAYS || '0', 10);
const LOCAL_AUTOCLEAN = (process.env.LOCAL_AUTOCLEAN || 'false').toLowerCase() === 'true';
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});
// 미들웨어
app.set('trust proxy', true);
app.use((0, cors_1.default)());
app.use(express_1.default.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString('utf8');
    },
}));
app.use(express_1.default.urlencoded({
    extended: true,
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString('utf8');
    },
}));
// 정적 파일
app.use('/uploads', express_1.default.static(path.join(__dirname, '..', 'uploads')));
app.use('/public', express_1.default.static(path.join(__dirname, '..', 'public')));
// 라우터
app.use('/api/auth', auth_1.default);
app.use('/api/cases', cases_1.default);
app.use('/api/evidence', evidence_1.default);
app.use('/api/twilio', twilio_1.default);
app.use('/api/files', files_1.default);
app.use('/api/analysis', analysis_1.default);
app.use('/api/intake', intake_1.default);
app.use('/api/assignments', assignments_1.default);
app.use('/api/detectives', detectives_1.default);
app.use('/api/detectives/match', detectiveMatch_1.default);
app.use('/api/pricing', pricing_1.default);
app.use('/api/quotes', quotes_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/templates', templates_1.default);
app.use('/api/consultations', consultations_1.default);
// 헬스 체크
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 소켓 연결
io.on('connection', (socket) => {
    logger_1.default.info(`🔌 Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        logger_1.default.info(`❎ Client disconnected: ${socket.id}`);
    });
});
// MongoDB 연결 및 서버 시작
(0, mongodb_1.default)()
    .then(() => {
    logger_1.default.info('✅ MongoDB 연결 완료, 서버 시작 준비 중...');
    return (0, database_1.initializeDatabase)();
})
    .then(() => {
    httpServer.listen(PORT, () => {
        logger_1.default.info(`🚀 Server running on port ${PORT}`);
        logger_1.default.info(`📡 API available at http://localhost:${PORT}/api`);
    });
    // 로컬 파일 자동 정리 스케줄러
    if (LOCAL_AUTOCLEAN && FILE_RETENTION_DAYS > 0) {
        const runCleanup = async () => {
            try {
                const result = await (0, cleanup_1.cleanupLocalUploads)(FILE_RETENTION_DAYS);
                logger_1.default.info(`🧹 Local cleanup done: removedFiles=${result.removedFiles}, removedRows=${result.removedRows}`);
            }
            catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
                logger_1.default.error('Local cleanup failed:', errorMessage);
            }
        };
        setTimeout(runCleanup, 60 * 1000);
        setInterval(runCleanup, 24 * 60 * 60 * 1000);
    }
    else if (process.env.STORAGE_PROVIDER === 's3') {
        logger_1.default.info('ℹ️ S3 storage in use. Configure S3 Lifecycle rules at the bucket level for retention. Set S3_AUTOCLEAN=true only if you explicitly add deletion logic.');
    }
})
    .catch((err) => {
    logger_1.default.error(`❌ 서버 시작 중단: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
});
