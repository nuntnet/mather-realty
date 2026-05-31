"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BranchesMap from "@/components/BranchesMap";
import BrandLogo from "@/components/BrandLogo";
import BrandHallCard from "@/components/BrandHallCard";
import { BRAND_IMAGES } from "@/lib/brandImages";
import { BRANDS } from "@/lib/brandConfig";
import {
  ArrowRight, Phone, MapPin, Calendar, Star,
  Shield, Wrench, Award,
} from "lucide-react";
import type { Car, BlogPost, CustomerStory } from "@/lib/notion-types";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const heroSlides = [
  {
    bg: "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-5_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    brand: "Mazda", tagline: "FEEL ALIVE",
    thaiTitle: "ขับเคลื่อนด้วยแรงบันดาลใจ",
    desc: "Mazda CX-5 SUV สมรรถนะสมดุล ดีไซน์ Kodo เอกลักษณ์เฉพาะตัว พร้อม i-Activsense ช่วยเหลือผู้ขับขี่",
  },
  {
    bg: "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/haval-h6-hev/h6-kv-pc-1-2.jpg",
    brand: "GWM", tagline: "HAVAL H6 HEV",
    thaiTitle: "SUV ไฮบริดยอดนิยม",
    desc: "GWM HAVAL H6 HEV ประหยัดน้ำมัน ออพชั่นครบ ราคาเริ่มต้น 969,000 บาท จาก gwm.co.th",
  },
  {
    bg: "https://www.kia.com/content/dam/kwcms/gt/en/images/showroom/EV5-ovc-25my/Gallery/ext/ev5-25my-wide-exterior-01.jpg",
    brand: "Kia", tagline: "INSPIRATION DRIVEN",
    thaiTitle: "SUV ไฟฟ้าแห่งอนาคต",
    desc: "Kia EV5 ดีไซน์ Opposites United ห้องโดยสารกว้าง ราคาเริ่มต้น 1,399,000 บาท",
  },
];

const brandTabs = ["ทั้งหมด", ...BRANDS.map((b) => b.notionBrand)];

interface Props {
  featuredCars: Car[];
  recentPosts: BlogPost[];
  publicStories: CustomerStory[];
}

