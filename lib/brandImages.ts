/**
 * Brand card / fallback images — official manufacturer press assets.
 */
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "n5llrdnq";

export const BRAND_IMAGES: Record<string, string> = {
  Mazda:
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-5_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
  Ford: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/ch-erawan/cars/ford-ranger-wildtrak-2026-1.jpg`,
  Mitsubishi:
    "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/cars/l200/2024/primary/hero/all-new-triton-2024-edit-jun.png",
  GWM:
    "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/haval-h6-hev/h6-kv-pc-1-2.jpg",
  Deepal:
    "https://www.changan.co.th/cache/images/AljG4xVwhLAOAcrZPSadP7bV9kVVdgvO9Jo2VT5lReI/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vZGVlcGFsX1MwN19pbl9vcmFuZ2VfZmU4MzhjODkyMi5qcGc.webp",
  Kia:
    "https://www.kia.com/content/dam/kwcms/th/th/images/showroom/carnival-pe/0-Banner/Rev.2_The-new-Kia-Carnival32_1920x1080.jpg",
  default:
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-5_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
};
