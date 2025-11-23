import { Consultation } from "../entities/Consultation";
/**
 * Zoom/Google Meet URL 자동 생성 (예시: Zoom)
 */
export declare function createMeetingUrl(consultation: Consultation): Promise<string>;
/**
 * Google Meet URL 생성 (Google Calendar API OAuth2 연동 예시)
 */
export declare function createGoogleMeetUrl(consultation: Consultation): Promise<string>;
