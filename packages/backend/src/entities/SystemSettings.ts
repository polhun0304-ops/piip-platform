import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("system_settings")
export class SystemSettings {
  @PrimaryColumn()
  id: string;

  @Column({ default: false })
  maintenanceMode: boolean;

  @Column({ default: true })
  allowRegistration: boolean;

  @Column({ type: "int", default: 10 })
  maxFileSize: number; // MB

  @Column({ type: "int", default: 30 })
  sessionTimeout: number; // minutes

  @Column({ default: "daily" })
  backupFrequency: string; // hourly, daily, weekly, monthly

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: false })
  smsNotifications: boolean;

  @Column({ default: false })
  twoFactorAuth: boolean;

  @Column({ default: true })
  auditLogging: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;
}
