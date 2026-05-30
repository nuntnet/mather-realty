import type { Metadata } from "next";
import { getFeaturedCars, getPublishedBlogPosts, getPublicStories } from "@/lib/notion";
import { pageMetadata } from "@/lib/site";
import { JsonLd, itemListJsonLd } from "@/lib/seo";
import HomeClient from "./HomeClient";

export const revalidate = 3600;

const HOME_DESCRIPTION =
  "ช.เอราวัณ ออโต้ กรุ๊ป — ตัวแทนจำหน่าย Mazda, Ford, Mitsubishi, GWM, Deepal, Kia ในนครปฐม 7 สาขา ทดลองขับ นัดบริการ ประกันภัย และรถมือสอง";

export const metadata: Metadata = pageMetadata({
  title: "ตัวแทนจำหน่ายรถยนต์ นครปฐม",
  description: HOME_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const results = await Promise.allSettled([
    getFeaturedCars(),
    getPublishedBlogPosts(3),
    getPublicStories(3),
  ]);

  const labels = ["getFeaturedCars", "getPublishedBlogPosts", "getPublicStories"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[HomePage] ${labels[i]} failed:`, result.reason);
    }
  });

  const featuredCars = results[0].status === "fulfilled" ? results[0].value : [];
  const recentPosts = results[1].status === "fulfilled" ? results[1].value : [];
  const publicStories = results[2].status === "fulfilled" ? results[2].value : [];

  const featuredList =
    featuredCars.length > 0
      ? itemListJsonLd(
          "รถยนต์แนะนำ",
          featuredCars.slice(0, 8).map((car) => ({
            name: `${car.brand} ${car.model} ${car.year}`,
            path: `/cars/${car.slug}`,
          })),
          "/",
        )
      : null;

  return (
    <>
      {featuredList && <JsonLd data={featuredList} />}
      <HomeClient
        featuredCars={featuredCars}
        recentPosts={recentPosts}
        publicStories={publicStories}
      />
    </>
  );
}
