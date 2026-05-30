import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary-upload";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const DAMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DOC_TYPES = [
  ...DAMAGE_TYPES,
  "application/pdf",
];

export async function POST(req: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const kind = formData.get("kind");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed =
      kind === "insurance" ? DOC_TYPES : DAMAGE_TYPES;
    const folder =
      kind === "insurance" ? "ch-erawan/booking/insurance" : "ch-erawan/booking/damage";

    const url = await uploadToCloudinary(file, {
      folder,
      allowedTypes: allowed,
      maxBytes: MAX_BYTES,
      resourceType: file.type === "application/pdf" ? "raw" : "image",
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status =
      message === "Invalid file type" || message === "File too large" ? 400 : 500;
    if (status === 500) console.error("Booking upload error:", err);
    return NextResponse.json({ error: message }, { status });
  }
}
