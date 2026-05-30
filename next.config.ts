import type { NextConfig } from "next";
import { BRANDS, GWM_SUB_LINES } from "./lib/brandConfig";

const brandRedirects = BRANDS.flatMap((brand) => [
  {
    source: "/cars",
    has: [{ type: "query" as const, key: "brand", value: brand.notionBrand }],
    destination: brand.hubPath,
    permanent: true,
  },
  {
    source: "/cars",
    has: [{ type: "query" as const, key: "brand", value: brand.slug }],
    destination: brand.hubPath,
    permanent: true,
  },
]);

const gwmLineRedirects = GWM_SUB_LINES.flatMap((line) => [
  {
    source: "/cars",
    has: [{ type: "query" as const, key: "brand", value: line.displayName }],
    destination: `/gwm/${line.slug}`,
    permanent: true,
  },
  {
    source: "/cars",
    has: [{ type: "query" as const, key: "brand", value: line.slug }],
    destination: `/gwm/${line.slug}`,
    permanent: true,
  },
]);

const nextConfig: NextConfig = {
  async redirects() {
    return [...brandRedirects, ...gwmLineRedirects];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.notion.so",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "mazda-media-s3.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.gwm.co.th",
      },
      {
        protocol: "https",
        hostname: "www.mitsubishi-motors.co.th",
      },
      {
        protocol: "https",
        hostname: "www.kia.com",
      },
      {
        protocol: "https",
        hostname: "www.changan.co.th",
      },
      {
        protocol: "https",
        hostname: "api.www.changan.co.th",
      },
    ],
  },
};

export default nextConfig;
