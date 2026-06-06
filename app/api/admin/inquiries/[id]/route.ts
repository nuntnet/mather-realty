import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { inquiries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

const schema = z.object({
  status: z.enum(["contacted", "booked", "declined"]),
});

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { inquiries } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const inquiryId = parseInt(id, 10);

  if (isNaN(inquiryId)) {
    return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status } = schema.parse(body);

    const db = getDb();
    const updated = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, inquiryId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: updated[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error(`PATCH /api/admin/inquiries/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
