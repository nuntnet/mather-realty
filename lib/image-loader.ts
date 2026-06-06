/**
 * Custom Next.js image loader for Cloudinary.
 *
 * Format strategy (sharpness vs file size):
 * - width >= 1200 (hero / fullscreen) → f_jpg  (JPEG, no AVIF)
 *   AVIF can look over-smoothed on detailed photos; JPEG preserves fine
 *   texture better at these sizes.
 * - width 640–1199 (gallery cards, list thumbnails) → f_webp
 * - width < 640 (small thumbnails, avatars) → f_auto (smallest file)
 *
 * Quality:
 * - Explicit `quality` prop → q_{value}
 * - width >= 1200 → q_90  (hero: near-lossless)
 * - width >= 640  → q_auto:good
 * - width < 640   → q_auto:eco
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
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const [base, rest] = src.split("/upload/");

    // Format selection
    const f = width >= 1200 ? "f_jpg" : width >= 640 ? "f_webp" : "f_auto";

    // Quality selection
    const q = quality
      ? `q_${quality}`
      : width >= 1200
      ? "q_90"
      : width >= 640
      ? "q_auto:good"
      : "q_auto:eco";

    // Replace an existing w_ transform
    const updated = rest.replace(/w_\d+/, `w_${width}`);
    if (updated !== rest) {
      // Replace or prepend quality
      const withQ = updated.replace(/q_[^,/]+/, q);
      // Replace or prepend format
      const withF = withQ.replace(/f_[^,/]+/, f);
      // If both were already there, return as-is
      if (withF !== withQ) return `${base}/upload/${withF}`;
      if (withQ !== updated) return `${base}/upload/${f},${withQ}`;
      return `${base}/upload/${f},${q},${updated}`;
    }

    // No w_ yet — prepend into existing transforms
    if (/^[a-z]/.test(rest) && rest.includes(",")) {
      return `${base}/upload/${f},${q},w_${width},${rest}`;
    }

    // Plain URL — add all transforms
    return `${base}/upload/${f},${q},w_${width}/${rest}`;
  }

  // Non-Cloudinary: serve as-is
  return src;
}
