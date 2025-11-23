import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Case } from "./Case";
import { Detective } from "./Detective";

/**
 * 사건 배정 기록
 */
@Entity()
export class CaseAssignment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  caseId!: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: "caseId" })
  case!: Case;

  @Column({ type: "uuid", nullable: true })
  detectiveId?: string;

  @ManyToOne(() => Detective, { nullable: true })
  @JoinColumn({ name: "detectiveId" })
  detective?: Detective;

  @Column({ type: "varchar", length: 20 })
  status!:
    | "pending" // 배정 대기
    | "assigned" // 배정됨
    | "accepted" // 탐정이 수락
    | "rejected" // 탐정이 거절
    | "reassigned" // 재배정됨
    | "completed"; // 완료

  @Column({ type: "varchar", length: 20, default: "auto" })
  assignmentType!: "auto" | "manual"; // 자동 배정 / 수동 배정

  @Column({ type: "float", nullable: true })
  matchScore?: number; // AI 매칭 점수 (0-100)

  @Column({ type: "json", nullable: true })
  matchReason?: {
    // 매칭 이유
    specialtyMatch: boolean;
    experienceMatch: boolean;
    availabilityMatch: boolean;
    performanceMatch: boolean;
    details?: string;
  };

  @Column({ type: "int", default: 0 })
  priority!: number; // 우선순위 (높을수록 긴급)

  @Column({ type: "text", nullable: true })
  notes?: string; // 배정 메모

  @Column({ type: "text", nullable: true })
  rejectionReason?: string; // 거절 사유

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "datetime", nullable: true })
  assignedAt?: Date; // 배정 시간

  @Column({ type: "datetime", nullable: true })
  respondedAt?: Date; // 탐정 응답 시간

  @Column({ type: "datetime", nullable: true })
  completedAt?: Date; // 완료 시간
}
