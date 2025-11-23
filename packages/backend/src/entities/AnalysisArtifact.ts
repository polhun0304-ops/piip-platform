import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { AnalysisJob } from "./AnalysisJob";

@Entity("analysis_artifact")
export class AnalysisArtifact {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  jobId!: string;

  @ManyToOne(() => AnalysisJob, { onDelete: "CASCADE" })
  @JoinColumn({ name: "jobId" })
  job?: AnalysisJob;

  @Column({ type: "varchar", length: 20 })
  kind!: "editable" | "immutable";

  @Column({ type: "varchar", length: 500 })
  filePath!: string; // storage URL or path

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
