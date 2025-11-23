import { Consultation } from "../entities/Consultation";
import { Response } from "express";
/**
 * 상담 예약 정보를 기반으로 ICS 캘린더 파일 생성
 * @param consultation 상담 정보
 * @returns string (ICS 파일 내용)
 */
export declare function generateICS(consultation: Consultation): string;
/**
 * ICS 파일을 다운로드 링크로 반환 (Express용)
 */
export declare function sendICSFile(res: Response, consultation: Consultation): void;
