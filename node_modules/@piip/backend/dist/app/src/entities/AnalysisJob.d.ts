import { Evidence } from "./Evidence";
export declare class AnalysisJob {
    id: string;
    evidenceId?: string;
    caseId?: string;
    evidence?: Evidence;
    jobType: "per-evidence" | "case-aggregate";
    status: "queued" | "processing" | "done" | "failed";
    resultSummary?: string;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
