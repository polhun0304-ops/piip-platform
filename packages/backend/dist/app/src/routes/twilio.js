"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const Evidence_1 = require("../entities/Evidence");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const storage_1 = require("../services/storage");
const analysisRunner_1 = require("../services/analysisRunner");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require("twilio");
const router = (0, express_1.Router)();
// Expect env: TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_AUTH_TOKEN
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const API_KEY_SID = process.env.TWILIO_API_KEY_SID || "";
const API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET || "";
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
// POST /api/twilio/video/token  { identity, roomName }
router.post("/video/token", async (req, res) => {
    try {
        const { identity, roomName } = req.body;
        if (!ACCOUNT_SID || !API_KEY_SID || !API_KEY_SECRET) {
            return res
                .status(500)
                .json({ error: "Twilio environment variables missing" });
        }
        if (!identity || !roomName) {
            return res
                .status(400)
                .json({ error: "identity and roomName are required" });
        }
        const AccessToken = twilio.jwt.AccessToken;
        const VideoGrant = twilio.jwt.AccessToken.VideoGrant;
        const token = new AccessToken(ACCOUNT_SID, API_KEY_SID, API_KEY_SECRET, {
            identity,
            ttl: 60 * 60, // 1 hour
        });
        token.addGrant(new VideoGrant({ room: roomName }));
        res.json({ token: token.toJwt() });
    }
    catch (e) {
        console.error("Error creating video token:", e);
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
// Webhook: Twilio recording/composition events
// Configure Twilio Console to call this endpoint.
router.post("/webhook", async (req, res) => {
    try {
        const VALIDATION_MODE = (process.env.TWILIO_WEBHOOK_VALIDATION || "permissive").toLowerCase();
        // Signature validation
        if (VALIDATION_MODE === "strict") {
            if (!AUTH_TOKEN) {
                console.error("TWILIO_WEBHOOK_VALIDATION=strict but TWILIO_AUTH_TOKEN is not set");
                return res.status(500).json({ ok: false });
            }
            const signature = (req.header("X-Twilio-Signature") ||
                req.header("x-twilio-signature") ||
                "");
            const host = process.env.PUBLIC_BASE_URL
                ? process.env.PUBLIC_BASE_URL.replace(/\/$/, "")
                : `${req.protocol || req.protocol}://${req.get("host")}`;
            const fullUrl = `${host}${req.originalUrl || req.originalUrl}`;
            const contentType = req.headers["content-type"] || "";
            const toValidate = contentType.startsWith("application/json")
                ? req.rawBody || JSON.stringify(req.body)
                : req.body || {};
            const isValid = twilio.validateRequest(AUTH_TOKEN, signature, fullUrl, toValidate);
            if (!isValid)
                return res.status(403).json({ ok: false });
        }
        else if (AUTH_TOKEN) {
            const signature = (req.header("X-Twilio-Signature") ||
                req.header("x-twilio-signature") ||
                "");
            const host = process.env.PUBLIC_BASE_URL
                ? process.env.PUBLIC_BASE_URL.replace(/\/$/, "")
                : `${req.protocol || req.protocol}://${req.get("host")}`;
            const fullUrl = `${host}${req.originalUrl || req.originalUrl}`;
            // If JSON, use raw body string; otherwise params object
            const contentType = req.headers["content-type"] || "";
            const toValidate = contentType.startsWith("application/json")
                ? req.rawBody || JSON.stringify(req.body)
                : req.body || {};
            const isValid = twilio.validateRequest(AUTH_TOKEN, signature, fullUrl, toValidate);
            if (!isValid) {
                console.warn("Twilio webhook signature validation failed", {
                    fullUrl,
                });
                return res.status(403).json({ ok: false });
            }
        }
        else {
            console.warn("TWILIO_AUTH_TOKEN not set or validation not strict - skipping webhook signature validation (dev mode)");
        }
        const body = req.body || {};
        // Accept both Video composition completed and Voice recording completed
        // Extract media URL/links
        let mediaUrl;
        let label = "Twilio Recording";
        if (body.MediaUrl) {
            mediaUrl = body.MediaUrl;
            label = body.RecordingSid
                ? `Voice Recording ${body.RecordingSid}`
                : label;
        }
        if (!mediaUrl && body.CompositionSid && body.Links?.media) {
            // e.g., Video compositions API "links.media"
            mediaUrl = body.Links.media; // This may be an API URL that requires auth
            label = `Video Composition ${body.CompositionSid}`;
        }
        if (!mediaUrl) {
            console.log("Twilio webhook: no media URL in payload");
            return res.status(200).json({ ok: true });
        }
        // Download with Twilio basic auth if needed
        const auth = ACCOUNT_SID && AUTH_TOKEN
            ? { username: ACCOUNT_SID, password: AUTH_TOKEN }
            : undefined;
        const response = await axios_1.default.get(mediaUrl, {
            responseType: "stream",
            auth,
            validateStatus: () => true,
        });
        if (response.status >= 400) {
            console.error("Failed to fetch media from Twilio:", response.status, mediaUrl);
            return res.status(200).json({ ok: true });
        }
        const safeFilename = `${(0, crypto_1.randomUUID)()}.bin`;
        const { urlOrPath } = await (0, storage_1.saveObject)({
            stream: response.data,
            filename: safeFilename,
            contentType: response.headers["content-type"],
        });
        // Guess simple type
        const contentType = response.headers["content-type"];
        let type = "문서";
        if (contentType?.startsWith("image/"))
            type = "이미지";
        else if (contentType?.startsWith("audio/"))
            type = "오디오";
        else if (contentType?.startsWith("video/"))
            type = "비디오";
        const repo = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const saved = await repo.save(repo.create({ label, type, filePath: urlOrPath }));
        console.log("Twilio media saved to evidence:", saved.id);
        if ((process.env.ANALYSIS_ENABLED || "true").toLowerCase() === "true") {
            (0, analysisRunner_1.enqueueForEvidence)(saved.id).catch(() => { });
            // if case exists, also trigger case-level aggregate analysis
            if (saved.caseId) {
                (0, analysisRunner_1.enqueueForCase)(saved.caseId).catch(() => { });
            }
        }
        res.status(200).json({ ok: true });
    }
    catch (e) {
        console.error("Twilio webhook error:", e);
        res.status(200).json({ ok: true });
    }
});
exports.default = router;
