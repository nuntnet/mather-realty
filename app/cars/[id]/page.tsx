import { notFound } from "next/navigation";
import Link from "next/link";
import { getCarById, getAllCarIds } from "@/lib/notion";
import CarDetailClient from "./CarDetailClient";
import type { Metadata } from "next";

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const ids = await getAllCarIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) return { title: "ไม่พบรถ" };
  return {
    title: `${car.brand} ${car.model} ${car.year}`,
    description: car.description || `${car.brand} ${car.model} ราคาเริ่มต้น ฿${car.priceMin.toLocaleString()}`,
    openGraph: {
      images: car.imageUrls[0] ? [car.imageUrls[0]] : [],
    },
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) notFound();

  const carJsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${car.brand} ${car.model} ${car.year}`,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    bodyType: car.type,
    fuelType: car.fuelType,
    vehicleTransmission: car.transmission === "auto" ? "AutomaticTransmission" : "ManualTransmission",
    ...(car.engineSize && { engineDisplacement: { "@type": "QuantitativeValue", value: car.engineSize } }),
    ...(car.description && { description: car.description }),
    ...(car.imageUrls[0] && { image: car.imageUrls[0] }),
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      price: car.priceMin,
      ...(car.priceMax > car.priceMin && { highPrice: car.priceMax }),
      availability: "https://schema.org/InStock",
      itemCondition: car.condition === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
      seller: {
        "@type": "AutoDealer",
        name: "ช.เอราวัณ ออโต้ กรุ๊ป",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carJsonLd) }}
      />
      <CarDetailClient car={car} />
    </>
  );
}
