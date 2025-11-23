import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  // OneToMany was unused and removed to satisfy linter
} from "typeorm";

/**
 * 탐정 프로필
 */
@Entity()
export class Detective {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  userId?: string; // User 엔티티와 연결 (선택사항)

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  email?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  licenseNumber?: string; // 탐정 자격증 번호

  @Column({ type: "varchar", length: 20, nullable: true })
  region?: string; // 시도 (예: 서울, 경기, 부산 등)

  @Column({ type: "varchar", length: 30, nullable: true })
  city?: string; // 시군구 (예: 강남구, 수원시 등)

  @Column({ type: "int", default: 0 })
  experienceYears!: number; // 경력 연수

  @Column({ type: "varchar", length: 20, default: "활동중" })
  status!: "활동중" | "휴식중" | "비활성";

  @Column({ type: "simple-json", nullable: true })
  specialties!: DetectiveSpecialty[]; // 전문 분야 및 레벨

  @Column({ type: "int", default: 5 })
  maxConcurrentCases!: number; // 동시 처리 가능한 최대 사건 수

  @Column({ type: "int", default: 0 })
  currentCaseCount!: number; // 현재 담당 중인 사건 수

  @Column({ type: "float", default: 0 })
  averageRating!: number; // 평균 평점 (0-5)

  @Column({ type: "int", default: 0 })
  completedCases!: number; // 완료한 사건 수

  @Column({ type: "int", default: 0 })
  successRate!: number; // 성공률 (0-100)

  @Column({ type: "text", nullable: true })
  bio?: string; // 간단한 소개

  @Column({ type: "simple-json", nullable: true })
  workingHours?: {
    // 근무 시간
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "datetime", nullable: true })
  lastActiveAt?: Date; // 마지막 활동 시간
}

/**
 * 탐정의 전문 분야 및 숙련도
 */
export interface DetectiveSpecialty {
  category: string; // 의뢰 유형 (예: "불륜조사", "소재파악")
  level: "초급" | "중급" | "고급" | "전문가"; // 숙련도
  casesHandled: number; // 해당 분야 처리 건수
  successRate: number; // 해당 분야 성공률 (0-100)
}
