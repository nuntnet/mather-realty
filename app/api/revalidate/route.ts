import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProperties } from "@/lib/notion";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/lib/db/schema";

async function syncPropertiesToTurso() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return { synced: 0, error: "TURSO_DATABASE_URL not set" };

  try {
    const props = await getProperties(undefined, "en");
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    const db = drizzle(client, { schema: { properties } });

    for (const p of props) {
      await db
        .insert(properties)
        .values({
          id: p.id,
          notionPageId: p.id,
          slug: p.slug || null,
          status: p.status,
          availableFrom: p.availableFrom || null,
          address: p.address || null,
          city: p.city || null,
          district: p.district || null,
          lat: p.lat || null,
          lng: p.lng || null,
          priceTHB: p.priceTHB || null,
          bedrooms: p.bedrooms || null,
          bathrooms: p.bathrooms || null,
          sizeSqm: p.sizeSqm || null,
          verifiedAt: p.verifiedAt || null,
          approvedAt: p.approvedAt || null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })
        .onConflictDoUpdate({
          target: properties.id,
          set: {
            slug: p.slug || null,
            status: p.status,
            availableFrom: p.availableFrom || null,
            address: p.address || null,
            city: p.city || null,
            district: p.district || null,
            lat: p.lat || null,
            lng: p.lng || null,
            priceTHB: p.priceTHB || null,
            bedrooms: p.bedrooms || null,
            bathrooms: p.bathrooms || null,
            sizeSqm: p.sizeSqm || null,
            verifiedAt: p.verifiedAt || null,
            approvedAt: p.approvedAt || null,
            updatedAt: p.updatedAt,
          },
        });
    }

    await client.close();
    return { synced: props.length };
  } catch (err) {
    return { synced: 0, error: String(err) };
  }
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type as string | undefined;
    const slug = body.slug as string | undefined;

    if (type === "blog") {
      revalidatePath("/blog");
      if (slug) revalidatePath(`/blog/${slug}`);
      revalidatePath("/");
    } else if (type === "properties" || !type) {
      // Sync Notion → Turso whenever properties are revalidated
      const sync = await syncPropertiesToTurso();
      revalidatePath("/properties", "layout");
      if (slug) revalidatePath(`/properties/${slug}`);
      revalidatePath("/");
      return NextResponse.json({ revalidated: true, type: type ?? "all", sync });
    } else {
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ revalidated: true, type: type ?? "all" });
  } catch (err) {
    console.error("Revalidate error:", err);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
