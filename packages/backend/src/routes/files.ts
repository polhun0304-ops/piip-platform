import { Router, Request, Response } from "express";
import * as path from "path";
import * as fs from "fs";
import { AppDataSource } from "../config/database";
import { Evidence } from "../entities/Evidence";
import {
  getS3ObjectStream,
  getS3SignedUrl,
  parseS3Url,
} from "../services/storage";
import { verifyJWT } from "../middleware/auth";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

const SIGNED_URL_EXPIRES_SECONDS = parseInt(
  process.env.SIGNED_URL_EXPIRES_SECONDS || "300",
  10
);

// apply auth for all endpoints in this router
router.use(verifyJWT);

// GET /api/files/:id -> { url } or proxy hint
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const evidenceRepo = AppDataSource.getRepository(Evidence);
    const ev = await evidenceRepo.findOneBy({ id });
    if (!ev || !ev.filePath)
      return res.status(404).json({ error: "Not found" });

    // s3 private: s3://bucket/key
    const allowSigned =
      (process.env.FILES_SIGNED_URLS || "enabled").toLowerCase() !== "disabled";
    const s3 = parseS3Url(ev.filePath);
    if (s3) {
      if (!allowSigned) {
        return res.json({ url: `/api/files/${id}/stream`, proxy: true });
      }
      const url = await getS3SignedUrl({
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
  } catch (e: unknown) {
    console.error("files:get url error", e);
    res
      .status(500)
      .json({ error: (e as Error).message || "Internal server error" });
  }
});

// GET /api/files/:id/stream -> proxy stream
router.get("/:id/stream", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const evidenceRepo = AppDataSource.getRepository(Evidence);
    const ev = await evidenceRepo.findOneBy({ id });
    if (!ev || !ev.filePath)
      return res.status(404).json({ error: "Not found" });

    const s3 = parseS3Url(ev.filePath);
    if (s3) {
      const obj = await getS3ObjectStream({ bucket: s3.bucket, key: s3.key });
      if (obj.contentType) res.setHeader("Content-Type", obj.contentType);
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
  } catch (e: unknown) {
    console.error("files:stream error", e);
    res
      .status(500)
      .json({ error: (e as Error).message || "Internal server error" });
  }
});

// POST /api/files/upload -> upload file
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.status(200).send({ filename: req.file.filename });
  } catch (error: unknown) {
    console.error("File upload error:", error);
    res.status(500).send("Internal server error.");
  }
});

export default router;
