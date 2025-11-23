import { Case } from "./Case";
import { Detective } from "./Detective";
/**
 * 사건 배정 기록
 */
export declare class CaseAssignment {
    id: string;
    caseId: string;
    case: Case;
    detectiveId?: string;
    detective?: Detective;
    status: "pending" | "assigned" | "accepted" | "rejected" | "reassigned" | "completed";
    assignmentType: "auto" | "manual";
    matchScore?: number;
    matchReason?: {
        specialtyMatch: boolean;
        experienceMatch: boolean;
        availabilityMatch: boolean;
        performanceMatch: boolean;
        details?: string;
    };
    priority: number;
    notes?: string;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
    assignedAt?: Date;
    respondedAt?: Date;
    completedAt?: Date;
}
