import { Evidence } from "../entities/Evidence";
export declare function analyzeEvidence(evidence: Evidence): Promise<{
    title: string;
    summary: string;
    keyFindings: string[];
    nextSteps: string[];
}>;
export declare function analyzeCase(evidences: Evidence[]): Promise<{
    title: string;
    summary: string;
    keyFindings: string[];
    nextSteps: string[];
}>;
