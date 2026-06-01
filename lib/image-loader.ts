/**
 * Custom Next.js image loader.
 *
 * - Cloudinary URLs: serve directly (already optimized with f_auto/q_auto/w_X)
 *   → bypasses Vercel image optimization quota entirely.
 *   Width param from next/image srcset replaces the Cloudinary w_ transform
 *   so responsive srcset still works — just served from Cloudinary CDN.
 *
 * - Everything else (Notion, external CDN): proxy through Vercel /_next/image
 *   as normal.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.includes("res.cloudinary.com")) {
    if (!src.includes("/upload/")) return src;

    const [base, rest] = src.split("/upload/");

    // Update existing w_ transform to match requested width, giving proper responsive srcset
    const updated = rest.replace(/w_\d+/, `w_${width}`);

    if (updated !== rest) {
      // Had a width transform — replaced it
      return `${base}/upload/${updated}`;
    }

    // No w_ yet — insert w_ into existing transforms or add fresh ones
    if (/^[a-z]/.test(rest) && rest.includes(",")) {
      // Starts with transform params (e.g. "f_auto,q_auto:best/v123/...")
      return `${base}/upload/w_${width},${rest}`;
    }

    // No transforms at all — add a full set
    return `${base}/upload/f_auto,q_auto:best,w_${width}/${rest}`;
  }

  // Non-Cloudinary: use Vercel's built-in image optimization
  const q = quality ?? 75;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}
