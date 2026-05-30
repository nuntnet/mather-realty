import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
