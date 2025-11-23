import { AppDataSource } from "../config/database";
import { Consultation } from "../entities/Consultation";

export interface SLAReport {
  consultationId: string;
  proposedAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  responseTime?: number; // 제안~예약까지(분)
  kickoffTime?: number; // 예약~시작까지(분)
  processTime?: number; // 시작~종료까지(분)
  status: string;
}

export async function getSLAReport(
  consultationId: string
): Promise<SLAReport | null> {
  const repo = AppDataSource.getRepository(Consultation);
  const c = await repo.findOneBy({ id: consultationId });
  if (!c) return null;
  const report: SLAReport = {
    consultationId: c.id,
    proposedAt: c.createdAt,
    scheduledAt: c.scheduledAt,
    startedAt: c.startedAt,
    completedAt: c.completedAt,
    status: c.status,
  };
  if (c.scheduledAt)
    report.responseTime = Math.round(
      (c.scheduledAt.getTime() - c.createdAt.getTime()) / 60000
    );
  if (c.startedAt && c.scheduledAt)
    report.kickoffTime = Math.round(
      (c.startedAt.getTime() - c.scheduledAt.getTime()) / 60000
    );
  if (c.completedAt && c.startedAt)
    report.processTime = Math.round(
      (c.completedAt.getTime() - c.startedAt.getTime()) / 60000
    );
  return report;
}
