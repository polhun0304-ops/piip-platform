import { RequestTemplate } from "./RequestTemplate";
/**
 * 의뢰 접수 진행 세션
 * 의뢰인과 AI 에이전트의 대화 진행 상태 추적
 */
export declare class IntakeSession {
    id: string;
    templateId?: string;
    template?: RequestTemplate;
    status: "initiated" | "collecting" | "validating" | "completed" | "cancelled";
    currentStep: number;
    collectedData: Record<string, unknown>;
    clientContact?: string;
    clientName?: string;
    userId?: string;
    createdCaseId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}
