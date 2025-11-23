import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IntakeSession } from "./IntakeSession";

/**
 * 의뢰 접수 대화 메시지 기록
 */
@Entity()
export class IntakeResponse {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  sessionId!: string;

  @ManyToOne(() => IntakeSession)
  @JoinColumn({ name: "sessionId" })
  session!: IntakeSession;

  @Column({ type: "varchar", length: 20 })
  sender!: "client" | "agent"; // 메시지 발신자

  @Column({ type: "text" })
  message!: string; // 메시지 내용

  @Column({ type: "json", nullable: true })
  extractedData?: Record<string, unknown>; // AI가 이 메시지에서 추출한 정보

  @Column({ type: "int", nullable: true })
  stepNumber?: number; // 어느 단계의 응답인지

  @CreateDateColumn()
  createdAt!: Date;
}
