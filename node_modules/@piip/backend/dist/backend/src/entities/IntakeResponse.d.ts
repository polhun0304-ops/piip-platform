import { IntakeSession } from "./IntakeSession";
/**
 * 의뢰 접수 대화 메시지 기록
 */
export declare class IntakeResponse {
    id: string;
    sessionId: string;
    session: IntakeSession;
    sender: "client" | "agent";
    message: string;
    extractedData?: Record<string, unknown>;
    stepNumber?: number;
    createdAt: Date;
}
