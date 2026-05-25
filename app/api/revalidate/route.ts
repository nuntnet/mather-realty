import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

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
      revalidatePath("/"); // home shows recent posts
    } else if (type === "cars") {
      revalidatePath("/cars");
      if (slug) revalidatePath(`/cars/${slug}`);
      revalidatePath("/");
    } else if (type === "stories") {
      revalidatePath("/stories");
      revalidatePath("/");
    } else {
      // revalidate everything
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ revalidated: true, type: type ?? "all" });
  } catch (err) {
    console.error("Revalidate error:", err);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
