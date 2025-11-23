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

@Entity("evidence")
export class Evidence {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 500 })
  label!: string;

  @Column({
    type: "varchar",
    length: 50,
  })
  type!: "이미지" | "오디오" | "문서" | "비디오";

  @Column({ type: "date", nullable: true })
  date?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  filePath?: string;

  @Column({ type: "uuid", nullable: true })
  caseId?: string;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.evidences, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "caseId" })
  case?: Case;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
