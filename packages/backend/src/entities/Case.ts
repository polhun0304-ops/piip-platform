import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Evidence } from "./Evidence";
import { CaseAssignment } from "./CaseAssignment";

@Entity("cases")
export class Case {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 500 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "varchar",
    length: 50,
    default: "조사 중",
  })
  status!: "조사 중" | "종료" | "대기";

  @Column({ type: "date", nullable: true })
  date?: string;

  @Column({ type: "uuid", nullable: true })
  clientUserId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Evidence, (evidence) => evidence.case)
  evidences?: Evidence[];

  @OneToMany(() => CaseAssignment, (assignment) => assignment.case)
  assignments?: CaseAssignment[];
}
