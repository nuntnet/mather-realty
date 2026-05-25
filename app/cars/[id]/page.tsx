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

  return <CarDetailClient car={car} />;
}
