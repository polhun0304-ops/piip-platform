import { AnalysisJob } from "./AnalysisJob";
export declare class AnalysisArtifact {
    id: string;
    jobId: string;
    job?: AnalysisJob;
    kind: "editable" | "immutable";
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
}
