import Link from "next/link";
import Image from "next/image";
import BrandHero from "@/components/BrandHero";
import BrandSubNav from "@/components/brands/BrandSubNav";
import { BRAND_BY_SLUG } from "@/lib/brandConfig";
import { getBlogPostsByBrand } from "@/lib/notion";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/site";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "รีวิว GWM — ช.เอราวัณ ออโต้ กรุ๊ป",
  description: "รีวิวและบทความรถ GWM ทุกรุ่น HAVAL, ORA, TANK จาก ช.เอราวัณ ออโต้ กรุ๊ป",
  path: "/gwm/reviews",
});

export default async function GwmReviewsPage() {
  const brand = BRAND_BY_SLUG.gwm;
  const reviews = await getBlogPostsByBrand("GWM", "review", 12);
  const allGwmPosts = await getBlogPostsByBrand("GWM", undefined, 6);

  const breadcrumbs = [
    { name: "หน้าแรก", path: "/" },
    { name: "GWM", path: "/gwm" },
    { name: "รีวิว", path: "/gwm/reviews" },
  ];

  const displayPosts = reviews.length > 0 ? reviews : allGwmPosts;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <div className="min-h-screen bg-[#F8FAFC] pt-[64px]">
        <BrandHero
          brand={brand}
          breadcrumbs={breadcrumbs}
          primaryCta={{ label: "นัดทดลองขับ", href: "/booking?type=test_drive&brand=GWM" }}
          secondaryCta={{ label: "ดูรถ GWM", href: "/gwm" }}
          footer={
            <p className="text-white/75 text-sm">รีวิว บทความ และข่าวสาร GWM ทุกรุ่น</p>
          }
        />

        <BrandSubNav brand={brand} currentSection="reviews" scrollPastHero />

        <section className="container py-12 lg:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-[#C8102E] uppercase tracking-wider mb-1">
                {reviews.length > 0 ? "รีวิวจากทีมงาน" : "บทความและข่าวสาร"}
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A]">
                {reviews.length > 0 ? "รีวิว GWM" : "GWM บทความ"}
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0F172A] transition-colors"
            >
              บทความทั้งหมด
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {displayPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">กำลังเตรียมรีวิว</h3>
              <p className="text-gray-500 mb-6">ติดตามรีวิวรถ GWM ได้เร็วๆ นี้</p>
              <Link href="/blog">
                <Button variant="outline">ดูบทความทั้งหมด</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {post.coverImageUrl ? (
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-[#0C1C3E] to-[#1a3a6b]" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium bg-[#0C1C3E]/10 text-[#0C1C3E] px-2 py-0.5 rounded-full capitalize">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#C8102E] transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                    )}
                    {post.publishedAt && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.publishedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/blog">
              <Button variant="outline">
                ดูบทความทั้งหมด
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
