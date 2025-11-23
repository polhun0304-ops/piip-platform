/**
 * 의뢰 유형별 표준 템플릿
 * 예: 불륜조사, 소재파악, 신원조사 등
 */
export declare class RequestTemplate {
    id: string;
    name: string;
    description: string;
    fields: RequestField[];
    conversationFlow?: ConversationStep[];
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * 수집할 정보 필드
 */
export interface RequestField {
    key: string;
    label: string;
    type: "text" | "textarea" | "date" | "phone" | "email" | "select" | "multiselect";
    required: boolean;
    options?: string[];
    placeholder?: string;
    validation?: {
        pattern?: string;
        min?: number;
        max?: number;
        message?: string;
    };
    aiPrompt?: string;
}
/**
 * 대화 흐름 단계
 */
export interface ConversationStep {
    step: number;
    message: string;
    expectedFields: string[];
    nextStepCondition?: {
        field: string;
        value: string;
        nextStep: number;
    };
}
