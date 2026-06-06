import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { inquiries, properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendInquiryNotification } from "@/lib/email";

const schema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(1).max(200),
  contact: z.string().min(1).max(500),
  contactType: z.enum(["line", "wechat", "whatsapp", "email", "phone"]),
  preferredDate: z.string().optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { inquiries, properties } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const db = getDb();

    // Fetch property to get landlord email + title + slug
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, data.propertyId))
      .get();

    const now = new Date().toISOString();

    const result = await db
      .insert(inquiries)
      .values({
        propertyId: data.propertyId,
        name: data.name,
        contact: data.contact,
        contactType: data.contactType,
        preferredDate: data.preferredDate ?? null,
        message: data.message ?? null,
        status: "new",
        createdAt: now,
      })
      .returning({ id: inquiries.id });

    const inquiryId = result[0]?.id;

    // Fire-and-forget email notification
    if (property) {
      // Send to both owners
      const recipients = ['janjiranui@gmail.com', 'nuntnet@gmail.com']

      recipients.forEach(landlordEmail => {
        sendInquiryNotification({
          landlordEmail,
          propertyTitle: (property as { address?: string | null }).address ?? data.propertyId,
          propertySlug: (property as { slug?: string | null }).slug ?? data.propertyId,
          inquirerName: data.name,
          contact: data.contact,
          contactType: data.contactType,
          preferredDate: data.preferredDate ?? null,
          message: data.message ?? null,
        }).catch((err) => console.error("Failed to send inquiry notification:", err))
      })
    }

    return NextResponse.json({ success: true, inquiryId }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/inquiries error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
