import { notFound } from "next/navigation";
import { getCarBySlug, getCarSlugsForPrerender } from "@/lib/notion";
import CarDetailClient from "./CarDetailClient";
import type { Metadata } from "next";
import { breadcrumbJsonLd, canonicalUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getCarSlugsForPrerender(40);
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "ไม่พบรถ" };
  const title = `${car.brand} ${car.model} ${car.year}`;
  const description =
    car.description || `${car.brand} ${car.model} ราคาเริ่มต้น ฿${car.priceMin.toLocaleString()}`;
  const path = `/cars/${car.slug || slug}`;
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(path) },
    openGraph: {
      title,
      description,
      url: canonicalUrl(path),
      images: car.imageUrls[0] ? [car.imageUrls[0]] : [],
    },
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const carPath = `/cars/${car.slug || slug}`;
  const carJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${car.brand} ${car.model} ${car.year}`,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    category: "Automotive",
    ...(car.description && { description: car.description }),
    ...(car.imageUrls.length > 0 ? { image: car.imageUrls } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "THB",
      price: car.priceMin,
      ...(car.priceMax > car.priceMin && { highPrice: car.priceMax }),
      availability: "https://schema.org/InStock",
      itemCondition:
        car.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      seller: {
        "@type": "AutoDealer",
        name: SITE_NAME,
      },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "year", value: String(car.year) },
      { "@type": "PropertyValue", name: "bodyType", value: car.type },
      { "@type": "PropertyValue", name: "fuelType", value: car.fuelType },
      {
        "@type": "PropertyValue",
        name: "transmission",
        value: car.transmission === "auto" ? "Automatic" : "Manual",
      },
    ],
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "ค้นหารถยนต์", path: "/cars" },
    { name: `${car.brand} ${car.model}`, path: carPath },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <CarDetailClient car={car} />
    </>
  );
}
