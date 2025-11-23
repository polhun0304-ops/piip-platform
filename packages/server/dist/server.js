"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./telemetry"); // Initialize OpenTelemetry before other imports
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const prom_client_1 = require("prom-client");
const api_1 = require("@opentelemetry/api");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const spec_1 = require("./openapi/spec");
const registerFromOpenApi_1 = require("./openapi/registerFromOpenApi");
const auth_1 = require("./middleware/auth");
const error_1 = require("./middleware/error");
const cases_1 = __importDefault(require("./routes/cases"));
const reports_1 = __importDefault(require("./routes/reports"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger = (0, pino_1.default)({ level: process.env.LOG_LEVEL || "info" });
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// OpenTelemetry + Metrics instrumentation
(0, prom_client_1.collectDefaultMetrics)();
const requestCounter = new prom_client_1.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
});
const requestDuration = new prom_client_1.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});
app.use((0, pino_http_1.default)({
    logger,
    customSuccessMessage: (res) => `OK ${res.statusCode}`,
    customErrorMessage: (req, res, error) => `ERR ${res?.statusCode} ${error.message}`,
    customAttributeKeys: { reqId: "requestId" },
}));
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    const tracer = api_1.trace.getTracer("piip-server");
    const span = tracer.startSpan("http.request", {
        attributes: {
            "http.method": req.method,
            "http.route": req.path,
        },
    });
    res.on("finish", () => {
        const routePattern = (req.baseUrl || "") + (req.route?.path || "");
        const route = routePattern || req.path || "unknown";
        const labels = {
            method: req.method,
            route,
            status: String(res.statusCode),
        };
        requestCounter.inc(labels);
        const end = process.hrtime.bigint();
        const diffMs = Number(end - start) / 1000000000; // seconds
        requestDuration.observe(labels, diffMs);
        span.setAttribute("http.status_code", res.statusCode);
        span.end();
    });
    next();
});
app.get("/metrics", async (req, res) => {
    const expose = (process.env.METRICS_EXPOSE || "all").toLowerCase();
    if (expose === "internal") {
        const ip = req.ip || req.headers["x-forwarded-for"] || "";
        const isLoopback = ip.includes("127.0.0.1") || ip === "::1" || ip.startsWith("::ffff:127.");
        if (!isLoopback) {
            return res.status(403).send("metrics not exposed");
        }
    }
    res.setHeader("Content-Type", prom_client_1.register.contentType);
    res.end(await prom_client_1.register.metrics());
});
// Swagger UI
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spec_1.openapi, {
    customSiteTitle: "PIIP API Docs",
    customfavIcon: "",
}));
// JSON 스펙 직접 제공
app.get("/openapi.json", (_req, res) => res.json(spec_1.openapi));
// JWT 인증(로그인, 헬스, 문서 경로 제외)
app.use((0, auth_1.authMiddleware)([
    /^\/auth\/login$/,
    /^\/healthz$/,
    /^\/readyz$/,
    /^\/metrics$/,
    /^\/docs\/?/,
    /^\/openapi\.json$/,
    /^\/$/, // landing page
    /^\/app\.js$/,
    /^\/styles\.css$/,
    /^\/manifest\.json$/,
    /^\/assets\//, // static assets like icons
    /^\/sw\.js$/,
]));
// --- Static landing page (temporary) ---
// Serve index.html, app.js, styles.css from project root so that users can view the prototype UI
// In production you'd place these behind a proper static hosting or CDN.
const rootDir = path_1.default.resolve(__dirname, "../../../..");
app.get(["/", "/index.html"], (_req, res) => {
    res.sendFile(path_1.default.join(rootDir, "index.html"));
});
app.get("/app.js", (_req, res) => {
    res.sendFile(path_1.default.join(rootDir, "app.js"));
});
app.get("/styles.css", (_req, res) => {
    res.sendFile(path_1.default.join(rootDir, "styles.css"));
});
// Basic service worker / manifest passthrough if present
app.get(["/manifest.json", "/sw.js"], (req, res) => {
    res.sendFile(path_1.default.join(rootDir, req.path.substring(1)));
});
// 로그인: 단순 데모 (실제 비밀번호 검증/DB 생략)
app.post("/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(422).json({
            code: "VALIDATION_ERROR",
            message: "email, password are required",
        });
    }
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const role = email.includes("admin")
        ? "admin"
        : email.includes("detective")
            ? "detective"
            : "client";
    const token = jsonwebtoken_1.default.sign({ sub: "00000000-0000-0000-0000-000000000000", role }, secret, { expiresIn: "1h" });
    return res.json({
        accessToken: token,
        user: { id: "00000000-0000-0000-0000-000000000000", role, name: email },
    });
});
// 실제 구현 라우터(501 자동 라우트보다 먼저 등록)
app.use("/cases", cases_1.default);
app.use("/reports", reports_1.default);
// 자동 생성 라우트 등록(미구현 엔드포인트용)
(0, registerFromOpenApi_1.registerRoutesFromOpenAPI)(app);
// Health endpoint
app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});
// Readiness endpoint (단순히 스펙 로드 여부/필수 구성요소 확인)
app.get("/readyz", (_req, res) => {
    const ready = !!spec_1.openapi && !!logger;
    if (!ready)
        return res.status(503).json({ status: "not_ready" });
    res.json({ status: "ready", components: { openapi: true, logger: true } });
});
// 404 & 에러 핸들러
app.use(error_1.notFound);
app.use(error_1.errorHandler);
function startWithPort(base, maxAttempts = 10) {
    let attempt = 0;
    function tryListen(p) {
        const server = app.listen(p, () => {
            console.log(`PIIP server running on http://localhost:${p}`);
        });
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                attempt++;
                if (attempt >= maxAttempts) {
                    console.error(`Port in use. Gave up after ${attempt} attempts.`);
                    process.exit(1);
                }
                else {
                    console.warn(`Port ${p} in use, retrying with ${p + 1} ...`);
                    tryListen(p + 1);
                }
            }
            else {
                console.error("Server error", err);
                process.exit(1);
            }
        });
    }
    tryListen(base);
}
const basePort = Number(process.env.PORT) || 5000;
if (require.main === module) {
    startWithPort(basePort);
}
exports.default = app;
