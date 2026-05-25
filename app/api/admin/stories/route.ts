import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllStories, updateStoryStatus } from "@/lib/notion";

// GET /api/admin/stories — list all stories (admin view, all statuses)
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") as "pending" | "approved" | "rejected" | null;
    const stories = await getAllStories(status ?? undefined);
    return NextResponse.json(stories);
  } catch (err) {
    console.error("Admin stories GET error:", err);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}

// PATCH /api/admin/stories — moderate (approve/reject)
const patchSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = patchSchema.parse(body);
    const status = action === "approve" ? "approved" : "rejected";
    await updateStoryStatus(id, status, action === "approve");
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    console.error("Admin stories PATCH error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
