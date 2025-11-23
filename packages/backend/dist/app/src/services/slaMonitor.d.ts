export interface SLAReport {
    consultationId: string;
    proposedAt: Date;
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    responseTime?: number;
    kickoffTime?: number;
    processTime?: number;
    status: string;
}
export declare function getSLAReport(consultationId: string): Promise<SLAReport | null>;
