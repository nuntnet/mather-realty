import { getFeaturedCars, getPublishedBlogPosts, getPublicStories } from "@/lib/notion";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Parallel fetch with error handling to identify which call fails
  const results = await Promise.allSettled([
    getFeaturedCars(),
    getPublishedBlogPosts(3),
    getPublicStories(3),
  ]);

  // Log errors for debugging
  const labels = ["getFeaturedCars", "getPublishedBlogPosts", "getPublicStories"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[HomePage] ${labels[i]} failed:`, result.reason);
    }
  });

  // Extract values, using empty arrays for failed calls
  const featuredCars = results[0].status === "fulfilled" ? results[0].value : [];
  const recentPosts = results[1].status === "fulfilled" ? results[1].value : [];
  const publicStories = results[2].status === "fulfilled" ? results[2].value : [];

  return (
    <HomeClient
      featuredCars={featuredCars}
      recentPosts={recentPosts}
      publicStories={publicStories}
    />
  );
}
