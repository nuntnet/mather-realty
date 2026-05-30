import nodemailer from "nodemailer";

const TYPE_LABELS: Record<string, string> = {
  test_drive: "ทดลองขับ",
  service: "เข้าศูนย์บริการ",
  body_paint: "แจ้งซ่อมตัวถัง/สี",
  insurance_quote: "ขอใบเสนอราคาประกัน",
};

export interface AppointmentEmailPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: string;
  carModel?: string;
  branch?: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}

function buildPlainTextBody(data: AppointmentEmailPayload): string {
  const lines = [
    "มีการนัดหมายใหม่จากเว็บไซต์ ช.เอราวัณ ออโต้ กรุ๊ป",
    "",
    `ประเภท: ${TYPE_LABELS[data.type] ?? data.type}`,
    `ชื่อลูกค้า: ${data.customerName}`,
    `เบอร์โทร: ${data.customerPhone}`,
  ];
  if (data.customerEmail) lines.push(`อีเมล: ${data.customerEmail}`);
  if (data.carModel) lines.push(`รุ่นรถ: ${data.carModel}`);
  if (data.branch) lines.push(`สาขา: ${data.branch}`);
  if (data.preferredDate) lines.push(`วันที่ต้องการ: ${data.preferredDate}`);
  if (data.preferredTime) lines.push(`เวลา: ${data.preferredTime}`);
  if (data.notes) lines.push(`หมายเหตุ: ${data.notes}`);
  lines.push("", "กรุณาติดต่อลูกค้าภายใน 24 ชั่วโมง");
  return lines.join("\n");
}

async function sendViaResend(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  if (!apiKey) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend failed:", res.status, err);
    return false;
  }
  return true;
}

async function sendViaSmtp(to: string, subject: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return false;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject,
    text,
  });
  return true;
}

/** Notify dealer of a new appointment. Gracefully skips if email is not configured. */
export async function sendAppointmentNotification(
  data: AppointmentEmailPayload
): Promise<{ sent: boolean; channel?: "resend" | "smtp" | "none" }> {
  const to = process.env.APPOINTMENT_NOTIFY_EMAIL;
  if (!to) {
    console.warn("[email] APPOINTMENT_NOTIFY_EMAIL not set — skipping notification");
    return { sent: false, channel: "none" };
  }

  const subject = `[นัดหมายใหม่] ${TYPE_LABELS[data.type] ?? data.type} — ${data.customerName}`;
  const text = buildPlainTextBody(data);

  try {
    if (await sendViaResend(to, subject, text)) {
      return { sent: true, channel: "resend" };
    }
    if (await sendViaSmtp(to, subject, text)) {
      return { sent: true, channel: "smtp" };
    }
    console.warn("[email] No email provider configured — notification logged only");
    console.info("[email] Would notify:", subject);
    return { sent: false, channel: "none" };
  } catch (err) {
    console.error("[email] Failed to send appointment notification:", err);
    return { sent: false, channel: "none" };
  }
}
