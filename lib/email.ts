import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

const FROM = 'DoubleN Realty <noreply@doublen-realty.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://doublen-realty.com'

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a3c5e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">DoubleN Realty</h1>
              <p style="margin:6px 0 0;color:#a8c4e0;font-size:13px;">Premium Rentals in Thailand</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} DoubleN Realty &bull;
                <a href="${SITE_URL}" style="color:#1a3c5e;text-decoration:none;">doublen-realty.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function labelValue(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#6b7280;font-size:14px;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:500;vertical-align:top;">${value}</td>
  </tr>`
}

// ---------------------------------------------------------------------------
// Send inquiry notification to landlord
// ---------------------------------------------------------------------------
export async function sendInquiryNotification(params: {
  landlordEmail: string
  propertyTitle: string
  propertySlug: string
  inquirerName: string
  contact: string
  contactType: string
  preferredDate: string | null
  message: string | null
}): Promise<void> {
  const {
    landlordEmail,
    propertyTitle,
    propertySlug,
    inquirerName,
    contact,
    contactType,
    preferredDate,
    message,
  } = params

  const propertyUrl = `${SITE_URL}/en/properties/${propertySlug}`

  const rows = [
    labelValue('Property', `<a href="${propertyUrl}" style="color:#1a3c5e;">${propertyTitle}</a>`),
    labelValue('Inquirer', inquirerName),
    labelValue('Contact', contact),
    labelValue('Contact type', contactType),
    ...(preferredDate ? [labelValue('Preferred date', preferredDate)] : []),
    ...(message ? [labelValue('Message', message.replace(/\n/g, '<br />'))] : []),
  ].join('\n')

  const body = `
    <h2 style="margin:0 0 8px;color:#1a3c5e;font-size:20px;">New Inquiry Received</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Someone is interested in your property on DoubleN Realty.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin-bottom:28px;">
      <tbody>
        ${rows}
      </tbody>
    </table>
    <a href="${propertyUrl}"
       style="display:inline-block;background:#1a3c5e;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">
      View Property
    </a>
  `

  await getResend().emails.send({
    from: FROM,
    to: landlordEmail,
    subject: `New inquiry for "${propertyTitle}"`,
    html: baseLayout(`New inquiry — ${propertyTitle}`, body),
  })
}

// ---------------------------------------------------------------------------
// Send inquiry confirmation to inquirer
// ---------------------------------------------------------------------------
export async function sendInquiryConfirmation(params: {
  email: string
  name: string
  propertyTitle: string
  propertySlug: string
}): Promise<void> {
  const { email, name, propertyTitle, propertySlug } = params
  const propertyUrl = `${SITE_URL}/en/properties/${propertySlug}`

  const body = `
    <h2 style="margin:0 0 8px;color:#1a3c5e;font-size:20px;">We've received your inquiry!</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;">
      Thank you for your interest in <strong>${propertyTitle}</strong>. The landlord has been notified
      and will get back to you shortly.
    </p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;">
      In the meantime, you can revisit the property listing below.
    </p>
    <a href="${propertyUrl}"
       style="display:inline-block;background:#1a3c5e;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">
      View Listing
    </a>
    <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;">
      If you have any questions, reply to this email or contact us at
      <a href="mailto:support@doublen-realty.com" style="color:#1a3c5e;">support@doublen-realty.com</a>.
    </p>
  `

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Your inquiry for "${propertyTitle}" has been received`,
    html: baseLayout(`Inquiry confirmation — ${propertyTitle}`, body),
  })
}

// ---------------------------------------------------------------------------
// Send submission notification to admin
// ---------------------------------------------------------------------------
export async function sendSubmissionNotification(params: {
  adminEmail: string
  submitterEmail: string
  propertyTitle: string
}): Promise<void> {
  const adminEmail = params.adminEmail || process.env.ADMIN_EMAIL || 'janjiranui@gmail.com'
  const { submitterEmail, propertyTitle } = params

  const adminUrl = `${SITE_URL}/admin/properties`

  const rows = [
    labelValue('Property title', propertyTitle),
    labelValue('Submitted by', submitterEmail),
    labelValue('Submitted at', new Date().toUTCString()),
  ].join('\n')

  const body = `
    <h2 style="margin:0 0 8px;color:#1a3c5e;font-size:20px;">New Property Submission</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">A new property has been submitted and is awaiting review.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin-bottom:28px;">
      <tbody>
        ${rows}
      </tbody>
    </table>
    <a href="${adminUrl}"
       style="display:inline-block;background:#1a3c5e;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">
      Review in Admin
    </a>
  `

  await getResend().emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New property submission: "${propertyTitle}"`,
    html: baseLayout(`New submission — ${propertyTitle}`, body),
  })
}
