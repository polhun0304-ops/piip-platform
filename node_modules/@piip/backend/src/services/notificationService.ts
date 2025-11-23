import { Consultation } from "../entities/Consultation";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { format } from "date-fns";

const twilioClient = twilio(process.env.TWILIO_SID!, process.env.TWILIO_TOKEN!);

/**
 * 상담 예약 리마인더 발송 (T-24h, T-2h)
 */
export async function sendReminders(consultation: Consultation) {
  if (!consultation.scheduledAt || !consultation.clientContact) return;
  const now = new Date();
  const scheduled = new Date(consultation.scheduledAt);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);

  // T-24h, T-2h만 발송
  if (Math.abs(diffH - 24) < 0.5) {
    await sendReminder(consultation, "24시간 후 상담이 시작됩니다.");
  }
  if (Math.abs(diffH - 2) < 0.5) {
    await sendReminder(consultation, "2시간 후 상담이 시작됩니다.");
  }
}

async function sendReminder(consultation: Consultation, message: string) {
  if (!consultation.scheduledAt) return;
  const scheduledDate = new Date(consultation.scheduledAt);

  // 이메일
  if (consultation.clientEmail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: consultation.clientEmail,
      subject: "상담 일정 리마인더",
      text: `${message}\n상담 일정: ${format(scheduledDate, "yyyy-MM-dd HH:mm")}`,
    });
  }
  // SMS
  if (consultation.clientContact) {
    await twilioClient.messages.create({
      body: `${message}\n상담 일정: ${format(scheduledDate, "yyyy-MM-dd HH:mm")}`,
      from: process.env.TWILIO_FROM,
      to: consultation.clientContact,
    });
  }
}
