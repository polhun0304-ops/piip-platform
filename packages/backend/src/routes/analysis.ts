import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { AnalysisJob } from "../entities/AnalysisJob";
import { AnalysisArtifact } from "../entities/AnalysisArtifact";
import { verifyJWT } from "../middleware/auth";
import { enqueueForEvidence, enqueueForCase } from "../services/analysisRunner";

const router = Router();
router.use(verifyJWT);

// GET /api/analysis/jobs?evidenceId=&caseId=&jobType=
router.get("/jobs", async (req: Request, res: Response) => {
  try {
    const { evidenceId, caseId, jobType } = req.query as {
      evidenceId?: string;
      caseId?: string;
      jobType?: string;
    };
    const repo = AppDataSource.getRepository(AnalysisJob);
    const where: Record<string, unknown> = {};
    if (evidenceId) where.evidenceId = evidenceId;
    if (caseId) where.caseId = caseId;
    if (jobType) where.jobType = jobType;
    const list = await repo.find({ where, order: { createdAt: "DESC" } });
    res.json(list);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// GET /api/analysis/jobs/:id -> with artifacts
router.get("/jobs/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobRepo = AppDataSource.getRepository(AnalysisJob);
    const artRepo = AppDataSource.getRepository(AnalysisArtifact);
    const job = await jobRepo.findOne({ where: { id } });
    if (!job) return res.status(404).json({ error: "Not found" });
    const artifacts = await artRepo.find({ where: { jobId: id } });
    res.json({ job, artifacts });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

// POST /api/analysis/retry/:id
router.post("/retry/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobRepo = AppDataSource.getRepository(AnalysisJob);
    const job = await jobRepo.findOne({ where: { id } });
    if (!job) return res.status(404).json({ error: "Not found" });
    job.status = "queued";
    job.errorMessage = undefined;
    await jobRepo.save(job);
    if (job.jobType === "per-evidence" && job.evidenceId) {
      await enqueueForEvidence(job.evidenceId);
    } else if (job.jobType === "case-aggregate" && job.caseId) {
      await enqueueForCase(job.caseId);
    }
    res.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg || "Internal server error" });
  }
});

export default router;
