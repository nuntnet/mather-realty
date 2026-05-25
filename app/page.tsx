import { getFeaturedCars, getPublishedBlogPosts, getPublicStories } from "@/lib/notion";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Parallel fetch — all 3 run at the same time
  const [featuredCars, recentPosts, publicStories] = await Promise.all([
    getFeaturedCars(),
    getPublishedBlogPosts(3),
    getPublicStories(3),
  ]);

  return (
    <HomeClient
      featuredCars={featuredCars}
      recentPosts={recentPosts}
      publicStories={publicStories}
    />
  );
}
