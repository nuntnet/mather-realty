import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import BrandCarGrid from "@/components/BrandCarGrid";
import BrandHero from "@/components/BrandHero";
import {
  BRAND_BY_SLUG,
  GWM_LINE_BY_SLUG,
  GWM_LINE_SLUGS,
  isGwmLineSlug,
  type GwmLineSlug,
} from "@/lib/brandConfig";
import { getCarsByBrandLine } from "@/lib/notion";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ line: string }>;
}

export async function generateStaticParams() {
  return GWM_LINE_SLUGS.map((line) => ({ line }));
}

export async function generateMetadata({ params }: PageProps) {
  const { line: slug } = await params;
  if (!isGwmLineSlug(slug)) return {};
  const line = GWM_LINE_BY_SLUG[slug];
  const gwm = BRAND_BY_SLUG.gwm;
  return pageMetadata({
    title: `${line.displayName} — GWM รถยนต์`,
    description: `รุ่นรถ ${line.displayName} จาก GWM ที่ ช.เอราวัณ ออโต้ กรุป — ${gwm.descriptionTh}`,
    path: `/gwm/${slug}`,
    openGraphImage: line.logoPath,
  });
}

export default async function GwmLinePage({ params }: PageProps) {
  const { line: slug } = await params;
  if (!isGwmLineSlug(slug)) notFound();

  const line = GWM_LINE_BY_SLUG[slug as GwmLineSlug];
  const gwm = BRAND_BY_SLUG.gwm;
  const cars = await getCarsByBrandLine("GWM", slug);

  const breadcrumbs = [
    { name: "หน้าแรก", path: "/" },
    { name: "GWM", path: "/gwm" },
    { name: line.displayName, path: `/gwm/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />
      <div className="min-h-screen bg-[#F8FAFC] pt-[68px]">
        <BrandHero
          brand={{
            ...gwm,
            displayName: line.displayName,
            displayNameTh: line.displayNameTh,
            tagline: line.displayName,
            descriptionTh: `รุ่นรถ ${line.displayName} จาก GWM ที่ ช.เอราวัณ ออโต้ กรุป พร้อมทดลองขับและบริการหลังการขายครบวงจร`,
            logoPath: line.logoPath,
          }}
          breadcrumbs={breadcrumbs}
          bgImage={gwm.navBgImage}
          primaryCta={{ label: "นัดทดลองขับ", href: "/booking?type=test_drive&brand=GWM" }}
          secondaryCta={{ label: "ดู GWM ทั้งหมด", href: "/gwm" }}
          secondaryLogo={{ src: gwm.logoPath, alt: "GWM", label: "by" }}
          footer={
            <div className="flex flex-wrap gap-2">
              {gwm.subLines?.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/gwm/${sub.slug}`}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 min-h-[44px] text-sm font-medium transition-colors backdrop-blur-sm ${
                    sub.slug === slug
                      ? "bg-white text-[#0F172A]"
                      : "bg-white/10 text-white/75 hover:bg-white/20 border border-white/15"
                  }`}
                >
                  <BrandLogo
                    src={sub.logoPath}
                    alt={sub.displayName}
                    size="xs"
                    bare
                    white={sub.slug !== slug}
                    width={56}
                    height={20}
                    className={sub.slug === slug ? "brightness-0" : "opacity-90"}
                  />
                  {sub.displayName}
                </Link>
              ))}
            </div>
          }
        />

        <div className="container py-10 lg:py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#0F172A]">
                รุ่นรถ {line.displayName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">พบ {cars.length} รุ่น</p>
            </div>
            <Link
              href="/gwm"
              className="hidden sm:inline-flex items-center text-sm font-medium text-[#0F172A] hover:text-[#DD5259] transition-colors"
            >
              กลับหน้า GWM
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <BrandCarGrid
            cars={cars}
            emptyMessage={`ยังไม่มีรุ่น ${line.displayName} ในระบบ — ติดต่อเราเพื่อสอบถามรุ่นที่พร้อมจำหน่าย`}
          />
        </div>
      </div>
    </>
  );
}
