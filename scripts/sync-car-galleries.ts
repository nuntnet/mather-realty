/**
 * Audit + sync car image galleries to Cloudinary and Notion.
 *
 * Run: bun run scripts/sync-car-galleries.ts
 * Audit only: bun run scripts/sync-car-galleries.ts --audit
 *
 * Requires .env.local: NOTION_*, CLOUDINARY_*
 */

import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { getAllCarsAdmin, updateCar, archiveCar } from "../lib/notion";

config({ path: ".env.local" });

const auditOnly = process.argv.includes("--audit");
const deepalOnly = process.argv.includes("--deepal-only");

const DEEPAL_ARCHIVE_SLUGS = [
  "deepal-s05-bev-2025",
  "deepal-l07-bev-2025",
  "deepal-s07-bev-2025",
];

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Official / Commons press images per slug (multiple = gallery) */
const GALLERY_SOURCES: Record<string, string[]> = {
  "ford-ranger-wildtrak-2026": [
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/Ford_Ranger_4x2_Wildtrak_2024.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f0/Ford_Ranger_4x2_Wildtrak_2024_%281%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/0c/Ford_Ranger_4x2_Wildtrak_2024_%282%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/PIMS_2024_-_Ford_Ranger_2.0_Turbo_Wildtrak_4x2.jpg",
  ],
  "ford-everest-platinum-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c6/Ford_Everest_III_01_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/00/Ford_Everest_III_02_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/Ford_Everest_Titanium_29082022.jpg",
  ],
  "ford-ranger-raptor-2026": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e9/Ford_Ranger_Raptor_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/Ford_Ranger_4x2_Wildtrak_2024.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/PIMS_2024_-_Ford_Ranger_2.0_Turbo_Wildtrak_4x2.jpg",
  ],
  "ford-everest-sport-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c6/Ford_Everest_III_01_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/00/Ford_Everest_III_02_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/Ford_Everest_Titanium_29082022.jpg",
  ],
  "mazda-cx-5-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-5_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/21/2024_Mazda_CX-5_Suna_in_Zircon_Sand_Metallic%2C_Front_Left%2C_2024-03-03.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/30/2024_Mazda_CX-5_Suna_in_Zircon_Sand_Metallic%2C_Rear_Left%2C_2024-03-03.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/06/Mazda_CX-5_25S_Silk_Beige_Selection_%286BA-KF5P%29_front.jpg",
  ],
  "mazda-cx-30-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-30_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/38/2025_Mazda_CX-30_GT_Turbo_in_Ceramic_Metallic%2C_front_left%2C_2025-05-18.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3a/2022_Mazda_CX-30_Carbon_Edition.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/Mazda_CX-30_Touring%2C_2020_rear.jpg",
  ],
  "mazda-cx-3-essential-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-3_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/da/Mazda_CX-3_2.0_SKYACTIV-G_150_AWD_Exclusive-Line_Frontalansicht.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/de/Mazda_CX-3_2.0_SKYACTIV-G_150_AWD_Exclusive-Line_Heckansicht.jpg",
  ],
  "mazda-mazda3-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mazda3_SKYACTIV-G.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a7/Mazda3_SKYACTIV-G_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/58/2014_Mazda_3_Sedan_%28BM%29_2.0_SkyActiv_%28CBU%29_4-door_sedan_%2819518725478%29.jpg",
  ],
  "mazda-bt-50-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/b/bc/2024_Mazda_BT-50_Hi-Racer_Double-Cab_2.2_XT.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/16/2021_Mazda_BT-50_Hi-Racer_Freestyle_Cab_1.9_C.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3f/2024_Mazda_BT-50_Hi-Racer_Double-Cab_3.0_SP.jpg",
  ],
  "mazda-mazda2-essential-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-04/MAZDA-2-Essential_Home-Banner-%28Desktop%29_3840x1700px.jpg",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2025-03/IMG-Model-90_1400x700_New-Mazda2-Sedan.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2025-03/IMG_Homepage%20Model%20BG-Desktop_Mazda2%20Sedan%201.3%20Ultra%201.jpg",
  ],
  "mazda-mazda6-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/90_1400x700_Mazda6.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/Mazda6_GLRD_GGPWRAH_51F_GW6_EXT_45.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/Mazda6_GLRD_GGPWRAH_51K_GW6_EXT_High_PNG.webp",
  ],
  "mazda-mazda6e-2026": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/45_1400x700_Mazda6e_Black_46V_0.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2025-11/90_1400x700_Mazda6e_Tan_46V.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-04/Mazda6e-option1-desktop%20%281%29.png",
  ],
  "mazda-cx-8-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/90_1400x700_CX-8.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/CX-8_ZDR5_ZV3HRAA_47S_KE7_EXT_45.webp",
    "https://upload.wikimedia.org/wikipedia/commons/8/83/Mazda_CX-5_and_Mazda_CX-8_%281%29.jpg",
  ],
  "mazda-mx-5-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2025-03/IMG_Homepage%20Model%20BG-Desktop_NEW%20MAZDA%20MX-5_35th%20Anniversary.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/MX-5_NER1_NG8JRAB_52C_NL4_EXT_45.webp",
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/MX-5_NER1_NG8JRAB_52C_NL4_EXT_High_PNG.webp",
  ],
  "mitsubishi-triton-2024": [
    "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/cars/l200/2024/primary/hero/all-new-triton-2024-edit-jun.png",
    "https://upload.wikimedia.org/wikipedia/commons/a/af/2023_Mitsubishi_Triton_Athlete_Double-Cab_2.4_4WD.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/25/2023_Mitsubishi_Triton_Double-Cab_2.4_Plus_Ultra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Royal_Thai_Army%2C_Mitsubishi_L200-Triton_utility_vehicle..jpg",
  ],
  "mitsubishi-xpander-cross-hev-2026": [
    "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/cars/xpander-cross-hev/2026/primary/U28_0_26Xpander-Cross-01_Side_recrop.png",
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/2024_Mitsubishi_Xpander_Cross_HEV.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/d4/2024_Mitsubishi_Xpander_HEV.jpg",
  ],
  "mitsubishi-pajero-sport-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c6/Mitsubishi_Montero_Sport_4x2_GLS_2023_%283%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/02/2017_Mitsubishi_Pajero_Sport_2.4_Dakar_Ultimate_wagon_%28KR1W%3B_12-22-2018%29%2C_South_Tangerang.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c0/2013_Mitsubishi_Pajero_Sport_Exceed_Limited_4x2_2.5_KG4W_%2820210211%29.jpg",
  ],
  "mitsubishi-xpander-hev-2026": [
    "https://upload.wikimedia.org/wikipedia/commons/d/d4/2024_Mitsubishi_Xpander_HEV.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/2024_Mitsubishi_Xpander_Cross_HEV.jpg",
  ],
  "mitsubishi-attrage-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mitsubishi_Mirage_G4_1.2_GLS_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mitsubishi_Mirage_G4_1.2_GLS_2022.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/2019_Mitsubishi_Mirage_G4_ES_in_Sapphire_Blue%2C_Front_Left%2C_10-09-2023.jpg",
  ],
  "gwm-haval-h6-hev-2025": [
    "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/haval-h6-hev/h6-kv-pc-1-2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/5d/2021_Haval_Jolion_HEV_Ultra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6e/2023_Haval_Jolion_HEV_Sport.jpg",
  ],
  "gwm-ora-05-bev-2025": [
    "https://www.gwm.co.th/content/dam/gwm/pages/th/en/homepage/kv/ora5-ev-1.jpg",
    "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/ora-07/ora-07-kv-pc.jpg",
  ],
  "gwm-tank-300-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/9/98/2023_TANK_300_HEV_Ultra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e1/2023_TANK_300_HEV_Ultra_%28Rear%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/08/2023_TANK_300_HEV_Ultra_%28Cockpit%29.jpg",
  ],
  "gwm-haval-jolion-hev-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/5/5d/2021_Haval_Jolion_HEV_Ultra.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6e/2023_Haval_Jolion_HEV_Sport.jpg",
  ],
  "gwm-poer-sahar-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/2024_GWM_Poer_Sahar_PHEV_front_view.png",
    "https://upload.wikimedia.org/wikipedia/commons/0/04/Great_Wall_King_Kong_Cannon_005.jpg",
  ],
  "deepal-lumin-2026": [
    "https://api.www.changan.co.th/uploads/lumin_LDC_e87edb1721.jpg",
    "https://www.changan.co.th/cache/images/dPIhSPZDV_S3svLLYfujiKsi8NWbJ6kTC2l7w567tqE/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vSW50ZXJpb3JfQ29sb3JfTHVtaW5fMDJfODgyNzc4ZGM4Ni5qcGc.webp",
    "https://www.changan.co.th/cache/images/nd6-epgFlBcdux7bF4tY0MhhD-pW2eHCFCmb7fd94EE/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vSW50ZXJpb3JfQ29sb3JfTHVtaW5fMDFfYzBjZGRjZjNiZS5qcGc.webp",
    "https://www.changan.co.th/cache/images/mR1FP_Q_34OSNdadJXTyV0uCIRRku6vMGj-8ERuxrnU/rs:fit:640/q:75/max_bytes:120000/bG9jYWw6Ly8vRmVhdHVyZXNfTHVtaW5fMDNfMjY5MjRlNWE1MS5qcGc.webp",
    "https://www.changan.co.th/cache/images/7Su8-d_YjgFi1ODS5K0s9XcFxWy6CtebygTdr77bMvA/rs:fit:640/q:75/max_bytes:120000/bG9jYWw6Ly8vTHVtaW5fQ29ybl8wM184ZmFiNTU1MGE2LnBuZw.webp",
  ],
  "deepal-nevo-q05-2026": [
    "https://www.changan.co.th/images/nevo/q05/kv/kv-q05-pc.jpg?v2",
    "https://www.changan.co.th/images/nevo/q05/car/Q05-white.png",
    "https://www.changan.co.th/images/nevo/q05/car/Q05-black.png",
    "https://www.changan.co.th/images/nevo/q05/car/Q05-gray.png",
    "https://www.changan.co.th/images/nevo/q05/car/Q05-pink.png",
  ],
  "deepal-s07-bev-2026": [
    "https://www.changan.co.th/cache/images/AljG4xVwhLAOAcrZPSadP7bV9kVVdgvO9Jo2VT5lReI/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vZGVlcGFsX1MwN19pbl9vcmFuZ2VfZmU4MzhjODkyMi5qcGc.webp",
    "https://www.changan.co.th/cache/images/rOLWJuRUqhtrIX42X3w_KTrirVkjo_FJJvGs6TfoEcU/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vZGVlcGFsX1MwN19pbl9ibGFja19iNDU0MGVjZWVlLmpwZw.webp",
    "https://www.changan.co.th/cache/images/o1rpnJzgayPn2r459DSdk-34ZbSvX28N1VlBJ4lPsGg/rs:fit:1200/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA3X05lYnVsYV9HcmVlbl9MZWZ0X0RhcmtfTWlycm9yX25ld18xMjgweDYwMF83YjUxYzhmZTQ2LnBuZw.webp",
    "https://www.changan.co.th/cache/images/uJQ0uqj8LJ3BHnczzZ50rdc0HlonYMfHP_qbsfzbHrY/rs:fit:1200/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA3X1N1bnNldF9PcmFuZ2VfRGFya19NaXJyb3JfbmV3XzEyODB4NjAwXzZhYTJkMmVmOGUucG5n.webp",
    "https://www.changan.co.th/cache/images/jVbefvwv9rzLZUZ-TMpJn_nfrPJ4b45Gse4LgtVIT3o/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vV2ViX1MwN18xNng5X25ld19hODBmMTZjODNkLmpwZw.webp",
  ],
  "deepal-s07-l-bev-2026": [
    "https://api.www.changan.co.th/uploads/AW_After_MTX_16_9_S07_L_de875b1386.jpg",
    "https://www.changan.co.th/cache/images/SAFfL7Q7PIymkbR-5KjpEvZ2iimXwqPMiUvmPJ5b3wc/rs:fit:1200/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA3X0x1bmFyX0dyZXlfRGFya19NaXJyb3JfbmV3XzEyODB4NjAwX2U1NjBlZTBlNjUucG5n.webp",
    "https://api.www.changan.co.th/uploads/AW_Feb_Sale_Promotion_16x9_L07_and_S07_c4723d3363.jpg",
  ],
  "deepal-s05-bev-2026": [
    "https://www.changan.co.th/cache/images/0-ksH_Dj6eNsIRfJIhCQ-0-hX3wUJZv50Ed614YsM6k/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA1X3dlYl8xOTIweDEwODBfMV9kNGQxOGJkZDZiLmpwZw.webp",
    "https://www.changan.co.th/cache/images/VSxT1iFyWkXq61OwBMY5V00c4TRXe5aEnz3X2dSyb7Q/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vU2lkZV9EZWVwYWxfQWRqdXN0X0JsYWNrXzRjZTc0YTg5NWUucG5n.webp",
    "https://www.changan.co.th/cache/images/G7lzzRvFAIbK7KIa9-EtbYm8OxM5WuFwoTLTQ6ycef0/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vU2lkZV9EZWVwYWxfQWRqdXN0X0dyYXlfZDdmZjY1NjhiNi5wbmc.webp",
    "https://www.changan.co.th/cache/images/VP2_nktEZGy8qx0viieR8PNK25clhlh4kaj49OL7ir4/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vU2lkZV9EZWVwYWxfQWRqdXN0X1NpbHZlcl9iYmU1YmNmM2VhLnBuZw.webp",
    "https://www.changan.co.th/cache/images/48A7QFp6kIUtXTVbqp-oDYypVMzCV1VCmwxHWJ4vpqA/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vTW9kZWxfY2FyX1MwNV9lMDYzYjgzZDQ4LmpwZw.webp",
  ],
  "deepal-l07-bev-2026": [
    "https://api.www.changan.co.th/uploads/AW_After_MTX_16_9_L07_f127631fc6.jpg",
    "https://api.www.changan.co.th/uploads/AW_Feb_Sale_Promotion_16x9_L07_and_S07_c4723d3363.jpg",
    "https://www.changan.co.th/cache/images/rcj3gytBBSAipEr2Kb9KXhxa1nvtY_EEbVn6jROFTnc/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vZGVlcGFsX0wwN190ZWNoNV9hMDQ5ODFlYTdkLmpwZw.webp",
  ],
  "deepal-e07-bev-2026": [
    "https://www.changan.co.th/cache/images/2STT2NoaOIICKLoeMSHx9en3nkO--pXDpM-FKOqiLaA/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVdfV2ViX0JOXzE5MjB4MTA4MF8zMV84NDhiZGVjMDA3LmpwZw.webp",
    "https://www.changan.co.th/cache/images/V-XLkyMyV1Be8TKbR_M20iMuK2sgTZZWWDbxepxO8Ew/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVVUT19QQVJLSU5HX0FTU0lTVF9BUEFfNmM5MWUyYjI2YS5qcGc.webp",
    "https://www.changan.co.th/cache/images/FsrziNTX6uAVd9J5f62LMsWX5267LfXsdHw02xfLtrU/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVdfV2ViX0JOXzE5MjB4MTA4MF8wMV9FMDdfMWI2MmI1NmY5Yi5qcGc.webp",
    "https://www.changan.co.th/cache/images/832AEAQsAqHprGmNdZhGIFTBQ_3ouuXRfxDwDZLujJI/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVdfV2ViX0JOXzE5MjB4MTA4MF8zNV9mMDQyNWE5MmJkLmpwZw.webp",
  ],
  "deepal-hunter-k50-reev-2026": [
    "https://www.changan.co.th/cache/images/XdnU-BiMy3195cv3aAMysjzneKOlhhKbjaGmeHBeCys/rs:fit:2048/q:75/max_bytes:120000/bG9jYWw6Ly8vazUwX2JsYWNrX3NpZGVfMGNmYzZjMWZiMS5wbmc.webp",
    "https://www.changan.co.th/cache/images/Qka_ZZ6OaHzRj6c9KgPlcv0v2BuRQJ44dMe36eAzb_s/rs:fit:2048/q:75/max_bytes:120000/bG9jYWw6Ly8vSzUwX2dyZXlfc2lkZV8wZDU0MTkxNGQxLnBuZw.webp",
    "https://www.changan.co.th/cache/images/OqR5vJgdiSwdIwVaXcG75o0FOJgjb0CogP_tgRnwgKc/rs:fit:2048/q:75/max_bytes:120000/bG9jYWw6Ly8vSzUwX3doaXRlX3NpZGVfNTZmYzQ5NzRmZC5wbmc.webp",
    "https://www.changan.co.th/cache/images/-oLnGsUryoaUPyYEkVk6PzW9dvpyzkSq2OYVEcSrd7g/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vSFVOVEVSX0s1MF9SRUVWX01BWF9BV0RfSW50ZXJpb3JfZjYyNmRmZWJmYV9iOTc1ZGZiZTdmLmpwZw.webp",
  ],
  "kia-ev5-air-2025": [
    "https://www.kia.com/content/dam/kwcms/gt/en/images/showroom/EV5-ovc-25my/Gallery/ext/ev5-25my-wide-exterior-01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b5/2024_Kia_EV5_Earth_Exclusive_AWD.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/7d/2024_Kia_EV5_Earth_Exclusive_AWD_%28Thailand%29_rear_view.png",
  ],
  "kia-carnival-hev-2025": [
    "https://www.kia.com/content/dam/kwcms/th/th/images/showroom/carnival-pe/0-Banner/Rev.2_The-new-Kia-Carnival32_1920x1080.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/df/2024_Kia_Carnival_SXL_Luxury.jpg",
  ],
  "kia-ev9-gt-line-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/b/b7/2024_Kia_EV9_1.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/99/2024_Kia_EV9_Earth_Long_Range.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b0/Kia_EV9_GT-Line_MV1_Panthera_Metal_%281%29.jpg",
  ],
  "kia-sorento-phev-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/5/58/2025_Kia_Sorento_PHEV_SX_in_Mineral_Blue%2C_front_right%2C_2024-09-29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Kia_Sorento_%28MQ%29_PHEV_IMG_3983.jpg",
  ],
};

function cloudinaryReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function imageFetchHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "ch-erawan/1.0 (dealer site image sync)",
  };
  if (url.includes("changan.co.th")) {
    headers.Referer = "https://www.changan.co.th/";
  }
  return headers;
}

async function uploadImage(url: string, publicId: string): Promise<string | null> {
  if (!cloudinaryReady()) {
    console.warn("  ⚠ Cloudinary not configured — using source URL");
    return url;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: imageFetchHeaders(url),
      });
      if (res.status === 429 && attempt < 3) {
        console.warn(`  ⚠ Rate limited ${publicId}, retry in 5s (${attempt}/3)`);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      if (!res.ok) {
        console.warn(`  ⚠ Fetch failed ${publicId}: HTTP ${res.status}`);
        return url;
      }
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const buf = Buffer.from(await res.arrayBuffer());
      const dataUri = `data:${contentType};base64,${buf.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "ch-erawan/cars",
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });
      return result.secure_url;
    } catch (err) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.warn(`  ⚠ Upload failed ${publicId}: ${msg.slice(0, 120)}`);
      return url;
    }
  }
  return url;
}

async function syncGallery(slug: string, sources: string[]): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < sources.length; i++) {
    const id = `${slug.replace(/[^a-z0-9-]/gi, "-")}-${i + 1}`;
    const url = await uploadImage(sources[i]!, id);
    if (url) urls.push(url);
    if (i < sources.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return urls;
}

async function main() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_CARS_DB_ID) {
    console.error("Missing NOTION_* in .env.local");
    process.exit(1);
  }

  const cars = await getAllCarsAdmin();

  if (deepalOnly && !auditOnly) {
    for (const slug of DEEPAL_ARCHIVE_SLUGS) {
      const stale = cars.find((c) => c.slug === slug && c.isActive);
      if (!stale) continue;
      console.log(`\n→ Archiving duplicate ${slug}...`);
      await archiveCar(stale.id);
      console.log(`  ✓ archived ${slug}`);
    }
  }

  const active = cars.filter((c) => {
    if (!c.isActive) return false;
    if (deepalOnly && DEEPAL_ARCHIVE_SLUGS.includes(c.slug)) return false;
    if (deepalOnly) return c.brand === "Deepal" && c.slug.endsWith("-2026");
    return true;
  });

  console.log(`\n=== Car gallery audit (${active.length} active) ===\n`);
  console.log("| Slug | Brand | Images | Cloudinary | Status |");
  console.log("|------|-------|--------|------------|--------|");

  let needsSync = 0;

  for (const car of active) {
    const count = car.imageUrls.filter(Boolean).length;
    const onCloudinary = car.imageUrls.some((u) => u.includes("cloudinary.com"));
    const sources = GALLERY_SOURCES[car.slug];
    const missing = count === 0;
    const status = missing ? "❌ no images" : count === 1 ? "⚠ single" : "✓ gallery";

    if (missing || (sources && count < sources.length)) needsSync++;

    console.log(
      `| ${car.slug} | ${car.brand} | ${count} | ${onCloudinary ? "yes" : "no"} | ${status} |`
    );

    if (auditOnly || !sources) continue;

    const onCloudinaryAll =
      cloudinaryReady() &&
      car.imageUrls.length > 0 &&
      car.imageUrls.every((u) => u.includes("cloudinary.com"));
    if (!deepalOnly && !missing && count >= sources.length && onCloudinaryAll) continue;

    console.log(`\n→ Syncing ${car.slug} (${sources.length} source images)...`);
    const urls = await syncGallery(car.slug, sources);
    if (urls.length === 0) {
      console.warn(`  ⚠ No URLs uploaded for ${car.slug}`);
      continue;
    }
    await updateCar(car.id, { imageUrls: urls });
    console.log(`  ✓ Updated Notion with ${urls.length} image(s)`);
  }

  console.log(`\n--- ${needsSync} car(s) need gallery attention ---`);
  if (auditOnly) console.log("Run without --audit to upload missing galleries.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
