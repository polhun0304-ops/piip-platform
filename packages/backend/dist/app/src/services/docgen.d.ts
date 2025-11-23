export type AnalysisContent = {
    title: string;
    summary: string;
    keyFindings: string[];
    nextSteps: string[];
};
export declare function generateMarkdownEditable(content: AnalysisContent, context: {
    evidenceLabel: string;
    caseId?: string;
}): Promise<{
    filePath: string;
}>;
export declare function generatePdfImmutable(content: AnalysisContent, context: {
    evidenceLabel: string;
    caseId?: string;
}): Promise<{
    filePath: string;
}>;
