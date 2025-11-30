import { Router, Request, Response } from "express";
import multer from "multer";
import * as path from "path";
// no direct fs writes here; storage service abstracts persistence
import { AppDataSource } from "../config/database";
import axios from "axios";
import { Evidence } from "../entities/Evidence";
import { Case } from "../entities/Case";
import { saveObject } from "../services/storage";
import { enqueueForEvidence, enqueueForCase } from "../services/analysisRunner";
import { verifyJWT, AuthRequest } from "../middleware/auth";

// Basic magic-bytes checks for common types (non-exhaustive)
function looksLikeAllowedFile(buffer: Buffer, mimetype: string): boolean {
  if (!buffer || buffer.length < 4) return false;
  const hex = buffer.slice(0, 8).toString("hex").toLowerCase();
  // PNG: 89504e47
  if (hex.startsWith("89504e47") && mimetype.startsWith("image/")) return true;
  // JPG/JPEG: ffd8ff
  if (hex.startsWith("ffd8ff") && mimetype.startsWith("image/")) return true;
  // PDF: 25504446
  if (
    hex.startsWith("25504446") &&
    (mimetype === "application/pdf" || mimetype.startsWith("application/"))
  )
    return true;
  // MP4: 00000018..66747970 (ftyp)
  if (hex.includes("66747970") && mimetype.startsWith("video/")) return true;
  // MP3 ID3: 494433
  if (hex.startsWith("494433") && mimetype.startsWith("audio/")) return true;
  // fallback: allow common text types
  if (mimetype.startsWith("text/")) return true;
  return false;
}

function auditLog(action: string, payload: Record<string, unknown>) {
  try {
    // simple structured log for audit - can be replaced with proper logger
    console.info(
      JSON.stringify({ ts: new Date().toISOString(), action, ...payload })
    );
  } catch (e) {
    console.info(action, payload);
  }
}

const router = Router();

// 업로드 스토리지 설정: 메모리 기반으로 받아서 storage 서비스로 저장
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile?: boolean) => void
  ) => {
    // 허용 MIME 타입 간단 필터링
    const allowed = ["image/", "video/", "audio/", "application/", "text/"];
    if (allowed.some((p) => file.mimetype.startsWith(p))) return cb(null, true);
    cb(new Error("Unsupported file type"));
  },
});

