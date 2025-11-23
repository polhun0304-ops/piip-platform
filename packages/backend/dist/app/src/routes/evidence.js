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
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
// no direct fs writes here; storage service abstracts persistence
const database_1 = require("../config/database");
const axios_1 = __importDefault(require("axios"));
const Evidence_1 = require("../entities/Evidence");
const storage_1 = require("../services/storage");
const analysisRunner_1 = require("../services/analysisRunner");
const router = (0, express_1.Router)();
// 업로드 스토리지 설정: 메모리 기반으로 받아서 storage 서비스로 저장
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
        // 허용 MIME 타입 간단 필터링
        const allowed = ["image/", "video/", "audio/", "application/", "text/"];
        if (allowed.some((p) => file.mimetype.startsWith(p)))
            return cb(null, true);
        cb(new Error("Unsupported file type"));
    },
});
// GET /api/evidence - 모든 증거 조회
router.get("/", async (req, res) => {
    try {
        const { caseId } = req.query;
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const queryBuilder = evidenceRepository.createQueryBuilder("evidence");
        if (caseId) {
            queryBuilder.where("evidence.caseId = :caseId", { caseId });
        }
        const evidence = await queryBuilder
            .orderBy("evidence.createdAt", "DESC")
            .getMany();
        res.json(evidence);
    }
    catch (error) {
        console.error("Error fetching evidence:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /api/evidence/:id - 특정 증거 조회
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const evidence = await evidenceRepository.findOne({
            where: { id },
            relations: ["case"],
        });
        if (!evidence) {
            return res.status(404).json({ error: "Evidence not found" });
        }
        res.json(evidence);
    }
    catch (error) {
        console.error("Error fetching evidence:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /api/evidence - 새 증거 생성
router.post("/", async (req, res) => {
    try {
        const { label, type, date, filePath, caseId } = req.body;
        if (!label || !type) {
            return res.status(400).json({ error: "Label and type are required" });
        }
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const newEvidence = evidenceRepository.create({
            label,
            type,
            date,
            filePath,
            caseId,
        });
        const savedEvidence = await evidenceRepository.save(newEvidence);
        res.status(201).json(savedEvidence);
    }
    catch (error) {
        console.error("Error creating evidence:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /api/evidence/upload - 파일 업로드 + 증거 생성 (multipart/form-data)
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const { label, date, caseId } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "File is required" });
        }
        // 타입 추론
        const mime = req.file.mimetype;
        let type = "문서";
        if (mime.startsWith("image/"))
            type = "이미지";
        else if (mime.startsWith("audio/"))
            type = "오디오";
        else if (mime.startsWith("video/"))
            type = "비디오";
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        // storage 서비스로 저장 (S3 또는 로컬)
        const { urlOrPath } = await (0, storage_1.saveObject)({
            buffer: req.file.buffer,
            filename: req.file.originalname,
            caseId,
            contentType: req.file.mimetype,
        });
        const newEvidence = evidenceRepository.create({
            label: label || req.file.originalname,
            type,
            date,
            filePath: urlOrPath,
            caseId,
        });
        const saved = await evidenceRepository.save(newEvidence);
        if ((process.env.ANALYSIS_ENABLED || "true").toLowerCase() === "true") {
            // fire-and-forget per-evidence analysis
            (0, analysisRunner_1.enqueueForEvidence)(saved.id).catch((error) => {
                console.error("Error enqueuing evidence analysis:", error);
            });
            // if case exists, also trigger case-level aggregate analysis
            if (saved.caseId) {
                (0, analysisRunner_1.enqueueForCase)(saved.caseId).catch((error) => {
                    console.error("Error enqueuing case analysis:", error);
                });
            }
        }
        res.status(201).json(saved);
    }
    catch (error) {
        console.error("Error uploading evidence:", error);
        res
            .status(500)
            .json({ error: error.message || "Internal server error" });
    }
});
// PUT /api/evidence/:id - 증거 수정
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { label, type, date, filePath, caseId } = req.body;
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const evidence = await evidenceRepository.findOneBy({ id });
        if (!evidence) {
            return res.status(404).json({ error: "Evidence not found" });
        }
        evidenceRepository.merge(evidence, {
            label,
            type,
            date,
            filePath,
            caseId,
        });
        const updatedEvidence = await evidenceRepository.save(evidence);
        res.json(updatedEvidence);
    }
    catch (error) {
        console.error("Error updating evidence:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /api/evidence/fetch-url - 서버가 URL에서 파일을 받아 저장 후 증거 생성
router.post("/fetch-url", async (req, res) => {
    try {
        const { url, label, date, caseId } = req.body;
        if (!url)
            return res.status(400).json({ error: "url is required" });
        // URL에서 파일 스트림 다운로드
        const response = await axios_1.default.get(url, { responseType: "stream" });
        const contentType = response.headers["content-type"];
        const contentDisposition = response.headers["content-disposition"];
        // 파일명 추출
        let filename = "download";
        if (contentDisposition) {
            const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(contentDisposition);
            filename = decodeURIComponent(match?.[1] || match?.[2] || filename);
        }
        else {
            try {
                const u = new URL(url);
                const base = path.basename(u.pathname);
                if (base)
                    filename = base;
            }
            catch (e) {
                console.debug("Failed to parse filename from URL:", e);
            }
        }
        const safeBase = filename.replace(/[^a-zA-Z0-9-_.]+/g, "_");
        const { urlOrPath } = await (0, storage_1.saveObject)({
            stream: response.data,
            filename: safeBase,
            caseId,
            contentType: contentType,
        });
        // 타입 추론
        let type = "문서";
        if (contentType?.startsWith("image/"))
            type = "이미지";
        else if (contentType?.startsWith("audio/"))
            type = "오디오";
        else if (contentType?.startsWith("video/"))
            type = "비디오";
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const saved = await evidenceRepository.save(evidenceRepository.create({
            label: label || filename,
            type,
            date,
            filePath: urlOrPath,
            caseId,
        }));
        if ((process.env.ANALYSIS_ENABLED || "true").toLowerCase() === "true") {
            (0, analysisRunner_1.enqueueForEvidence)(saved.id).catch((error) => {
                console.error("Error enqueuing evidence analysis:", error);
            });
        }
        res.status(201).json(saved);
    }
    catch (error) {
        console.error("Error fetching evidence from url:", error);
        res
            .status(500)
            .json({ error: error.message || "Internal server error" });
    }
});
// DELETE /api/evidence/:id - 증거 삭제
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const evidenceRepository = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const result = await evidenceRepository.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ error: "Evidence not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting evidence:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
