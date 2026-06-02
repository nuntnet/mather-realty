import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProperty } from "@/lib/notion";
import { syncPropertyToAlgolia } from "@/lib/algolia";

const schema = z.object({
  propertyId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { propertyId } = schema.parse(body);

    const property = await getProperty(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await syncPropertyToAlgolia(property);

    return NextResponse.json({ success: true, propertyId }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/webhooks/algolia-sync error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
