"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const AnalysisJob_1 = require("../entities/AnalysisJob");
const AnalysisArtifact_1 = require("../entities/AnalysisArtifact");
const auth_1 = require("../middleware/auth");
const analysisRunner_1 = require("../services/analysisRunner");
const router = (0, express_1.Router)();
router.use(auth_1.verifyJWT);
// GET /api/analysis/jobs?evidenceId=&caseId=&jobType=
router.get("/jobs", async (req, res) => {
    try {
        const { evidenceId, caseId, jobType } = req.query;
        const repo = database_1.AppDataSource.getRepository(AnalysisJob_1.AnalysisJob);
        const where = {};
        if (evidenceId)
            where.evidenceId = evidenceId;
        if (caseId)
            where.caseId = caseId;
        if (jobType)
            where.jobType = jobType;
        const list = await repo.find({ where, order: { createdAt: "DESC" } });
        res.json(list);
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
// GET /api/analysis/jobs/:id -> with artifacts
router.get("/jobs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const jobRepo = database_1.AppDataSource.getRepository(AnalysisJob_1.AnalysisJob);
        const artRepo = database_1.AppDataSource.getRepository(AnalysisArtifact_1.AnalysisArtifact);
        const job = await jobRepo.findOne({ where: { id } });
        if (!job)
            return res.status(404).json({ error: "Not found" });
        const artifacts = await artRepo.find({ where: { jobId: id } });
        res.json({ job, artifacts });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
// POST /api/analysis/retry/:id
router.post("/retry/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const jobRepo = database_1.AppDataSource.getRepository(AnalysisJob_1.AnalysisJob);
        const job = await jobRepo.findOne({ where: { id } });
        if (!job)
            return res.status(404).json({ error: "Not found" });
        job.status = "queued";
        job.errorMessage = undefined;
        await jobRepo.save(job);
        if (job.jobType === "per-evidence" && job.evidenceId) {
            await (0, analysisRunner_1.enqueueForEvidence)(job.evidenceId);
        }
        else if (job.jobType === "case-aggregate" && job.caseId) {
            await (0, analysisRunner_1.enqueueForCase)(job.caseId);
        }
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Internal server error" });
    }
});
exports.default = router;
