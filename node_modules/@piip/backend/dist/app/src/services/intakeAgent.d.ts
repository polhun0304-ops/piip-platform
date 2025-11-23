import { IntakeSession } from "../entities/IntakeSession";
import { IntakeResponse } from "../entities/IntakeResponse";
import { RequestTemplate } from "../entities/RequestTemplate";
/**
 * 새 접수 세션 시작
 */
export declare function startIntakeSession(): Promise<IntakeSession>;
/**
 * 의뢰 유형 선택 및 템플릿 적용
 */
export declare function selectTemplate(sessionId: string, templateId: string): Promise<{
    session: IntakeSession;
    initialMessage: string;
}>;
/**
 * 클라이언트 메시지 처리 (핵심 로직)
 */
export declare function processClientMessage(sessionId: string, message: string): Promise<{
    agentMessage: string;
    isComplete: boolean;
    extractedData?: Record<string, any>;
}>;
/**
 * 활성 템플릿 목록 조회
 */
export declare function getActiveTemplates(): Promise<RequestTemplate[]>;
/**
 * 세션 조회 (대화 기록 포함)
 */
export declare function getSessionWithHistory(sessionId: string): Promise<{
    session: IntakeSession;
    messages: IntakeResponse[];
}>;
/**
 * 세션 취소
 */
export declare function cancelSession(sessionId: string): Promise<void>;