export default function HomeClient({ featuredCars, recentPosts, publicStories }: Props) {
  const [activeBrandTab, setActiveBrandTab] = useState("ทั้งหมด");
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeroSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredCars = useMemo(() => {
    if (activeBrandTab === "ทั้งหมด") return featuredCars.slice(0, 6);
    return featuredCars.filter((c) => c.brand === activeBrandTab).slice(0, 6);
  }, [featuredCars, activeBrandTab]);

  return (
    <div className="min-h-screen pt-[68px]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-black" style={{ height: "calc(100vh - 68px)" }}>
        {heroSlides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroSlide ? "opacity-100" : "opacity-0"}`}>
            <Image
              src={slide.bg}
              alt={slide.brand}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />
        <div className="absolute bottom-16 left-0 right-0 z-20">
          <div className="container">
            <div className="max-w-2xl">
              <h1 className="font-black italic uppercase text-white leading-none mb-2" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.01em" }}>
                {heroSlides[heroSlide].tagline}
              </h1>
              <p className="text-white/80 text-sm lg:text-base font-medium mb-1">{heroSlides[heroSlide].thaiTitle}</p>
              <p className="text-white/50 text-xs lg:text-sm leading-relaxed max-w-lg">{heroSlides[heroSlide].desc}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === heroSlide ? "w-8 h-2 bg-[#DD5259]" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </section>

      {/* BRAND LOGOS BAR */}
      <section className="bg-white border-b border-gray-100">
        <div className="container py-6">
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={brand.hubPath}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl transition-all duration-300 group hover:shadow-md hover:bg-white hover:scale-110"
              >
                <BrandLogo
                  src={brand.logoPath}
                  alt={brand.displayName}
                  brandSlug={brand.slug}
                  size="md"
                  width={88}
                  height={32}
                  className="transition-all duration-300"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND HALL */}
      <section className="relative py-16 lg:py-28 bg-[#0B1220] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(221,82,89,0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(19,31,60,0.5) 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="container relative z-10">
          <div className="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
            <p className="text-[#DD5259] text-xs font-bold uppercase tracking-[0.25em] mb-4">
              Brand Hall
            </p>
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              โลกแห่งแบรนด์ชั้นนำ
            </h2>
            <p className="text-white/50 text-sm lg:text-base leading-relaxed">
              ตัวแทนจำหน่ายอย่างเป็นทางการ 6 แบรนด์ระดับโลก — สำรวจเอกลักษณ์ ปรัชญา
              และประสบการณ์ของแต่ละแบรนด์
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {BRANDS.map((brand) => (
              <BrandHallCard key={brand.slug} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* CAR SEARCH */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-3">ค้นหารุ่นรถที่ใช่ของคุณ</h2>
            <p className="text-gray-500">เลือกแบรนด์เพื่อดูรุ่นรถที่พร้อมจำหน่าย</p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {brandTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveBrandTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeBrandTab === tab ? "bg-[#0F172A] text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >{tab}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-gray-400">ไม่พบรุ่นรถในหมวดนี้</div>
            ) : filteredCars.map((car) => (
              <div key={car.id} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Whole image area links to car detail */}
                <Link href={`/cars/${car.slug || car.id}`} className="block relative aspect-[16/10] bg-gray-50 overflow-hidden">
                  {car.imageUrls[0] ? (
                    <Image src={car.imageUrls[0]} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <Image src={BRAND_IMAGES[car.brand] ?? BRAND_IMAGES.default} alt={car.brand} fill className="object-cover opacity-80" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  )}
                  {car.isBestSeller && (
                    <Badge className="absolute top-3 left-3 bg-[#0F172A] text-white text-[10px] font-semibold px-2.5 py-1 border-0">แนะนำ</Badge>
                  )}
                </Link>
                <div className="p-5">
                  <p className="text-xs text-gray-400 font-medium tracking-wider uppercase mb-1">{car.brand}</p>
                  <Link href={`/cars/${car.slug || car.id}`}>
                    <h3 className="font-bold text-[#0F172A] text-lg mb-2 hover:text-[#334155] transition-colors">{car.model}</h3>
                  </Link>
                  {car.priceMin > 0 && (
                    <p className="text-lg font-bold text-[#0F172A] mb-4">
                      ฿{car.priceMin.toLocaleString()}
                      <span className="text-xs font-normal text-gray-400 ml-1">เริ่มต้น</span>
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/cars/${car.slug || car.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="text-xs border-gray-200 text-gray-600 hover:border-[#0F172A] w-full">ดูรายละเอียด</Button>
                    </Link>
                    <Link href={`/booking?type=test_drive&car=${car.model}`} className="flex-1">
                      <Button size="sm" className="text-xs bg-[#0F172A] hover:bg-[#1E293B] text-white w-full">ทดลองขับ</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/cars">
              <Button variant="outline" size="lg" className="border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white font-semibold px-10">
                ดูรถยนต์ทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* QUOTE SECTION */}
      <section className="relative py-20 lg:py-28 bg-[#131F3C] overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#DD5259]" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-[#DD5259]" />
                <span className="text-[#DD5259]/80 text-sm font-medium tracking-wider uppercase">ความภาคภูมิใจของเรา</span>
              </div>
              <blockquote className="text-2xl lg:text-3xl font-bold text-white leading-relaxed mb-6">
                "ช.เอราวัณ คือเพื่อนแท้ที่พร้อมดูแลรถคุณ ด้วยมาตรฐานระดับสากล และหัวใจของคนไทย"
              </blockquote>
              <div className="flex flex-wrap gap-6">
                {[["57+", "ปีแห่งประสบการณ์"], ["15+", "โชว์รูมและศูนย์บริการ"], ["6", "แบรนด์ชั้นนำ"]].map(([num, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-bold text-[#DD5259]">{num}</div>
                    <div className="text-xs text-white/40 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: Award, title: "Mitsubishi President Award 2018", desc: "รางวัลดีลเลอร์ยอดเยี่ยมจากมิตซูบิชิ มอเตอร์ส ประเทศไทย" },
                { icon: Star, title: "Mazda Excellence Award 2017-2018", desc: "รางวัลดีลเลอร์ยอดเยี่ยมจากมาสด้า เซลส์ ประเทศไทย" },
                { icon: Shield, title: "Ford President Award", desc: "รางวัลดีลเลอร์ยอดเยี่ยมจากฟอร์ด มอเตอร์ ประเทศไทย" },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className="w-6 h-6 text-[#DD5259]" />
                    <span className="text-white font-semibold text-sm">{item.title}</span>
                  </div>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-3">บริการครบวงจรจาก ช.เอราวัณ</h2>
            <p className="text-gray-500 max-w-lg mx-auto">เราพร้อมดูแลรถของคุณตลอดอายุการใช้งาน</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Calendar, title: "นัดหมายทดลองขับ", desc: "ทดลองขับรถรุ่นที่คุณสนใจ ที่ศูนย์บริการใกล้บ้าน", href: "/booking?type=test_drive", color: "bg-blue-50 text-blue-600" },
              { icon: Wrench, title: "ศูนย์บริการมาตรฐาน", desc: "บริการซ่อมบำรุงตามระยะ ด้วยช่างผู้เชี่ยวชาญ", href: "/booking?type=service", color: "bg-emerald-50 text-emerald-600" },
              { icon: Shield, title: "ประกันภัยรถยนต์", desc: "เปรียบเทียบราคาจากบริษัทประกันชั้นนำ", href: "/booking?type=insurance_quote", color: "bg-amber-50 text-amber-600" },
              { icon: Star, title: "ซ่อมตัวถังและสี", desc: "แจ้งซ่อมออนไลน์ พร้อมส่งเอกสารให้ประกันอนุมัติ", href: "/booking?type=body_paint", color: "bg-rose-50 text-rose-600" },
            ].map((service) => (
              <Link key={service.title} href={service.href}>
                <div className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
                    <service.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{service.desc}</p>
                  <span className="text-xs font-medium text-[#0F172A] group-hover:underline">นัดหมายเลย →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / MAP */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-4">ช.เอราวัณ ออโต้ กรุ๊ป</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                กลุ่มบริษัท ช.เอราวัณ ก่อตั้งขึ้นเมื่อปี พ.ศ. 2510 โดยคุณวิชัย จันทร์วาววาม
                เริ่มต้นจากอู่ซ่อมรถเล็กๆ ในจังหวัดนครปฐม จนเติบโตเป็นกลุ่มธุรกิจยานยนต์ครบวงจร
                ที่มีโชว์รูมและศูนย์บริการมากกว่า 15 แห่ง ครอบคลุม 6 แบรนด์ชั้นนำ
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600">75/2 หมู่ 1 ต.ธรรมศาลา อ.เมือง จ.นครปฐม 73000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href="tel:034305500" className="text-sm text-gray-600 hover:text-[#0F172A] transition-colors">034-305-500</a>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/about">
                  <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold">
                    เกี่ยวกับเรา <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/branches">
                  <Button variant="outline" className="border-gray-200 text-gray-600 hover:border-[#0F172A]">ค้นหาสาขา</Button>
                </Link>
              </div>
            </div>
            {/* Team / Showroom photo grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-2xl overflow-hidden h-52 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80&auto=format&fit=crop"
                  alt="โชว์รูม ช.เอราวัณ"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-36 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80&auto=format&fit=crop"
                  alt="ทีมงาน ช.เอราวัณ"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-36 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop"
                  alt="ศูนย์บริการ ช.เอราวัณ"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER STORIES */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC]">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-2">เสียงจากลูกค้าของเรา</h2>
              <p className="text-gray-500">เรื่องราวความประทับใจจากลูกค้าที่ไว้วางใจ ช.เอราวัณ</p>
            </div>
            <Link href="/stories">
              <Button variant="outline" className="hidden md:flex border-gray-200 text-gray-600 hover:border-[#0F172A]">
                ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicStories.map((story) => (
              <div key={story.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: story.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#DD5259] text-[#DD5259]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">"{story.story}"</p>
                <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#DD5259] to-[#c94850] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{story.customerName[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{story.customerName}</p>
                    {story.carModel && <p className="text-xs text-gray-400 mt-0.5">{story.carModel}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS / BLOG */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-2">ข่าวสารและกิจกรรมล่าสุด</h2>
              <p className="text-gray-500">ติดตามข่าวสาร โปรโมชั่น และกิจกรรมจาก ช.เอราวัณ</p>
            </div>
            <Link href="/blog">
              <Button variant="outline" className="hidden md:flex border-gray-200 text-gray-600 hover:border-[#0F172A]">
                ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                    {post.coverImageUrl ? (
                      <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Calendar className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2 text-[10px] font-medium">{post.category}</Badge>
                    <h3 className="font-semibold text-[#0F172A] mb-2 line-clamp-2">{post.title}</h3>
                    {post.excerpt && <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>}
                    {post.publishedAt && (
                      <p className="text-xs text-gray-400 mt-3">
                        {format(new Date(post.publishedAt), "d MMM yyyy", { locale: th })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRANCHES MAP */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC]">
        <div className="container">
          <BranchesMap />
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 lg:py-20 bg-[#0F172A]">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">ติดต่อเราได้เลย ยินดีให้บริการ</h2>
          <p className="text-white/40 max-w-lg mx-auto mb-8">ให้ทีมผู้เชี่ยวชาญของเราช่วยคุณค้นหารถยนต์ที่ตรงกับความต้องการและงบประมาณของคุณ</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:034305500">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12">
                <Phone className="w-4 h-4 mr-2" /> 034-305-500
              </Button>
            </a>
            <Link href="/contact">
              <Button size="lg" className="bg-[#DD5259] hover:bg-[#c94850] text-white font-semibold px-8 h-12 shadow-lg border-0">
                ติดต่อเรา <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
