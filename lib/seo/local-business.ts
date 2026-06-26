import { canonicalUrl, SITE_URL, SITE_NAME } from "@/lib/site";

/** RealEstateAgent / LocalBusiness node for Mather */
export function localBusinessGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["RealEstateAgent", "LocalBusiness"],
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        description:
          "Premium rental properties in Thailand for expats and foreigners.",
        address: {
          "@type": "PostalAddress",
          addressCountry: "TH",
        },
        email: "hello@mather.to",
        url: canonicalUrl("/"),
      },
    ],
  };
}
