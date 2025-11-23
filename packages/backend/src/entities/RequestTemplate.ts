import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * 의뢰 유형별 표준 템플릿
 * 예: 불륜조사, 소재파악, 신원조사 등
 */
@Entity()
export class RequestTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string; // 예: "불륜조사", "소재파악", "신원조사"

  @Column({ type: "text" })
  description!: string; // 의뢰 유형 설명

  @Column({ type: "json" })
  fields!: RequestField[]; // 수집할 정보 필드 정의

  @Column({ type: "json", nullable: true })
  conversationFlow?: ConversationStep[]; // 대화 흐름 정의

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "int", default: 0 })
  sortOrder!: number; // 표시 순서

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

/**
 * 수집할 정보 필드
 */
export interface RequestField {
  key: string; // 필드 키 (예: "targetName", "targetAddress")
  label: string; // 사용자에게 보여줄 레이블
  type:
    | "text"
    | "textarea"
    | "date"
    | "phone"
    | "email"
    | "select"
    | "multiselect";
  required: boolean;
  options?: string[]; // select, multiselect일 때 옵션
  placeholder?: string;
  validation?: {
    pattern?: string; // 정규식
    min?: number;
    max?: number;
    message?: string; // 에러 메시지
  };
  aiPrompt?: string; // AI가 이 필드를 추출할 때 사용할 프롬프트 힌트
}

/**
 * 대화 흐름 단계
 */
export interface ConversationStep {
  step: number;
  message: string; // AI가 사용자에게 보낼 메시지 (템플릿)
  expectedFields: string[]; // 이 단계에서 수집할 필드 키들
  nextStepCondition?: {
    field: string;
    value: string;
    nextStep: number;
  }; // 조건부 분기
}
