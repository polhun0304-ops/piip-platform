import { Consultation } from "../entities/Consultation";
/**
 * 소프트 게이팅 조건 평가
 * 정책: docs/consultation/POLICY.md 참조
 */
export interface SoftGatingCriteria {
    aiConfidence?: number;
    category?: string;
    quoteAmount?: number;
    urgencyFlag?: boolean;
    regulatoryFlag?: boolean;
    clientConfusionFlag?: boolean;
}
export interface SoftGatingResult {
    shouldRecommend: boolean;
    reasons: string[];
    severity: "low" | "medium" | "high";
}
/**
 * 소프트 게이팅 조건 평가
 */
export declare function evaluateSoftGating(criteria: SoftGatingCriteria): SoftGatingResult;
/**
 * Intake 완료 시 상담 제안 생성
 */
export declare function proposeConsultationAfterIntake(caseId: string, aiConfidence: number, category: string): Promise<Consultation | null>;
/**
 * Quote 생성/업데이트 시 상담 제안 생성
 */
export declare function proposeConsultationAfterQuote(quoteId: string): Promise<Consultation | null>;
/**
 * 결제 완료 후 킥오프 상담 제안 (선택형)
 */
export declare function proposeKickoffAfterPayment(caseId: string, clientUserId: string): Promise<Consultation | null>;
