import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required").max(5000),
});

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

const FROM = "Mather <noreply@mather.to>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mather.to";

function emailHtml(name: string, email: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a3c5e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Mather</h1>
              <p style="margin:6px 0 0;color:#a8c4e0;font-size:13px;">New Contact Form Submission</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 24px;color:#1a3c5e;font-size:20px;">New message from ${name}</h2>
              <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin-bottom:28px;">
                <tbody>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:14px;width:120px;vertical-align:top;">Name</td>
                    <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:500;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;">Email</td>
                    <td style="padding:10px 0;font-size:14px;"><a href="mailto:${email}" style="color:#1a3c5e;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;">Message</td>
                    <td style="padding:10px 0;color:#111827;font-size:14px;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;">Received</td>
                    <td style="padding:10px 0;color:#111827;font-size:14px;">${new Date().toUTCString()}</td>
                  </tr>
                </tbody>
              </table>
              <a href="mailto:${email}"
                 style="display:inline-block;background:#1a3c5e;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">
                Reply to ${name}
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} Mather &bull;
                <a href="${SITE_URL}" style="color:#1a3c5e;text-decoration:none;">mather.to</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Validation failed" },
        { status: 422 }
      );
    }

    const { name, email, message } = result.data;

    // Log to console for debugging / serverless trace
    console.log("[contact] New message", { name, email, ts: new Date().toISOString() });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@mather.to";
    const resend = getResend();

    try {
      await resend.emails.send({
        from: FROM,
        to: adminEmail,
        replyTo: email,
        subject: `Contact form: message from ${name}`,
        html: emailHtml(name, email, message),
      });
    } catch (emailErr) {
      // Don't fail the request just because email failed — log and continue
      console.error("[contact] Failed to send notification email:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
