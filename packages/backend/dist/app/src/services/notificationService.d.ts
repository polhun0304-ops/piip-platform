import { Consultation } from "../entities/Consultation";
/**
 * 상담 예약 리마인더 발송 (T-24h, T-2h)
 */
export declare function sendReminders(consultation: Consultation): Promise<void>;
