import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { RequestTemplate } from "./RequestTemplate";

/**
 * 의뢰 접수 진행 세션
 * 의뢰인과 AI 에이전트의 대화 진행 상태 추적
 */
@Entity()
export class IntakeSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  templateId?: string; // 선택된 템플릿 (처음엔 null, 유형 선택 후 설정)

  @ManyToOne(() => RequestTemplate, { nullable: true })
  @JoinColumn({ name: "templateId" })
  template?: RequestTemplate;

  @Column({ type: "varchar", length: 20 })
  status!:
    | "initiated" // 시작됨
    | "collecting" // 정보 수집 중
    | "validating" // 검증 중
    | "completed" // 완료
    | "cancelled"; // 취소됨

  @Column({ type: "int", default: 0 })
  currentStep!: number; // 현재 대화 단계

  @Column({ type: "simple-json", nullable: true })
  collectedData!: Record<string, unknown>; // 수집된 정보 (키-값 쌍)

  @Column({ type: "text", nullable: true })
  clientContact?: string; // 의뢰인 연락처 (전화 또는 이메일)

  @Column({ type: "text", nullable: true })
  clientName?: string; // 의뢰인 이름

  @Column({ type: "uuid", nullable: true })
  userId?: string; // 로그인한 사용자 ID (선택사항)

  @Column({ type: "uuid", nullable: true })
  createdCaseId?: string; // 생성된 사건 ID (완료 후)

  @Column({ type: "text", nullable: true })
  notes?: string; // 추가 메모

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "datetime", nullable: true })
  completedAt?: Date; // 완료 시간
}
