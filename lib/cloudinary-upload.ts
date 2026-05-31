import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadToCloudinary(
  file: File,
  options: {
    folder: string;
    allowedTypes: string[];
    maxBytes: number;
    resourceType?: "image" | "raw" | "auto";
  }
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  if (!options.allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  if (file.size > options.maxBytes) {
    throw new Error("File too large");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder,
    resource_type: options.resourceType ?? "auto",
  });

  // Insert delivery transforms into URL so all consumers get WebP/AVIF + compressed output
  // regardless of whether they use <Image> or <img>
  return result.secure_url.replace(
    "/upload/",
    "/upload/f_auto,q_auto:best,w_1920/"
  );
}
