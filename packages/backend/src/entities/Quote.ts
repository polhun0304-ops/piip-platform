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
import { PricingTemplate } from "./PricingTemplate";

/**
 * 견적서 엔티티
 * 사건별 견적 정보 관리
 */
@Entity()
export class Quote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  caseId!: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: "caseId" })
  case!: Case;

  @Column({ type: "uuid", nullable: true })
  pricingTemplateId?: string;

  @ManyToOne(() => PricingTemplate, { nullable: true })
  @JoinColumn({ name: "pricingTemplateId" })
  pricingTemplate?: PricingTemplate;

  @Column({ type: "varchar", length: 20 })
  status!: "draft" | "sent" | "approved" | "rejected" | "expired";

  @Column({ type: "int" })
  basePrice!: number; // 기본 금액

  @Column({ type: "simple-json", nullable: true })
  items?: QuoteItem[]; // 견적 항목 상세

  @Column({ type: "simple-json", nullable: true })
  selectedOptions?: string[]; // 선택된 옵션 키 배열

  @Column({ type: "int" })
  totalPrice!: number; // 총 금액

  @Column({ type: "int", default: 0 })
  discount!: number; // 할인 금액

  @Column({ type: "int" })
  finalPrice!: number; // 최종 금액 (총액 - 할인)

  @Column({ type: "int", nullable: true })
  estimatedDays?: number; // 예상 소요 일수

  @Column({ type: "text", nullable: true })
  notes?: string; // 견적 메모

  @Column({ type: "datetime", nullable: true })
  validUntil?: Date; // 견적 유효기한

  @Column({ type: "datetime", nullable: true })
  approvedAt?: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  approvedBy?: string; // 승인자 (의뢰인)

  @Column({ type: "text", nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

/**
 * 견적 항목 인터페이스
 */
export interface QuoteItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
