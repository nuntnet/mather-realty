const CLOUDINARY_HOST = "res.cloudinary.com";

type CldPreset = "card" | "full" | "thumb" | "quality";

const PRESETS: Record<CldPreset, string> = {
  thumb:   "f_auto,q_auto:best,w_400",
  card:    "f_auto,q_auto:best,w_800",
  full:    "f_auto,q_auto:best,w_1920",
  quality: "f_auto,q_auto:best",         // format+quality only, no resize (use with next/image)
};

/**
 * Insert Cloudinary delivery transforms into a URL.
 * Safe to call on non-Cloudinary URLs — returns them unchanged.
 */
export function cldUrl(url: string | undefined | null, preset: CldPreset = "card"): string {
  if (!url) return "";
  if (!url.includes(CLOUDINARY_HOST)) return url;
  if (url.includes("/upload/f_") || url.includes("/upload/q_")) return url; // already transformed
  return url.replace("/upload/", `/upload/${PRESETS[preset]}/`);
}
