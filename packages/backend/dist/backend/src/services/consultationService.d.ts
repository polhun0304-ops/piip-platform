import { Consultation } from "../entities/Consultation";
/**
 * 노쇼 감지 및 상태 전환
 * - scheduledAt + gracePeriod(10분) 경과 후 started 상태가 아니면 no-show 처리
 */
export declare function detectNoShow(consultation: Consultation): Promise<boolean | undefined>;
