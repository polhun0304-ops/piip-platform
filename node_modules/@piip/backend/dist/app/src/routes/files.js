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
const express_1 = require("express");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const database_1 = require("../config/database");
const Evidence_1 = require("../entities/Evidence");
const storage_1 = require("../services/storage");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
const SIGNED_URL_EXPIRES_SECONDS = parseInt(process.env.SIGNED_URL_EXPIRES_SECONDS || "300", 10);
// apply auth for all endpoints in this router
router.use(auth_1.verifyJWT);
// GET /api/files/:id -> { url } or proxy hint
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const evidenceRepo = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const ev = await evidenceRepo.findOneBy({ id });
        if (!ev || !ev.filePath)
            return res.status(404).json({ error: "Not found" });
        // s3 private: s3://bucket/key
        const allowSigned = (process.env.FILES_SIGNED_URLS || "enabled").toLowerCase() !== "disabled";
        const s3 = (0, storage_1.parseS3Url)(ev.filePath);
        if (s3) {
            if (!allowSigned) {
                return res.json({ url: `/api/files/${id}/stream`, proxy: true });
            }
            const url = await (0, storage_1.getS3SignedUrl)({
                bucket: s3.bucket,
                key: s3.key,
                expiresIn: SIGNED_URL_EXPIRES_SECONDS,
            });
            return res.json({
                url,
                expiresInSeconds: SIGNED_URL_EXPIRES_SECONDS,
                proxy: false,
            });
        }
        // http(s) - already public
        if (/^https?:\/\//i.test(ev.filePath)) {
            return res.json({ url: ev.filePath, proxy: false });
        }
        // local: '/uploads/...'
        return res.json({ url: ev.filePath, proxy: false });
    }
    catch (e) {
        console.error("files:get url error", e);
        res
            .status(500)
            .json({ error: e.message || "Internal server error" });
    }
});
// GET /api/files/:id/stream -> proxy stream
router.get("/:id/stream", async (req, res) => {
    try {
        const { id } = req.params;
        const evidenceRepo = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const ev = await evidenceRepo.findOneBy({ id });
        if (!ev || !ev.filePath)
            return res.status(404).json({ error: "Not found" });
        const s3 = (0, storage_1.parseS3Url)(ev.filePath);
        if (s3) {
            const obj = await (0, storage_1.getS3ObjectStream)({ bucket: s3.bucket, key: s3.key });
            if (obj.contentType)
                res.setHeader("Content-Type", obj.contentType);
            if (obj.contentLength)
                res.setHeader("Content-Length", obj.contentLength.toString());
            return obj.stream.pipe(res);
        }
        if (/^https?:\/\//i.test(ev.filePath)) {
            // For external http(s), redirect instead of proxy for simplicity
            return res.redirect(ev.filePath);
        }
        // local file under /uploads
        const rel = ev.filePath.replace(/^\//, "");
        const full = path.join(__dirname, "..", rel);
        if (!fs.existsSync(full))
            return res.status(404).json({ error: "File missing" });
        return fs.createReadStream(full).pipe(res);
    }
    catch (e) {
        console.error("files:stream error", e);
        res
            .status(500)
            .json({ error: e.message || "Internal server error" });
    }
});
// POST /api/files/upload -> upload file
router.post("/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        res.status(200).send({ filename: req.file.filename });
    }
    catch (error) {
        console.error("File upload error:", error);
        res.status(500).send("Internal server error.");
    }
});
exports.default = router;
