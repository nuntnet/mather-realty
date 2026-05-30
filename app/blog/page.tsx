import { getPublishedBlogPosts } from "@/lib/notion";
import BlogList from "./BlogList";
import { pageMetadata } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "บทความและข่าวสาร",
  description: "ความรู้ด้านยานยนต์ เคล็ดลับการดูแลรถ และข่าวสารล่าสุดจาก ช.เอราวัณ",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[68px]">
      {/* Header */}
      <div className="bg-[#0F172A] text-white py-16 lg:py-20">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-white/40 text-sm font-medium tracking-wider uppercase mb-3">Blog & News</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">บทความและข่าวสาร</h1>
            <p className="text-white/50 text-base lg:text-lg">
              ความรู้ด้านยานยนต์ เคล็ดลับการดูแลรถ และข่าวสารล่าสุดจาก ช.เอราวัณ
            </p>
          </div>
        </div>
      </div>

      <BlogList posts={posts} />
    </div>
  );
}
