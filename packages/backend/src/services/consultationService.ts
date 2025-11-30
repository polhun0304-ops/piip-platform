import { Consultation } from "../entities/Consultation";

/**
 * 노쇼 감지 및 상태 전환
 * - scheduledAt + gracePeriod(10분) 경과 후 started 상태가 아니면 no-show 처리
 */
export async function detectNoShow(consultation: Consultation) {
  if (consultation.status !== "scheduled") return;
  if (!consultation.scheduledAt) return;
  const now = new Date();
  const scheduled = new Date(consultation.scheduledAt);
  const gracePeriodMs = 10 * 60 * 1000; // 10분
  if (now.getTime() > scheduled.getTime() + gracePeriodMs) {
    // 아직 started가 아니면 노쇼 처리
    consultation.status = "no-show";
    // DB 저장 로직 필요 (예: repository.save(consultation))
    // 알림/리포트 등 추가 처리 가능
    return true;
  }
  return false;
}
