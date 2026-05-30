import { canonicalUrl } from "@/lib/site";

export interface ItemListEntry {
  name: string;
  path: string;
  position?: number;
}

/** ItemList schema for listing pages (cars, blog, homepage featured) */
export function itemListJsonLd(
  name: string,
  items: ItemListEntry[],
  listPath?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    ...(listPath ? { url: canonicalUrl(listPath) } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      url: canonicalUrl(item.path),
    })),
  };
}
