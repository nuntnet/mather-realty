import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import BrandCarGrid from "@/components/BrandCarGrid";
import BrandBreadcrumb from "@/components/BrandBreadcrumb";
import { Button } from "@/components/ui/button";
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
    description: `รุ่นรถ ${line.displayName} จาก GWM ที่ ช.เอราวัณ ออโต้ กรุ๊ป — ${gwm.descriptionTh}`,
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
        <div className="bg-[#0F172A] text-white py-14 lg:py-20">
          <div className="container">
            <BrandBreadcrumb items={breadcrumbs} />
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 min-h-[44px]">
                    <BrandLogo
                      src={line.logoPath}
                      alt={line.displayName}
                      width={120}
                      height={40}
                      className="h-9 md:h-10 w-auto brightness-0 invert"
                    />
                  </div>
                  <span className="text-white/30 text-sm">by</span>
                  <BrandLogo
                    src={gwm.logoPath}
                    alt="GWM"
                    width={80}
                    height={32}
                    className="h-7 w-auto brightness-0 invert opacity-60"
                  />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {line.displayName}
                  <span className="text-white/40 font-normal text-xl md:text-2xl ml-2">
                    {line.displayNameTh}
                  </span>
                </h1>
                <p className="text-white/60 leading-relaxed">
                  รุ่นรถ {line.displayName} จาก GWM ที่ ช.เอราวัณ ออโต้ กรุ๊ป
                  พร้อมทดลองขับและบริการหลังการขายครบวงจร
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/booking?type=test_drive&brand=GWM`}>
                  <Button className="bg-[#DD5259] hover:bg-[#c94850] text-white font-semibold min-h-[44px]">
                    นัดทดลองขับ
                  </Button>
                </Link>
                <Link href="/gwm">
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 min-h-[44px]"
                  >
                    ดู GWM ทั้งหมด
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {gwm.subLines?.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/gwm/${sub.slug}`}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 min-h-[44px] text-sm font-medium transition-colors ${
                    sub.slug === slug
                      ? "bg-white text-[#0F172A]"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  <BrandLogo
                    src={sub.logoPath}
                    alt={sub.displayName}
                    width={56}
                    height={20}
                    className={`h-4 w-auto ${sub.slug === slug ? "" : "brightness-0 invert opacity-80"}`}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

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
