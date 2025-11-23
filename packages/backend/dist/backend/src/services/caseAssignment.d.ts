import { Case } from "../entities/Case";
import { Detective } from "../entities/Detective";
import { CaseAssignment } from "../entities/CaseAssignment";
/**
 * 사건 카테고리 자동 분류
 */
export declare function classifyCase(caseData: {
    title: string;
    description: string;
}): Promise<{
    category: string;
    confidence: number;
}>;
/**
 * AI 기반 탐정 매칭 점수 계산
 */
export declare function calculateMatchScore(caseData: Case, detective: Detective, category: string): Promise<{
    score: number;
    reason: {
        specialtyMatch: boolean;
        experienceMatch: boolean;
        availabilityMatch: boolean;
        performanceMatch: boolean;
        details: string;
    };
}>;
/**
 * 최적 탐정 자동 배정
 */
export declare function autoAssignDetective(caseId: string, options?: {
    minScore?: number;
    maxCandidates?: number;
}): Promise<CaseAssignment | null>;
/**
 * 탐정 선택 가능한 사건 목록 조회
 */
export declare function getAvailableCasesForSelection(): Promise<Array<{
    case: Case;
    category: string;
    suggestedDetectives: Array<{
        detective: Detective;
        score: number;
        reason: unknown;
    }>;
}>>;
/**
 * 수동 배정
 */
export declare function manualAssignDetective(caseId: string, detectiveId: string, notes?: string): Promise<CaseAssignment>;
/**
 * 탐정의 배정 수락
 */
export declare function acceptAssignment(assignmentId: string): Promise<void>;
/**
 * 탐정의 배정 거절 및 재배정
 */
export declare function rejectAssignment(assignmentId: string, reason: string): Promise<CaseAssignment | null>;
