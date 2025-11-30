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

@Entity("report")
export class Report {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 500 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "uuid", nullable: true })
  caseId?: string;

  @ManyToOne(() => Case, (caseEntity) => caseEntity.evidences, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "caseId" })
  case?: Case;

  @Column({ type: "varchar", length: 100, nullable: true })
  authorUserId?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  authorRole?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  authorDetectiveId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
