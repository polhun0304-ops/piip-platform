"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueForEvidence = enqueueForEvidence;
exports.enqueueForCase = enqueueForCase;
const database_1 = require("../config/database");
const Evidence_1 = require("../entities/Evidence");
const AnalysisJob_1 = require("../entities/AnalysisJob");
const AnalysisArtifact_1 = require("../entities/AnalysisArtifact");
const ai_1 = require("./ai");
const docgen_1 = require("./docgen");
let running = false;
async function enqueueForEvidence(evidenceId) {
    const repo = database_1.AppDataSource.getRepository(AnalysisJob_1.AnalysisJob);
    const exists = await repo.findOne({
        where: { evidenceId, jobType: "per-evidence", status: "queued" },
    });
    if (!exists) {
        await repo.save(repo.create({ evidenceId, jobType: "per-evidence", status: "queued" }));
    }
    runLoop();
}
async function enqueueForCase(caseId) {
    const repo = database_1.AppDataSource.getRepository(AnalysisJob_1.AnalysisJob);
    const exists = await repo.findOne({
        where: { caseId, jobType: "case-aggregate", status: "queued" },
    });
    if (!exists) {
        await repo.save(repo.create({ caseId, jobType: "case-aggregate", status: "queued" }));
    }
    runLoop();
}
async function runLoop() {
    if (running)
        return;
    running = true;
    try {
        const jobRepo = database_1.AppDataSource.getRepository(AnalysisJob_1.AnalysisJob);
        const evRepo = database_1.AppDataSource.getRepository(Evidence_1.Evidence);
        const artRepo = database_1.AppDataSource.getRepository(AnalysisArtifact_1.AnalysisArtifact);
        // simple loop for a handful of jobs
        while (true) {
            const job = await jobRepo.findOne({
                where: { status: "queued" },
                order: { createdAt: "ASC" },
            });
            if (!job)
                break;
            job.status = "processing";
            await jobRepo.save(job);
            try {
                let content;
                let contextLabel = "";
                let contextCaseId;
                if (job.jobType === "per-evidence") {
                    if (!job.evidenceId)
                        throw new Error("evidenceId required for per-evidence job");
                    const ev = await evRepo.findOne({ where: { id: job.evidenceId } });
                    if (!ev)
                        throw new Error("Evidence not found");
                    content = await (0, ai_1.analyzeEvidence)(ev);
                    contextLabel = ev.label;
                    contextCaseId = ev.caseId;
                }
                else {
                    // case-aggregate
                    if (!job.caseId)
                        throw new Error("caseId required for case-aggregate job");
                    const evidences = await evRepo.find({
                        where: { caseId: job.caseId },
                    });
                    content = await (0, ai_1.analyzeCase)(evidences);
                    contextLabel = `사건 ${job.caseId}`;
                    contextCaseId = job.caseId;
                }
                // editable markdown
                const md = await (0, docgen_1.generateMarkdownEditable)(content, {
                    evidenceLabel: contextLabel,
                    caseId: contextCaseId,
                });
                await artRepo.save(artRepo.create({
                    jobId: job.id,
                    kind: "editable",
                    filePath: md.filePath,
                }));
                // immutable pdf
                const pdf = await (0, docgen_1.generatePdfImmutable)(content, {
                    evidenceLabel: contextLabel,
                    caseId: contextCaseId,
                });
                await artRepo.save(artRepo.create({
                    jobId: job.id,
                    kind: "immutable",
                    filePath: pdf.filePath,
                }));
                // Optionally create Evidence entries so investigator sees them in list
                const createEvidenceArtifacts = (process.env.ANALYSIS_CREATE_EVIDENCE || "true").toLowerCase() ===
                    "true";
                if (createEvidenceArtifacts) {
                    const now = new Date().toISOString().slice(0, 10);
                    const labelPrefix = job.jobType === "per-evidence"
                        ? `AI 분석 초안 (편집용) - ${contextLabel}`
                        : `사건 종합 분석 초안 (편집용) - ${contextLabel}`;
                    const labelPdfPrefix = job.jobType === "per-evidence"
                        ? `AI 분석 보고서 (PDF) - ${contextLabel}`
                        : `사건 종합 보고서 (PDF) - ${contextLabel}`;
                    await evRepo.save(evRepo.create({
                        label: labelPrefix,
                        type: "문서",
                        date: now,
                        filePath: md.filePath,
                        caseId: contextCaseId,
                    }));
                    await evRepo.save(evRepo.create({
                        label: labelPdfPrefix,
                        type: "문서",
                        date: now,
                        filePath: pdf.filePath,
                        caseId: contextCaseId,
                    }));
                }
                job.status = "done";
                job.resultSummary = content.summary;
                await jobRepo.save(job);
            }
            catch (e) {
                job.status = "failed";
                job.errorMessage = e?.message || String(e);
                await jobRepo.save(job);
            }
        }
    }
    finally {
        running = false;
    }
}
