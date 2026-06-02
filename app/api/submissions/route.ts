import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { submissions } from "@/lib/db/schema";
import { sendSubmissionNotification } from "@/lib/email";

const schema = z.object({
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(1).max(50),
  dataJson: z.string(),
  imagesJson: z.string().optional().default("[]"),
});

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { submissions } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const db = getDb();
    const now = new Date().toISOString();

    await db.insert(submissions).values({
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      dataJson: data.dataJson,
      imagesJson: data.imagesJson,
      status: "pending",
      submittedAt: now,
    });

    // Derive a display title from dataJson for the notification
    let propertyTitle = "New Property";
    try {
      const parsed = JSON.parse(data.dataJson);
      propertyTitle = parsed?.title ?? parsed?.address ?? "New Property";
    } catch {
      // ignore parse errors
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@doublen-realty.com";

    sendSubmissionNotification({
      adminEmail,
      submitterEmail: data.ownerEmail,
      propertyTitle,
    }).catch((err) => console.error("Failed to send submission notification:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/submissions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
