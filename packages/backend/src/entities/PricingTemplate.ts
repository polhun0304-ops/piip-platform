import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * 가격표 템플릿
 * 업무별 기본 가격 및 옵션별 추가 비용 관리
 */
@Entity()
export class PricingTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  category!: string; // 불륜조사, 소재파악, 신원조사 등

  @Column({ type: "varchar", length: 200 })
  name!: string; // 가격표 이름 (예: "불륜조사 기본형")

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int" })
  basePrice!: number; // 기본 가격 (원)

  @Column({ type: "varchar", length: 50, default: "per_case" })
  priceUnit!: "per_case" | "per_day" | "per_hour"; // 가격 단위

  @Column({ type: "int", nullable: true })
  estimatedDays?: number; // 예상 소요 일수

  @Column({ type: "simple-json", nullable: true })
  options?: PricingOption[]; // 추가 옵션 목록

  @Column({ type: "simple-json", nullable: true })
  includedServices?: string[]; // 기본 포함 서비스

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

/**
 * 추가 옵션 인터페이스
 */
export interface PricingOption {
  key: string; // 고유 키 (예: "urgent", "weekend")
  label: string; // 옵션명
  description?: string;
  price: number; // 추가 비용
  priceType: "fixed" | "percentage"; // 고정금액 또는 비율
}
