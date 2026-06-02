import type { Property, BlogPost } from "@/lib/notion-types";
import { SITE_URL, SITE_NAME, canonicalUrl, type BreadcrumbItem } from "@/lib/site";

// ---------------------------------------------------------------------------
// Accommodation JSON-LD
// ---------------------------------------------------------------------------

export function generatePropertyJsonLd(
  property: Property,
  locale: string,
  url: string,
) {
  const title = property.title[locale] ?? property.title["en"] ?? "";
  const description =
    property.description[locale] ?? property.description["en"] ?? "";
  const amenities = property.amenities ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: title,
    description,
    url,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.district,
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.lat,
      longitude: property.lng,
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.sizeSqm,
      unitCode: "MTK",
    },
    petsAllowed: amenities.includes("PetFriendly"),
    ...(property.coverImage ? { image: property.coverImage } : {}),
    ...(property.gallery?.length
      ? {
          photo: property.gallery.map((src) => ({
            "@type": "ImageObject",
            url: src,
          })),
        }
      : {}),
    amenityFeature: amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    offers: {
      "@type": "Offer",
      price: property.priceTHB,
      priceCurrency: "THB",
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      ...(property.availableFrom
        ? { availabilityStarts: property.availableFrom }
        : {}),
    },
    ...(property.hasVirtualTour && property.virtualTourUrl
      ? {
          virtualTourUrl: property.virtualTourUrl,
          amenityFeature: [
            ...amenities.map((a) => ({
              "@type": "LocationFeatureSpecification",
              name: a,
              value: true,
            })),
            {
              "@type": "LocationFeatureSpecification",
              name: "Virtual Tour",
              value: true,
            },
          ],
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList JSON-LD
// ---------------------------------------------------------------------------

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// WebSite JSON-LD
// ---------------------------------------------------------------------------

export function generateWebsiteJsonLd(options?: {
  includeSearchAction?: boolean;
}) {
  const includeSearch = options?.includeSearchAction !== false;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["en", "th", "zh-CN", "zh-TW", "ja", "ko", "ru", "de", "fr", "es", "it", "nl", "sv", "ar", "hi"],
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(includeSearch
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/en/properties?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
}