// GET /api/evidence - 모든 증거 조회
router.get("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.query;
    const evidenceRepository = AppDataSource.getRepository(Evidence);

    const queryBuilder = evidenceRepository.createQueryBuilder("evidence");
    queryBuilder.leftJoinAndSelect("evidence.case", "case");

    // Role-based filtering
    if (req.user?.role === "detective" && req.user.detectiveId) {
      queryBuilder
        .leftJoin("case.assignments", "assignment")
        .andWhere("assignment.detectiveId = :detectiveId", {
          detectiveId: req.user.detectiveId,
        });
    } else if (req.user?.role === "client") {
      queryBuilder.andWhere("case.clientUserId = :userId", {
        userId: req.user.userId,
      });
    }

    if (caseId) {
      queryBuilder.andWhere("evidence.caseId = :caseId", { caseId });
    }

    const evidence = await queryBuilder
      .orderBy("evidence.createdAt", "DESC")
      .getMany();

    res.json(evidence);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/evidence/:id - 특정 증거 조회
router.get("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const evidenceRepository = AppDataSource.getRepository(Evidence);
    const evidence = await evidenceRepository.findOne({
      where: { id },
      relations: ["case"],
    });

    if (!evidence) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    // Permission checks: clients can view only evidences belonging to their cases
    if (req.user?.role === "client") {
      const clientUserId = (evidence.case as any)?.clientUserId;
      if (clientUserId && clientUserId !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    // Detectives may also be restricted to cases they are assigned to (handled in list endpoint)
    res.json(evidence);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/evidence - 새 증거 생성
router.post("/", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { label, type, date, filePath, caseId } = req.body;

    if (!label || !type || !caseId) {
      return res
        .status(400)
        .json({ error: "Label, type, and caseId are required" });
    }

    // Permission Check
    const caseRepo = AppDataSource.getRepository(Case);
    const targetCase = await caseRepo.findOne({
      where: { id: caseId },
      relations: ["assignments"],
    });

    if (!targetCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (req.user?.role === "client") {
      if (targetCase.clientUserId !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    } else if (req.user?.role === "detective") {
      const isAssigned = targetCase.assignments?.some(
        (a) => a.detectiveId === req.user?.detectiveId
      );
      if (!isAssigned) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    const evidenceRepository = AppDataSource.getRepository(Evidence);
    const newEvidence = evidenceRepository.create({
      label,
      type,
      date,
      filePath,
      caseId,
    });

    const savedEvidence = await evidenceRepository.save(newEvidence);
    res.status(201).json(savedEvidence);
  } catch (error) {
    console.error("Error creating evidence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/evidence/upload - 파일 업로드 + 증거 생성 (multipart/form-data)
router.post(
  "/upload",
  verifyJWT,
  upload.single("file"),
  async (req: AuthRequest & { file?: Express.Multer.File }, res: Response) => {
    try {
      const { label, date, caseId } = req.body as {
        label?: string;
        date?: string;
        caseId?: string;
      };

      if (!caseId) {
        return res.status(400).json({ error: "Case ID is required" });
      }

      // Permission Check
      const caseRepo = AppDataSource.getRepository(Case);
      const targetCase = await caseRepo.findOne({
        where: { id: caseId },
        relations: ["assignments"],
      });

      if (!targetCase) {
        return res.status(404).json({ error: "Case not found" });
      }

      if (req.user?.role === "client") {
        if (targetCase.clientUserId !== req.user.userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      } else if (req.user?.role === "detective") {
        const isAssigned = targetCase.assignments?.some(
          (a) => a.detectiveId === req.user?.detectiveId
        );
        if (!isAssigned) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }
      // 타입 추론 + sanity check via magic bytes
      const mime = req.file.mimetype;
      if (!looksLikeAllowedFile(req.file.buffer, mime)) {
        auditLog("evidence.upload.rejected", {
          reason: "magic-signature-mismatch",
          filename: req.file.originalname,
          mimetype: mime,
          caseId,
          userId: req.user?.userId,
        });
        return res
          .status(400)
          .json({ error: "Unsupported or corrupted file type" });
      }

      let type: Evidence["type"] = "문서";
      if (mime.startsWith("image/")) type = "이미지";
      else if (mime.startsWith("audio/")) type = "오디오";
      else if (mime.startsWith("video/")) type = "비디오";

      const evidenceRepository = AppDataSource.getRepository(Evidence);
      // storage 서비스로 저장 (S3 또는 로컬)
      const { urlOrPath } = await saveObject({
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
      auditLog("evidence.uploaded", {
        evidenceId: saved.id,
        caseId: saved.caseId,
        userId: req.user?.userId,
        detectiveId: req.user?.detectiveId,
        filename: req.file.originalname,
      });
      if ((process.env.ANALYSIS_ENABLED || "true").toLowerCase() === "true") {
        // fire-and-forget per-evidence analysis
        enqueueForEvidence(saved.id).catch((err: unknown) => {
          console.error("Error enqueuing evidence analysis:", err);
        });
        // if case exists, also trigger case-level aggregate analysis
        if (saved.caseId) {
          enqueueForCase(saved.caseId).catch((err: unknown) => {
            console.error("Error enqueuing case analysis:", err);
          });
        }
      }
      res.status(201).json(saved);
    } catch (e: unknown) {
      console.error("Error uploading evidence:", e);
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg || "Internal server error" });
    }
  }
);

// PUT /api/evidence/:id - 증거 수정
router.put("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { label, type, date, filePath, caseId } = req.body;

    const evidenceRepository = AppDataSource.getRepository(Evidence);
    const evidence = await evidenceRepository.findOne({
      where: { id },
      relations: ["case"],
    });

    if (!evidence) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    // Permission: clients can only update evidence in their own cases
    if (req.user?.role === "client") {
      const clientUserId = (evidence.case as any)?.clientUserId;
      if (clientUserId && clientUserId !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    // Detectives must be assigned to the case to modify
    if (req.user?.role === "detective") {
      const isAssigned = (evidence.case as any)?.assignments?.some(
        (a: any) => a.detectiveId === req.user?.detectiveId
      );
      if (!isAssigned) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    evidenceRepository.merge(evidence, {
      label,
      type,
      date,
      filePath,
      caseId,
    });

    const updatedEvidence = await evidenceRepository.save(evidence);
    auditLog("evidence.updated", {
      evidenceId: updatedEvidence.id,
      userId: req.user?.userId,
      detectiveId: req.user?.detectiveId,
    });
    res.json(updatedEvidence);
  } catch (error) {
    console.error("Error updating evidence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/evidence/fetch-url - 서버가 URL에서 파일을 받아 저장 후 증거 생성
router.post("/fetch-url", async (req: Request, res: Response) => {
  try {
    const { url, label, date, caseId } = req.body as {
      url?: string;
      label?: string;
      date?: string;
      caseId?: string;
    };

    if (!url) return res.status(400).json({ error: "url is required" });

    // URL에서 파일 스트림 다운로드
    const response = await axios.get(url, { responseType: "stream" });
    const contentType = response.headers["content-type"] as string | undefined;
    const contentDisposition = response.headers["content-disposition"] as
      | string
      | undefined;

    // 파일명 추출
    let filename = "download";
    if (contentDisposition) {
      const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(
        contentDisposition
      );
      filename = decodeURIComponent(match?.[1] || match?.[2] || filename);
    } else {
      try {
        const u = new URL(url);
        const base = path.basename(u.pathname);
        if (base) filename = base;
      } catch (e) {
        console.debug("Failed to parse filename from URL:", e);
      }
    }

    const safeBase = filename.replace(/[^a-zA-Z0-9-_.]+/g, "_");
    const { urlOrPath } = await saveObject({
      stream: response.data as unknown as import("stream").Readable,
      filename: safeBase,
      caseId,
      contentType: contentType,
    });

    // 타입 추론
    let type: Evidence["type"] = "문서";
    if (contentType?.startsWith("image/")) type = "이미지";
    else if (contentType?.startsWith("audio/")) type = "오디오";
    else if (contentType?.startsWith("video/")) type = "비디오";

    const evidenceRepository = AppDataSource.getRepository(Evidence);
    const saved = await evidenceRepository.save(
      evidenceRepository.create({
        label: label || filename,
        type,
        date,
        filePath: urlOrPath,
        caseId,
      })
    );
    if ((process.env.ANALYSIS_ENABLED || "true").toLowerCase() === "true") {
      enqueueForEvidence(saved.id).catch((error) => {
        console.error("Error enqueuing evidence analysis:", error);
      });
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Error fetching evidence from url:", error);
    res
      .status(500)
      .json({ error: (error as Error).message || "Internal server error" });
  }
});

// DELETE /api/evidence/:id - 증거 삭제
router.delete("/:id", verifyJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const evidenceRepository = AppDataSource.getRepository(Evidence);
    const evidence = await evidenceRepository.findOne({
      where: { id },
      relations: ["case"],
    });

    if (!evidence) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    // Permission checks
    if (req.user?.role === "client") {
      const clientUserId = (evidence.case as any)?.clientUserId;
      if (clientUserId && clientUserId !== req.user.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    if (req.user?.role === "detective") {
      const isAssigned = (evidence.case as any)?.assignments?.some(
        (a: any) => a.detectiveId === req.user?.detectiveId
      );
      if (!isAssigned) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    const result = await evidenceRepository.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    auditLog("evidence.deleted", {
      evidenceId: id,
      userId: req.user?.userId,
      detectiveId: req.user?.detectiveId,
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting evidence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
