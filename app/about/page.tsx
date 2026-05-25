"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award, Users, MapPin, Shield, Star, Heart, ChevronRight, TrendingUp } from "lucide-react";

const timeline = [
  { year: "2510", title: "จุดเริ่มต้นของตำนาน", desc: "นายชัยพงศ์ จันทร์วาววาม ก่อตั้ง หสน.ช.เอราวัณ จำหน่ายอะไหล่รถยนต์และอะไหล่รถแทร็คเตอร์ ที่ตลาดลูกแก ต.ดอนขมิ้น อ.ท่ามะกา จ.กาญจนบุรี", milestone: "ก่อตั้งกิจการ", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80&auto=format&fit=crop" },
  { year: "2520s", title: "ก้าวสู่ธุรกิจรถยนต์", desc: "เริ่มนำรถเก่าญี่ปุ่นมาจำหน่าย ก่อตั้ง บจก.ช.เอราวัณร่วมทุนธุรกิจ เปิดโชว์รูมแห่งแรก เป็นตัวแทนจำหน่ายรถยนต์ดัทสัน (นิสสัน) และมิตซูบิชิ", milestone: "เปิดโชว์รูมแห่งแรก" },
  { year: "2530", title: "ขยายสู่นครปฐม", desc: "คุณวิชัย จันทร์วาววาม และคุณสุกัญญา จันทร์วาววาม บุกเบิกขยายธุรกิจเข้าสู่จังหวัดนครปฐม ภายใต้ชื่อ ช.เอราวัณ ออโตเซลส์", milestone: "สาขานครปฐม" },
  { year: "2544", title: "พันธมิตร Mazda", desc: "ได้รับแต่งตั้งเป็นตัวแทนจำหน่ายรถยนต์มาสด้าอย่างเป็นทางการ เริ่มต้นความสัมพันธ์กับแบรนด์ที่แข็งแกร่งที่สุดในเครือ", milestone: "Mazda Dealer", image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&q=80&auto=format&fit=crop" },
  { year: "2556", title: "เปิดสาขาศาลายา", desc: "เปิดสาขา มาสด้า ช.เอราวัณ ศาลายา บนถนนพุทธมณฑลสาย 5 รองรับลูกค้าในเขตสามพราน ศาลายา และปริมณฑลตะวันตก", milestone: "Mazda ศาลายา" },
  { year: "2558", title: "Ford อ้อมใหญ่", desc: "เปิด ฟอร์ด ช.เอราวัณ อ้อมใหญ่ บนถนนเพชรเกษม อ.สามพราน เสริมความแข็งแกร่งในกลุ่ม Pickup Truck และ SUV", milestone: "Ford Dealer", image: "https://images.unsplash.com/photo-1551830820-c6874016b5f0?w=400&q=80&auto=format&fit=crop" },
  { year: "2559", title: "Mitsubishi นครปฐม", desc: "เปิด มิตซู ช.เอราวัณ นครปฐม ที่ ต.ลำพยา อ.เมือง จ.นครปฐม ครบวงจรด้วยแบรนด์ญี่ปุ่นที่ครองตลาด Pickup Truck", milestone: "Mitsubishi Dealer", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&auto=format&fit=crop" },
  { year: "2566", title: "ก้าวสู่ยุค EV", desc: "ได้รับแต่งตั้งเป็นตัวแทนจำหน่าย GWM และ Deepal พร้อมรับกระแสรถยนต์ไฟฟ้าอย่างเต็มตัว ต่อมาเพิ่ม Kia เข้าสู่พอร์ตโฟลิโอ", milestone: "GWM · Deepal · Kia", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80&auto=format&fit=crop" },
  { year: "ปัจจุบัน", title: "6 แบรนด์ 7 สาขา", desc: "ช.เอราวัณ กรุ๊ป เติบโตเป็นกลุ่มดีลเลอร์ชั้นนำในภาคตะวันตก ครอบคลุม ICE, Hybrid และ EV ครบทุกกลุ่ม ส่วนแบ่งตลาดรวม ~13.1%", milestone: "ผู้นำภาคตะวันตก", image: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&q=80&auto=format&fit=crop" },
];

const coreValues = [
  { icon: Shield, title: "ความซื่อสัตย์", sub: "Integrity", desc: "ดำเนินธุรกิจด้วยความโปร่งใสและซื่อตรงต่อลูกค้าและพันธมิตรทุกราย" },
  { icon: Star, title: "ความเป็นเลิศ", sub: "Excellence", desc: "มุ่งมั่นพัฒนาคุณภาพการบริการและผลิตภัณฑ์อย่างต่อเนื่องไม่หยุดยั้ง" },
  { icon: Heart, title: "มุ่งเน้นลูกค้า", sub: "Customer Focus", desc: "ให้ความสำคัญกับความต้องการและความพึงพอใจของลูกค้าเป็นอันดับแรกเสมอ" },
  { icon: Users, title: "การทำงานเป็นทีม", sub: "Teamwork", desc: "ส่งเสริมการทำงานร่วมกันอย่างมีประสิทธิภาพเพื่อบรรลุเป้าหมายองค์กร" },
];

const awards = [
  {
    title: "GWM Number One Award",
    year: "2567",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมอันดับ 1 จาก GWM Thailand สาขานครปฐม",
    img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/YGdTgqCrWnMlNebF.jpg",
    brand: "GWM",
  },
  {
    title: "ผู้จำหน่ายยอดเยี่ยม Mazda",
    year: "2566",
    desc: "รางวัล Mazda Excellence Dealer Award ประจำปี 2566 ภาคตะวันตก",
    img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/amupkJZOMzlDBScc.jpg",
    brand: "Mazda",
  },
  {
    title: "กิจกรรมเพื่อสังคม",
    year: "2565",
    desc: "ช.เอราวัณ กรุ๊ป บริจาคของช่วยเหลือผู้ประสบภัยน้ำท่วมภาคอีสาน",
    img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/TsCmIkumrflAejvu.jpg",
    brand: "CSR",
  },
  {
    title: "งาน Motor Show นครปฐม",
    year: "2562",
    desc: "ร่วมจัดงาน Nakhon Pathom Motor Show ครั้งที่ 3 นำเสนอรถยนต์หลากหลายแบรนด์",
    img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/aqJOSAqwfSsBscMj.jpg",
    brand: "Event",
  },
  {
    title: "ทีมงาน ช.เอราวัณ",
    year: "2567",
    desc: "ทีมงานมืออาชีพกว่า 200 คน พร้อมให้บริการลูกค้าทุกท่านด้วยใจ",
    img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/BrXLfFaBkBOpwsss.jpg",
    brand: "Team",
  },
  {
    title: "GWM Rain Rider Fest",
    year: "2567",
    desc: "ร่วมงาน GWM Rain Rider Fest กิจกรรมสำหรับลูกค้า GWM ช.เอราวัณ",
    img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/ImgZrbnSgkTsgAMQ.jpg",
    brand: "GWM",
  },
];

const management = [
  { name: "คุณวิชัย จันทร์วาววาม", role: "ประธานกรรมการ", desc: "ผู้บุกเบิกและขยายธุรกิจ ช.เอราวัณ สู่จังหวัดนครปฐมตั้งแต่ปี 2530", initial: "ว", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop" },
  { name: "คุณณัฐวุฒิ จันทร์วาววาม", nickname: "คุณณัฐ", role: "IT Support & พัฒนาธุรกิจ", desc: "ดูแลด้าน IT การพัฒนาธุรกิจ และวางแผนกลยุทธ์องค์กร", initial: "ณ", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop" },
  { name: "คุณอรพา พงษ์วิทยภานุ", nickname: "คุณหยี", role: "ขาย & บริการหลังการขาย", desc: "ดูแลงานขาย บริการหลังการขาย และบัญชีการเงิน", initial: "อ", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop" },
  { name: "คุณนันทวิทย์ จันทร์วาววาม", nickname: "คุณนันท์", role: "การตลาด & วางแผนกลยุทธ์", desc: "ดูแลการตลาด บริการหลังการขาย และวางแผนกลยุทธ์", initial: "น", photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&q=80&auto=format&fit=crop" },
  { name: "คุณจันทร์จิรา จันทร์วาววาม", nickname: "คุณนุ้ย", role: "งานบุคคล & กฎหมาย", desc: "ดูแลงานบุคคล กฎหมาย และทะเบียนประกัน", initial: "จ", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop" },
];

const stats = [
  { value: "57+", label: "ปีแห่งประสบการณ์", sub: "ก่อตั้งปี 2510" },
  { value: "6", label: "แบรนด์รถยนต์", sub: "Mazda · Ford · Mitsubishi · GWM · Deepal · Kia" },
  { value: "7", label: "สาขาทั่วนครปฐม", sub: "ครอบคลุมทุกพื้นที่" },
  { value: "4", label: "ศูนย์ Body & Paint", sub: "มาตรฐาน OEM" },
  { value: "13.1%", label: "ส่วนแบ่งตลาดรวม", sub: "แบรนด์ในเครือ ปี 2568" },
  { value: "#1", label: "ผู้นำภาคตะวันตก", sub: "ดีลเลอร์อันดับ 1 ในภูมิภาค" },
];

const brands = [
  { name: "Mazda", since: "2544", branches: "2 สาขา", highlight: "KODO Design · SKYACTIV Technology", rank: "อันดับ 15", sales: "7,769 คัน", color: "bg-red-50 border-red-100", dot: "bg-red-500" },
  { name: "Ford", since: "2558", branches: "1 สาขา", highlight: "Ranger · Everest · Ford Pro", rank: "อันดับ 7", sales: "20,349 คัน", color: "bg-blue-50 border-blue-100", dot: "bg-blue-600" },
  { name: "Mitsubishi", since: "2510", branches: "1 สาขา", highlight: "Triton · Pajero Sport · PHEV", rank: "อันดับ 5", sales: "26,798 คัน", color: "bg-orange-50 border-orange-100", dot: "bg-orange-500" },
  { name: "GWM", since: "2566", branches: "1 สาขา", highlight: "Haval H6 · ORA · Tank 300", rank: "อันดับ 8", sales: "14,264 คัน", color: "bg-amber-50 border-amber-100", dot: "bg-amber-500" },
  { name: "Deepal", since: "2566", branches: "1 สาขา", highlight: "EV 100% · Changan Group", rank: "อันดับ 12", sales: "8,459 คัน", color: "bg-violet-50 border-violet-100", dot: "bg-violet-500" },
  { name: "Kia", since: "2566", branches: "1 สาขา", highlight: "Sorento · Carnival · EV5 · EV9", rank: "อันดับ 26", sales: "1,889 คัน", color: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-600" },
];

type Section = "history" | "brands" | "team" | "values";

export default function About() {
  const [active, setActive] = useState<Section>("history");

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[68px]">
      {/* Hero - Quote Style matching Figma */}
      <div className="bg-white py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative">
              <span className="absolute -top-8 -left-4 text-[120px] text-[#0F172A]/10 font-serif leading-none select-none">"</span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight relative z-10">
                ช.เอราวัณ คือเพื่อน<br />แท้ ที่พร้อมดูแลรถคุณ
              </h1>
              <span className="absolute -bottom-16 -right-4 text-[120px] text-[#0F172A]/10 font-serif leading-none select-none rotate-180">"</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Description */}
      <div className="bg-white pb-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#64748B] leading-relaxed mt-8">
              "ช.เอราวัณ นครปฐม" มีความมุ่งมั่นที่จะพัฒนาคุณภาพการบริการด้านรถยนต์ให้ดียิ่งขึ้น เพื่อ
              ตอบสนองความต้องการของลูกค้า ให้ ลูกค้าทุกท่านมั่นใจว่า "ช.เอราวัณ คือเพื่อนแท้
              ที่พร้อมดูแลรถคุณ"
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-100">
            {stats.map(s => (
              <div key={s.label} className="py-6 px-4 text-center">
                <div className="text-2xl font-bold text-[#0F172A]">{s.value}</div>
                <div className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-tight">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container">
          <div className="flex overflow-x-auto">
            {([
              { key: "history", label: "ประวัติบริษัท" },
              { key: "brands", label: "แบรนด์รถยนต์" },
              { key: "team", label: "ทีมผู้บริหาร" },
              { key: "values", label: "ค่านิยมองค์กร" },
            ] as { key: Section; label: string }[]).map(tab => (
              <button key={tab.key} onClick={() => setActive(tab.key)}
                className={`shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  active === tab.key ? "border-[#0F172A] text-[#0F172A]" : "border-transparent text-gray-400 hover:text-[#0F172A]"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* HISTORY */}
        {active === "history" && (
          <div>
            <div className="max-w-3xl mb-12">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">ประวัติความเป็นมา</h2>
              <p className="text-gray-500 leading-relaxed">
                "ช.เอราวัณ" ชื่ออันคุ้นหูของคนแถบตะวันตกมาเป็นเวลายาวนาน หากย้อนไปเมื่อปี พ.ศ. 2510
                นายชัยพงศ์ จันทร์วาววาม คุณปู่ของตระกูลจันทร์วาววาม ได้เล็งเห็นถึงช่องทางและโอกาสในการทำธุรกิจรถยนต์
                ท่านได้ริเริ่มร้านอะไหล่เล็กๆ และขยายกิจการจนกลายเป็นกลุ่มดีลเลอร์ชั้นนำในภาคตะวันตกในปัจจุบัน
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0F172A] to-gray-200" />
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div key={item.year} className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`pl-16 md:pl-0 flex-1 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {"image" in item && item.image && (
                          <div className="h-24 overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-2xl font-bold text-[#0F172A]">{item.year}</span>
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">{item.milestone}</span>
                          </div>
                          <h3 className="font-bold text-[#0F172A] mb-1.5">{item.title}</h3>
                          <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute left-4 md:left-1/2 top-5 w-4 h-4 rounded-full bg-[#0F172A] border-4 border-white shadow-md -translate-x-1/2 z-10" />
                    <div className="hidden md:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BRANDS */}
        {active === "brands" && (
          <div>
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">แบรนด์รถยนต์ในเครือ</h2>
              <p className="text-gray-500 leading-relaxed">
                ช.เอราวัณ กรุ๊ป เป็นตัวแทนจำหน่ายอย่างเป็นทางการของ 6 แบรนด์ชั้นนำ
                ครอบคลุมทุกกลุ่มรถยนต์ตั้งแต่ ICE, Hybrid ไปจนถึง EV เต็มรูปแบบ
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {brands.map(b => (
                <div key={b.name} className={`rounded-2xl border p-6 hover:shadow-md transition-all ${b.color}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3 h-3 rounded-full ${b.dot}`} />
                        <h3 className="text-xl font-bold text-[#0F172A]">{b.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400">ตัวแทนจำหน่ายตั้งแต่ปี {b.since}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-500">{b.rank}</div>
                      <div className="text-xs text-gray-400">ตลาดไทย</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 italic">{b.highlight}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-black/5">
                    <div>
                      <div className="text-xs text-gray-400">ยอดจดทะเบียน 2568</div>
                      <div className="text-sm font-bold text-[#0F172A]">{b.sales}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">สาขา</div>
                      <div className="text-sm font-bold text-[#0F172A]">{b.branches}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Market Summary */}
            <div className="mt-8 bg-[#0F172A] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-white/60" />
                <h3 className="font-bold">ส่วนแบ่งตลาดรวมแบรนด์ในเครือ ปี 2568</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {brands.map(b => (
                  <div key={b.name} className="text-center">
                    <div className="text-base font-bold text-white">{b.sales.replace(" คัน", "")}</div>
                    <div className="text-xs text-white/50 mt-0.5">{b.name}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <span className="text-white/50 text-sm">รวมทั้งหมด (ตลาดไทย 604,755 คัน)</span>
                <span className="text-white font-bold text-lg">79,528 คัน · 13.1%</span>
              </div>
            </div>
          </div>
        )}

        {/* TEAM */}
        {active === "team" && (
          <div>
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">ทีมผู้บริหาร</h2>
              <p className="text-gray-500 leading-relaxed">
                ช.เอราวัณ กรุ๊ป บริหารงานโดยทีมผู้บริหารที่มีความเชี่ยวชาญและประสบการณ์ยาวนาน
                ภายใต้การนำของตระกูลจันทร์วาววาม ที่สืบทอดปณิธานการให้บริการที่เป็นเลิศมาตลอดกว่า 57 ปี
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {management.map(person => (
                <div key={person.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-[#0F172A] to-[#334155]">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{person.initial}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-[#0F172A] text-base">{person.name}</h3>
                  {"nickname" in person && person.nickname && (
                    <p className="text-gray-400 text-sm">{person.nickname}</p>
                  )}
                  <p className="text-[#0F172A] text-xs font-semibold mt-1 mb-3 uppercase tracking-wide">{person.role}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{person.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VALUES */}
        {active === "values" && (
          <div>
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">วิสัยทัศน์และค่านิยมองค์กร</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              <div className="bg-[#0F172A] text-white rounded-2xl p-8">
                <div className="text-white/40 text-sm font-semibold uppercase tracking-wider mb-3">วิสัยทัศน์ (Vision)</div>
                <p className="text-white/80 leading-relaxed">
                  เป็นผู้นำในธุรกิจค้าปลีกรถยนต์ในภูมิภาคตะวันตก โดยมุ่งสร้างความพึงพอใจสูงสุดให้แก่ลูกค้า
                  ผ่านผลิตภัณฑ์และบริการที่มีคุณภาพ
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white font-bold text-lg">"เพื่อนแท้ พร้อมดูแลรถคุณ"</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="text-[#0F172A] text-sm font-semibold uppercase tracking-wider mb-3">พันธกิจ (Mission)</div>
                <ul className="space-y-3">
                  {[
                    "ส่งมอบรถยนต์และบริการที่เป็นเลิศเพื่อตอบสนองความต้องการของลูกค้า",
                    "พัฒนาบุคลากรให้มีความรู้ความสามารถและใจรักบริการ",
                    "สร้างความสัมพันธ์ที่ยั่งยืนกับคู่ค้าและพันธมิตรทางธุรกิจ",
                    "ดำเนินธุรกิจด้วยความรับผิดชอบต่อสังคมและสิ่งแวดล้อม",
                  ].map(m => (
                    <li key={m} className="flex items-start gap-2.5 text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A] mt-1.5 shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {coreValues.map(v => (
                <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-md transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-[#0F172A]" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-0.5">{v.title}</h3>
                  <p className="text-gray-400 text-xs font-medium mb-3">{v.sub}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
            {/* Awards Gallery */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-[#0F172A]" />
                <h3 className="font-bold text-[#0F172A] text-xl">รางวัลและกิจกรรม</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {awards.map(award => (
                  <div key={award.title} className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={award.img}
                      alt={award.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">{award.brand}</span>
                        <span className="text-white/60 text-xs">{award.year}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm">{award.title}</h4>
                      <p className="text-white/70 text-xs mt-1 leading-relaxed">{award.desc}</p>
                    </div>
                    {/* Always visible label */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[#0F172A]/80 text-white text-xs rounded-full font-medium">{award.brand} · {award.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-[#0F172A] text-white py-16 mt-8">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-3">พร้อมให้บริการคุณทุกวัน</h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            ไม่ว่าจะเป็นการซื้อรถใหม่ บริการซ่อมบำรุง หรือประกันภัย ช.เอราวัณ กรุ๊ป พร้อมดูแลคุณ
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/cars">
              <Button className="bg-white text-[#0F172A] hover:bg-gray-100 font-semibold">ดูรถยนต์ทั้งหมด</Button>
            </Link>
            <Link href="/booking">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">จองนัดหมาย</Button>
            </Link>
            <Link href="/branches">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <MapPin className="w-4 h-4 mr-1.5" /> ค้นหาสาขา
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
