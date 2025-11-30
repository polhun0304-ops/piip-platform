import { AppDataSource } from "../config/database";
import { Consultation } from "../entities/Consultation";
import { Case } from "../entities/Case";
import { Quote } from "../entities/Quote";

/**
 * 소프트 게이팅 조건 평가
 * 정책: docs/consultation/POLICY.md 참조
 */
export interface SoftGatingCriteria {
  aiConfidence?: number; // 0-1 범위
  category?: string;
  quoteAmount?: number;
  urgencyFlag?: boolean;
  regulatoryFlag?: boolean;
  clientConfusionFlag?: boolean;
}

export interface SoftGatingResult {
  shouldRecommend: boolean;
  reasons: string[];
  severity: "low" | "medium" | "high";
}

/**
 * 소프트 게이팅 조건 평가
 */
export function evaluateSoftGating(
  criteria: SoftGatingCriteria
): SoftGatingResult {
  const reasons: string[] = [];
  let severity: "low" | "medium" | "high" = "low";

  // AI 신뢰도 낮음 (< 0.6)
  if (criteria.aiConfidence !== undefined && criteria.aiConfidence < 0.6) {
    reasons.push("AI 신뢰도 낮음");
    severity = "high";
  }

  // 민감 카테고리
  const sensitiveCats = [
    "가정/이혼",
    "기업내부",
    "법적위험",
    "family",
    "corporate",
    "legal",
  ];
  if (
    criteria.category &&
    sensitiveCats.some((c) =>
      criteria.category!.toLowerCase().includes(c.toLowerCase())
    )
  ) {
    reasons.push("민감 카테고리");
    if (severity === "low") severity = "medium";
  }

  // 고가 견적 (예: 300만원 이상을 top 25%로 가정)
  if (criteria.quoteAmount !== undefined && criteria.quoteAmount >= 3000000) {
    reasons.push("고가 견적");
    if (severity === "low") severity = "medium";
  }

  // 긴급/혼란 신호
  if (criteria.urgencyFlag || criteria.clientConfusionFlag) {
    reasons.push("긴급/혼란 신호");
    if (severity === "low") severity = "medium";
  }

  // 관할/규제 플래그
  if (criteria.regulatoryFlag) {
    reasons.push("관할/규제 플래그");
    severity = "high";
  }

  return {
    shouldRecommend: reasons.length > 0,
    reasons,
    severity,
  };
}

/**
 * Intake 완료 시 상담 제안 생성
 */
export async function proposeConsultationAfterIntake(
  caseId: string,
  aiConfidence: number,
  category: string
): Promise<Consultation | null> {
  const gating = evaluateSoftGating({ aiConfidence, category });
  if (!gating.shouldRecommend) return null;

  const caseRepo = AppDataSource.getRepository(Case);
  const consultRepo = AppDataSource.getRepository(Consultation);

  const caseEntity = await caseRepo.findOne({ where: { id: caseId } });
  if (!caseEntity) return null;

  // clientUserId는 Case 엔티티에 없으므로, 실제 구현 시 IntakeSession이나 별도 필드에서 가져와야 함
  // 여기서는 임시로 placeholder 사용
  const clientUserId = "placeholder-client-id"; // TODO: 실제 IntakeSession.userId 연결

  const consultation = consultRepo.create({
    clientUserId,
    caseId,
    type: gating.severity === "high" ? "free15" : "free15",
    status: "proposed",
    channel: "video",
    timezone: "UTC",
    durationMinutes: 15,
    legalAdviceDisclaimerAck: false,
    recordingConsent: false,
    privacyPolicyAck: false,
  });

  return await consultRepo.save(consultation);
}

/**
 * Quote 생성/업데이트 시 상담 제안 생성
 */
export async function proposeConsultationAfterQuote(
  quoteId: string
): Promise<Consultation | null> {
  const quoteRepo = AppDataSource.getRepository(Quote);
  const consultRepo = AppDataSource.getRepository(Consultation);

  const quote = await quoteRepo.findOne({ where: { id: quoteId } });
  if (!quote) return null;

  const gating = evaluateSoftGating({
    quoteAmount: quote.finalPrice,
  });

  if (!gating.shouldRecommend) return null;

  // 이미 해당 사건에 대한 proposed 상담이 있는지 확인
  const existing = await consultRepo.findOne({
    where: { caseId: quote.caseId, status: "proposed" },
  });
  if (existing) return existing;

  // clientUserId는 Quote 엔티티에 없으므로 실제로는 Case나 별도 관계에서 가져와야 함
  const clientUserId = "placeholder-client-id"; // TODO: 실제 구현

  const consultation = consultRepo.create({
    clientUserId,
    caseId: quote.caseId,
    type: gating.severity === "high" ? "free15" : "free15",
    status: "proposed",
    channel: "video",
    timezone: "UTC",
    durationMinutes: 15,
    legalAdviceDisclaimerAck: false,
    recordingConsent: false,
    privacyPolicyAck: false,
  });

  return await consultRepo.save(consultation);
}

/**
 * 결제 완료 후 킥오프 상담 제안 (선택형)
 */
export async function proposeKickoffAfterPayment(
  caseId: string,
  clientUserId: string
): Promise<Consultation | null> {
  const consultRepo = AppDataSource.getRepository(Consultation);

  // 이미 킥오프 상담이 있는지 확인
  const existing = await consultRepo.findOne({
    where: { caseId, clientUserId, type: "free15", status: "proposed" },
  });
  if (existing) return existing;

  const consultation = consultRepo.create({
    clientUserId,
    caseId,
    type: "free15",
    status: "proposed",
    channel: "video",
    timezone: "UTC",
    durationMinutes: 15,
    legalAdviceDisclaimerAck: false,
    recordingConsent: false,
    privacyPolicyAck: false,
  });

  return await consultRepo.save(consultation);
}
