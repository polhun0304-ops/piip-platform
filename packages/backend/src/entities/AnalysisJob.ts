import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Evidence } from "./Evidence";

@Entity("analysis_job")
export class AnalysisJob {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  evidenceId?: string;

  @Column({ type: "uuid", nullable: true })
  caseId?: string;

  @ManyToOne(() => Evidence, { onDelete: "CASCADE" })
  @JoinColumn({ name: "evidenceId" })
  evidence?: Evidence;

  @Column({ type: "varchar", length: 20 })
  jobType!: "per-evidence" | "case-aggregate";

  @Column({ type: "varchar", length: 20 })
  status!: "queued" | "processing" | "done" | "failed";

  @Column({ type: "text", nullable: true })
  resultSummary?: string;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
