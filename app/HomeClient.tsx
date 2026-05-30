"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BranchesMap from "@/components/BranchesMap";
import { brandLogoBase64 } from "@/lib/brandLogos";
import { BRAND_IMAGES } from "@/lib/brandImages";
import {
  ChevronRight, ArrowRight, Phone, MapPin, Calendar, Star,
  Shield, Wrench, Award,
} from "lucide-react";
import type { Car, BlogPost, CustomerStory } from "@/lib/notion-types";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const heroSlides = [
  {
    bg: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1920&q=80&auto=format&fit=crop",
    brand: "ORA", tagline: "FUTURE IS NOW",
    thaiTitle: "อนาคตของการขับขี่เริ่มต้นวันนี้",
    desc: "ORA Good Cat รถยนต์ไฟฟ้าสไตล์ Retro-Futuristic ดีไซน์โดดเด่น วิ่งได้ไกล 500 กม./ชาร์จ ขับง่าย ประหยัดค่าใช้จ่าย",
  },
  {
    bg: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920&q=80&auto=format&fit=crop",
    brand: "HAVAL", tagline: "DESIGNED FOR SUCCESS",
    thaiTitle: "ออกแบบมาเพื่อความสำเร็จ",
    desc: "HAVAL H6 SUV ยอดนิยมอันดับ 1 ในจีน พร้อมเทคโนโลยี Hybrid ประหยัดน้ำมัน ออพชั่นครบ ราคาคุ้มค่า",
  },
  {
    bg: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1920&q=80&auto=format&fit=crop",
    brand: "TANK", tagline: "BORN TO EXPLORE",
    thaiTitle: "เกิดมาเพื่อผจญภัย",
    desc: "TANK 300 SUV ออฟโรดสไตล์ Classic พร้อมระบบขับเคลื่อน 4 ล้อ ลุยได้ทุกเส้นทาง ดีไซน์เท่ไม่เหมือนใคร",
  },
];

const brandData = [
  { name: "GWM", slug: "GWM", logo: "GWM", brandImage: BRAND_IMAGES.GWM },
  { name: "HAVAL", slug: "HAVAL", logo: "HAVAL", brandImage: BRAND_IMAGES.HAVAL },
  { name: "ORA", slug: "ORA", logo: "ORA", brandImage: BRAND_IMAGES.ORA },
  { name: "TANK", slug: "TANK", logo: "TANK", brandImage: BRAND_IMAGES.TANK },
];

const brandTabs = ["ทั้งหมด", "GWM", "HAVAL", "ORA", "TANK"];

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
    return featuredCars.filter((c) => c.brand.toUpperCase() === activeBrandTab).slice(0, 6);
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
          <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
            {brandData.map((brand) => (
              <Link key={brand.name} href={`/cars?brand=${brand.slug}`}>
                <div className="flex items-center justify-center transition-all cursor-pointer group">
                  {brandLogoBase64[brand.name] ? (
                    <Image src={brandLogoBase64[brand.name]} alt={brand.name} width={80} height={32} className="h-8 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
                  ) : (
                    <span className="text-sm md:text-base font-bold tracking-[0.2em] text-[#0F172A] opacity-40 group-hover:opacity-100">{brand.logo}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND CARDS */}
      <section className="py-16 lg:py-24 bg-[#F8FAFC]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-3">แบรนด์รถยนต์ที่ ช.เอราวัณ ออโต้ กรุ๊ป</h2>
            <p className="text-gray-500 max-w-lg mx-auto">ตัวแทนจำหน่ายอย่างเป็นทางการ 6 แบรนด์ชั้นนำ พร้อมศูนย์บริการมาตรฐานครบวงจร</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
            {brandData.map((brand) => (
              <Link key={brand.name} href={`/cars?brand=${brand.slug}`}>
                <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                    <Image
                      src={brand.brandImage}
                      alt={brand.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {brandLogoBase64[brand.name] ? (
                        <Image src={brandLogoBase64[brand.name]} alt={brand.name} width={80} height={24} className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
                      ) : (
                        <span className="text-white font-bold tracking-widest text-sm">{brand.logo}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#0F172A] text-base">{brand.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">ดูรุ่นรถทั้งหมด</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#0F172A] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
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
                <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                  {car.imageUrls[0] ? (
                    <Image src={car.imageUrls[0]} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <Image src={BRAND_IMAGES[car.brand] ?? BRAND_IMAGES.default} alt={car.brand} fill className="object-cover opacity-80" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  )}
                  {car.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-[#0F172A] text-white text-[10px] font-semibold px-2.5 py-1 border-0">แนะนำ</Badge>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 font-medium tracking-wider uppercase mb-1">{car.brand}</p>
                  <h3 className="font-bold text-[#0F172A] text-lg mb-2">{car.model}</h3>
                  {car.priceMin > 0 && (
                    <p className="text-lg font-bold text-[#0F172A] mb-4">
                      ฿{car.priceMin.toLocaleString()}
                      <span className="text-xs font-normal text-gray-400 ml-1">เริ่มต้น</span>
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link href="/contact">
                      <Button variant="outline" size="sm" className="text-xs border-gray-200 text-gray-600 hover:border-[#0F172A] flex-1">สอบถามเพิ่มเติม</Button>
                    </Link>
                    <Link href={`/booking?type=test_drive&car=${car.model}`}>
                      <Button size="sm" className="text-xs bg-[#0F172A] hover:bg-[#1E293B] text-white flex-1">ทดลองขับ</Button>
                    </Link>
                  </div>
                  <Link href={`/cars/${car.slug || car.id}`}>
                    <p className="text-xs text-gray-400 hover:text-[#0F172A] mt-3 text-center cursor-pointer transition-colors font-medium">รายละเอียด →</p>
                  </Link>
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
                กลุ่มบริษัท ช.เอราวัณ ก่อตั้งขึ้นเมื่อปี พ.ศ. 2510 โดยคุณชวลิต ธรรมานุรักษ์กุล
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
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3877.5!2d100.3!3d13.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQyJzAwLjAiTiAxMDDCsDE4JzAwLjAiRQ!5e0!3m2!1sth!2sth!4v1"
                width="100%" height="380" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Ch.Erawan Location"
              />
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
