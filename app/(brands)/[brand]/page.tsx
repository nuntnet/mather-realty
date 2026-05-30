import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import BrandCarGrid from "@/components/BrandCarGrid";
import BrandBreadcrumb from "@/components/BrandBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  BRANDS,
  BRAND_BY_SLUG,
  BRAND_SLUGS,
  isBrandSlug,
  type BrandSlug,
} from "@/lib/brandConfig";
import { getCarsByBrandLine } from "@/lib/notion";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams() {
  return BRAND_SLUGS.map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: PageProps) {
  const { brand: slug } = await params;
  if (!isBrandSlug(slug)) return {};
  const brand = BRAND_BY_SLUG[slug];
  return pageMetadata({
    title: `${brand.displayNameTh} (${brand.displayName}) — รถยนต์`,
    description: brand.descriptionTh,
    path: brand.hubPath,
    openGraphImage: brand.logoPath,
  });
}

export default async function BrandHubPage({ params }: PageProps) {
  const { brand: slug } = await params;
  if (!isBrandSlug(slug)) notFound();

  const brand = BRAND_BY_SLUG[slug as BrandSlug];
  const cars = await getCarsByBrandLine(brand.notionBrand);

  const breadcrumbs = [
    { name: "หน้าแรก", path: "/" },
    { name: brand.displayNameTh, path: brand.hubPath },
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
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 min-h-[44px]">
                  <BrandLogo
                    src={brand.logoPath}
                    alt={brand.displayName}
                    width={140}
                    height={48}
                    className="h-10 md:h-12 w-auto brightness-0 invert"
                  />
                </div>
                {brand.tagline && (
                  <p className="text-[#DD5259] text-sm font-semibold tracking-wider uppercase mb-2">
                    {brand.tagline}
                  </p>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {brand.displayNameTh}
                  <span className="text-white/40 font-normal text-2xl md:text-3xl ml-2">
                    {brand.displayName}
                  </span>
                </h1>
                <p className="text-white/60 text-base lg:text-lg leading-relaxed">
                  {brand.descriptionTh}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/booking?type=test_drive&brand=${brand.notionBrand}`}>
                  <Button className="bg-[#DD5259] hover:bg-[#c94850] text-white font-semibold min-h-[44px]">
                    นัดทดลองขับ
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 min-h-[44px]"
                  >
                    สอบถามราคา
                  </Button>
                </Link>
              </div>
            </div>

            {brand.subLines && brand.subLines.length > 0 && (
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-white/40 text-sm mb-4">สายย่อย GWM</p>
                <div className="flex flex-wrap gap-3">
                  {brand.subLines.map((line) => (
                    <Link
                      key={line.slug}
                      href={`/gwm/${line.slug}`}
                      className="inline-flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 min-h-[44px] transition-colors"
                    >
                      <BrandLogo
                        src={line.logoPath}
                        alt={line.displayName}
                        width={80}
                        height={28}
                        className="h-6 w-auto brightness-0 invert"
                      />
                      <span className="text-sm text-white/70">{line.displayNameTh}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container py-10 lg:py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#0F172A]">
                รุ่นรถ {brand.displayNameTh}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                พบ {cars.length} รุ่น
              </p>
            </div>
            <Link
              href="/cars"
              className="hidden sm:inline-flex items-center text-sm font-medium text-[#0F172A] hover:text-[#DD5259] transition-colors"
            >
              ดูรถทั้งหมด
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <BrandCarGrid cars={cars} />

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <p className="w-full text-center text-sm text-gray-400 mb-2">
              แบรนด์อื่นๆ
            </p>
            {BRANDS.filter((b) => b.slug !== brand.slug).map((other) => (
              <Link
                key={other.slug}
                href={other.hubPath}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 min-w-[44px] min-h-[44px] hover:border-[#DD5259]/30 hover:shadow-md transition-all"
              >
                <BrandLogo
                  src={other.logoPath}
                  alt={other.displayName}
                  width={72}
                  height={28}
                  className="h-7 w-auto opacity-70 hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
