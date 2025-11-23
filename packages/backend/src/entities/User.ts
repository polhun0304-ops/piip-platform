import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * 사용자 엔티티
 * 관리자, 탐정, 의뢰인 역할 관리
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string; // bcrypt 해시

  @Column({ type: "varchar", length: 100, nullable: true })
  name?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 20, default: "client" })
  role!: "admin" | "detective" | "client";

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "uuid", nullable: true })
  detectiveId?: string; // role이 detective인 경우 Detective 엔티티 ID

  @Column({ type: "text", nullable: true })
  profileImage?: string;

  @Column({ type: "datetime", nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
