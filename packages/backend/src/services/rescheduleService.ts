import { Consultation } from "../entities/Consultation";
import { AppDataSource } from "../config/database";

export async function rescheduleConsultation(
  consultationId: string,
  date: string,
  time: string
): Promise<Consultation | null> {
  const repo = AppDataSource.getRepository(Consultation);
  const consultation = await repo.findOneBy({ id: consultationId });
  if (!consultation) return null;
  consultation.scheduledAt = new Date(`${date}T${time}:00+09:00`);
  consultation.status = "scheduled";
  await repo.save(consultation);
  return consultation;
}
