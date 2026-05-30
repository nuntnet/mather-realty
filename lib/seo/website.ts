import { SITE_URL } from "@/lib/site";
import { ORGANIZATION_NAME } from "./constants";

/** WebSite schema with optional SearchAction */
export function websiteJsonLd(options?: { includeSearchAction?: boolean }) {
  const includeSearch = options?.includeSearchAction !== false;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    inLanguage: "th-TH",
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(includeSearch
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/cars?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
}
