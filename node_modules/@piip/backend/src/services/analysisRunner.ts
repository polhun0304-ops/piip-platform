import { AppDataSource } from "../config/database";
import { Evidence } from "../entities/Evidence";
import { AnalysisJob } from "../entities/AnalysisJob";
import { AnalysisArtifact } from "../entities/AnalysisArtifact";
import { analyzeEvidence, analyzeCase } from "./ai";
import { generateMarkdownEditable, generatePdfImmutable } from "./docgen";

let running = false;

export async function enqueueForEvidence(evidenceId: string) {
  const repo = AppDataSource.getRepository(AnalysisJob);
  const exists = await repo.findOne({
    where: { evidenceId, jobType: "per-evidence", status: "queued" },
  });
  if (!exists) {
    await repo.save(
      repo.create({ evidenceId, jobType: "per-evidence", status: "queued" })
    );
  }
  runLoop();
}

export async function enqueueForCase(caseId: string) {
  const repo = AppDataSource.getRepository(AnalysisJob);
  const exists = await repo.findOne({
    where: { caseId, jobType: "case-aggregate", status: "queued" },
  });
  if (!exists) {
    await repo.save(
      repo.create({ caseId, jobType: "case-aggregate", status: "queued" })
    );
  }
  runLoop();
}

async function runLoop() {
  if (running) return;
  running = true;
  try {
    const jobRepo = AppDataSource.getRepository(AnalysisJob);
    const evRepo = AppDataSource.getRepository(Evidence);
    const artRepo = AppDataSource.getRepository(AnalysisArtifact);

    // simple loop for a handful of jobs
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const job = await jobRepo.findOne({
        where: { status: "queued" },
        order: { createdAt: "ASC" },
      });
      if (!job) break;
      job.status = "processing";
      await jobRepo.save(job);
      try {
        let content: {
          title: string;
          summary: string;
          keyFindings: string[];
          nextSteps: string[];
        };
        let contextLabel = "";
        let contextCaseId: string | undefined;

        if (job.jobType === "per-evidence") {
          if (!job.evidenceId)
            throw new Error("evidenceId required for per-evidence job");
          const ev = await evRepo.findOne({ where: { id: job.evidenceId } });
          if (!ev) throw new Error("Evidence not found");
          content = await analyzeEvidence(ev);
          contextLabel = ev.label;
          contextCaseId = ev.caseId;
        } else {
          // case-aggregate
          if (!job.caseId)
            throw new Error("caseId required for case-aggregate job");
          const evidences = await evRepo.find({
            where: { caseId: job.caseId },
          });
          content = await analyzeCase(evidences);
          contextLabel = `사건 ${job.caseId}`;
          contextCaseId = job.caseId;
        }

        // editable markdown
        const md = await generateMarkdownEditable(content, {
          evidenceLabel: contextLabel,
          caseId: contextCaseId,
        });
        await artRepo.save(
          artRepo.create({
            jobId: job.id,
            kind: "editable",
            filePath: md.filePath,
          })
        );

        // immutable pdf
        const pdf = await generatePdfImmutable(content, {
          evidenceLabel: contextLabel,
          caseId: contextCaseId,
        });
        await artRepo.save(
          artRepo.create({
            jobId: job.id,
            kind: "immutable",
            filePath: pdf.filePath,
          })
        );

        // Optionally create Evidence entries so investigator sees them in list
        const createEvidenceArtifacts =
          (process.env.ANALYSIS_CREATE_EVIDENCE || "true").toLowerCase() ===
          "true";
        if (createEvidenceArtifacts) {
          const now = new Date().toISOString().slice(0, 10);
          const labelPrefix =
            job.jobType === "per-evidence"
              ? `AI 분석 초안 (편집용) - ${contextLabel}`
              : `사건 종합 분석 초안 (편집용) - ${contextLabel}`;
          const labelPdfPrefix =
            job.jobType === "per-evidence"
              ? `AI 분석 보고서 (PDF) - ${contextLabel}`
              : `사건 종합 보고서 (PDF) - ${contextLabel}`;
          await evRepo.save(
            evRepo.create({
              label: labelPrefix,
              type: "문서",
              date: now,
              filePath: md.filePath,
              caseId: contextCaseId,
            })
          );
          await evRepo.save(
            evRepo.create({
              label: labelPdfPrefix,
              type: "문서",
              date: now,
              filePath: pdf.filePath,
              caseId: contextCaseId,
            })
          );
        }

        job.status = "done";
        job.resultSummary = content.summary;
        await jobRepo.save(job);
      } catch (e: unknown) {
        job.status = "failed";
        const msg = e instanceof Error ? e.message : String(e);
        job.errorMessage = msg;
        await jobRepo.save(job);
      }
    }
  } finally {
    running = false;
  }
}
