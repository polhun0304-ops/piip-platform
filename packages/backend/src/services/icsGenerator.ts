import { Consultation } from "../entities/Consultation";
import { format } from "date-fns";
import { Response } from "express";

/**
 * 상담 예약 정보를 기반으로 ICS 캘린더 파일 생성
 * @param consultation 상담 정보
 * @returns string (ICS 파일 내용)
 */
export function generateICS(consultation: Consultation): string {
  if (!consultation.scheduledAt) return "";

  const dtStart = format(
    new Date(consultation.scheduledAt),
    "yyyyMMdd'T'HHmmss"
  );
  const dtEnd = format(
    new Date(
      new Date(consultation.scheduledAt).getTime() +
        1000 *
          60 *
          (consultation.duration || consultation.durationMinutes || 15)
    ),
    "yyyyMMdd'T'HHmmss"
  );
  const uid = `consultation-${consultation.id}@piip-platform`;
  const summary =
    consultation.type === "paid30" ? "상담 예약 (30분)" : "상담 예약 (15분)";
  const description = consultation.notes || "상담 일정 안내";
  const location = consultation.meetingUrl || "온라인";

  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//piip-platform//Consultation//EN\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dtStart}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:${summary}\nDESCRIPTION:${description}\nLOCATION:${location}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
}

/**
 * ICS 파일을 다운로드 링크로 반환 (Express용)
 */
export function sendICSFile(res: Response, consultation: Consultation) {
  const ics = generateICS(consultation);
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=consultation_${consultation.id}.ics`
  );
  res.send(ics);
}
