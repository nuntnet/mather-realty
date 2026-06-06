/**
 * Custom Next.js image loader.
 *
 * IMPORTANT: Setting `images.loaderFile` globally DISABLES Next.js's built-in
 * `/_next/image` optimization endpoint. So this loader must NEVER return a
 * `/_next/image?...` URL — that endpoint no longer exists and would 400.
 *
 * Strategy:
 * - Cloudinary URLs  → return a Cloudinary URL with a `w_<width>` transform so
 *   responsive srcset works, served straight from Cloudinary's CDN. This is the
 *   bulk of the site's images (cars, hero, brands, awards, team) and costs zero
 *   Vercel image-optimization quota.
 * - Everything else (local /public SVGs like brand logos, the few remaining
 *   external raster URLs) → passthrough the original src unchanged. SVGs are
 *   vectors and need no optimization; remaining rasters are rare since almost
 *   all images were migrated to Cloudinary.
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
    // q_auto:best for large images (hero, gallery full-screen), q_auto:good otherwise
    const q = quality ? `q_${quality}` : width >= 1024 ? "q_auto:best" : "q_auto:good";

    // Replace an existing w_ transform with the requested width (responsive srcset)
    const updated = rest.replace(/w_\d+/, `w_${width}`);
    if (updated !== rest) {
      // Also update quality if present, or prepend it
      const withQ = updated.replace(/q_[^,/]+/, q);
      return `${base}/upload/${withQ !== updated ? withQ : `${q},${updated}`}`;
    }

    // No w_ yet — prepend width+quality into existing transform params
    if (/^[a-z]/.test(rest) && rest.includes(",")) {
      return `${base}/upload/f_auto,${q},w_${width},${rest}`;
    }

    // No transforms at all — add full set
    return `${base}/upload/f_auto,${q},w_${width}/${rest}`;
  }

  // Local SVGs, /public assets, and any non-Cloudinary URL: serve as-is.
  return src;
}
