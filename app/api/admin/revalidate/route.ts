import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const LOCALES = [
  "en", "th", "zh-CN", "zh-TW", "ja", "ko",
  "ru", "de", "fr", "es", "it", "nl", "sv", "ar", "hi",
];

const schema = z.object({
  type: z.enum(["all", "properties", "blog"]).optional(),
  /** When provided, revalidate a single property slug across all locales. */
  slug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const { type = "all", slug } = schema.parse(body);

    const revalidated: string[] = [];

    if (slug) {
      // Revalidate a single property listing across all locales
      for (const locale of LOCALES) {
        const path = `/${locale}/properties/${slug}`;
        revalidatePath(path);
        revalidated.push(path);
      }
    } else if (type === "properties") {
      for (const locale of LOCALES) {
        revalidatePath(`/${locale}/properties`);
        revalidated.push(`/${locale}/properties`);
      }
    } else if (type === "blog") {
      for (const locale of LOCALES) {
        revalidatePath(`/${locale}/blog`);
        revalidated.push(`/${locale}/blog`);
      }
    } else {
      // Revalidate all property listing pages and the root layout
      for (const locale of LOCALES) {
        revalidatePath(`/${locale}/properties`);
        revalidatePath(`/${locale}/blog`);
        revalidated.push(`/${locale}/properties`, `/${locale}/blog`);
      }
      revalidatePath("/", "layout");
      revalidated.push("/");
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      at: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: err.issues }, { status: 400 });
    }
    console.error("Admin revalidate error:", err);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
