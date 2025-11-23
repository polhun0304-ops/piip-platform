import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type ConsultationType = "free15" | "paid30";
export type ConsultationStatus =
  | "proposed"
  | "scheduled"
  | "started"
  | "completed"
  | "canceled"
  | "no-show";

@Entity()
export class Consultation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  clientUserId!: string; // 의뢰인 User.id

  @Column({ type: "uuid", nullable: true })
  detectiveId?: string; // 배정된 탐정 (Detective.id)

  @Column({ type: "uuid", nullable: true })
  caseId?: string; // 관련 사건 (선택)

  @Column({ type: "varchar", length: 20 })
  type!: ConsultationType; // free15 | paid30

  @Column({ type: "varchar", length: 20, default: "video" })
  channel!: "voice" | "video";

  @Column({ type: "varchar", length: 64, default: "UTC" })
  timezone!: string;

  @Column({ type: "datetime", nullable: true })
  scheduledAt?: Date;

  @Column({ type: "int", default: 15 })
  durationMinutes!: number; // free15=15, paid30=30 기본

  @Column({ type: "varchar", length: 20, default: "proposed" })
  status!: ConsultationStatus;

  // 동의 항목
  @Column({ type: "boolean", default: false })
  legalAdviceDisclaimerAck!: boolean;

  @Column({ type: "boolean", default: false })
  recordingConsent!: boolean; // 동의가 있어야 녹취/녹화 가능

  @Column({ type: "boolean", default: false })
  privacyPolicyAck!: boolean;

  // 미팅/관리 링크
  @Column({ type: "text", nullable: true })
  meetingUrl?: string;

  @Column({ type: "text", nullable: true })
  manageUrl?: string;

  @Column({ type: "text", nullable: true })
  icsUrl?: string;

  // 취소/노쇼 메타
  @Column({ type: "text", nullable: true })
  cancelReason?: string;

  @Column({ type: "text", nullable: true })
  summaryNote?: string; // 상담 요약 (민감정보 최소화)

  @Column({ type: "text", nullable: true })
  clientContact?: string; // 클라이언트 연락처 (SMS용)

  @Column({ type: "text", nullable: true })
  clientEmail?: string; // 클라이언트 이메일

  @Column({ type: "text", nullable: true })
  notes?: string; // 추가 노트

  @Column({ type: "int", nullable: true })
  duration?: number; // 상담 시간 (분)

  @Column({ type: "datetime", nullable: true })
  startedAt?: Date;

  @Column({ type: "datetime", nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
