import type { Car } from "@/lib/notion-types";
import { breadcrumbJsonLd, canonicalUrl, type BreadcrumbItem } from "@/lib/site";
import { ORGANIZATION_NAME } from "./constants";

export interface ProductVehicleJsonLdOptions {
  car: Car;
  slug: string;
}

/** Product + Car schema for vehicle detail pages */
export function productVehicleJsonLd({ car, slug }: ProductVehicleJsonLdOptions) {
  const path = `/cars/${car.slug || slug}`;
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "Car"],
    name: `${car.brand} ${car.model} ${car.year}`,
    url: canonicalUrl(path),
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
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
        name: ORGANIZATION_NAME,
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
}

/** BreadcrumbList for car detail */
export function carBreadcrumbJsonLd(car: Car, slug: string) {
  const carPath = `/cars/${car.slug || slug}`;
  const items: BreadcrumbItem[] = [
    { name: "หน้าแรก", path: "/" },
    { name: "ค้นหารถยนต์", path: "/cars" },
    { name: `${car.brand} ${car.model}`, path: carPath },
  ];
  return breadcrumbJsonLd(items);
}
