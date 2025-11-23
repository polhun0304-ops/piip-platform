import { Consultation } from "../entities/Consultation";
import axios from "axios";
import { google } from "googleapis";

/**
 * Zoom/Google Meet URL 자동 생성 (예시: Zoom)
 */
export async function createMeetingUrl(
  consultation: Consultation
): Promise<string> {
  // Zoom API 예시 (실제 토큰/계정 필요)
  const zoomToken = process.env.ZOOM_JWT_TOKEN;
  const userId = process.env.ZOOM_USER_ID;
  const scheduledAt = consultation.scheduledAt;
  const duration = consultation.durationMinutes || 30;
  const topic = "상담 예약";

  const res = await axios.post(
    `https://api.zoom.us/v2/users/${userId}/meetings`,
    {
      topic,
      type: 2, // 예약 미팅
      start_time: scheduledAt,
      duration,
      timezone: "Asia/Seoul",
      settings: { join_before_host: true },
    },
    {
      headers: { Authorization: `Bearer ${zoomToken}` },
    }
  );
  return res.data.join_url;
}

/**
 * Google Meet URL 생성 (Google Calendar API OAuth2 연동 예시)
 */
export async function createGoogleMeetUrl(
  consultation: Consultation
): Promise<string> {
  // TODO: Google Calendar API 연동 구현
  // return "(구현 필요)";
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  if (!consultation.scheduledAt) throw new Error("scheduledAt is required");
  const startDate = new Date(String(consultation.scheduledAt));
  const endDate = new Date(
    startDate.getTime() + (consultation.durationMinutes || 30) * 60000
  );
  const event = {
    summary: "상담 예약",
    start: { dateTime: startDate.toISOString(), timeZone: "Asia/Seoul" },
    end: { dateTime: endDate.toISOString(), timeZone: "Asia/Seoul" },
    conferenceData: {
      createRequest: { requestId: `meet-${consultation.id}` },
    },
  };
  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: event,
  });
  return res.data.hangoutLink || "";
}
