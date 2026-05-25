"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Car, Wrench, ChevronRight, ExternalLink } from "lucide-react";

const branches = [
  {
    id: 1,
    name: "มาสด้า ช.เอราวัณ นครปฐม",
    graphicMap: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/YHvrOvpFHvKAIeEG.png",
    nameEn: "Mazda Ch.Erawan Nakhon Pathom",
    brand: "Mazda",
    isHQ: true,
    address: "75/2 ม.1 ถ.เพชรเกษม ต.ธรรมศาลา อ.เมือง จ.นครปฐม 73000",
    phone: "034-305-500",
    fax: "034-305-499",
    lineId: "@mazdach.erawan",
    lineUrl: "https://line.me/R/ti/p/@mazdach.erawan",
    hours: "จ–ศ 08:00–18:00 | ส–อา 08:00–17:00",
    mapUrl: "https://maps.app.goo.gl/dTCGV1ZZCsK9Ddu88",
    embedMapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.0!2d100.0!3d13.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ4JzAwLjAiTiAxMDDCsDAwJzAwLjAiRQ!5e0!3m2!1sth!2sth!4v1",
    services: ["ขายรถยนต์ใหม่ Mazda", "ศูนย์บริการมาตรฐาน Mazda", "ศูนย์ Body & Paint (Mazda, GWM)", "ศูนย์ล้อและยาง", "อะไหล่แท้ Mazda", "ประกันภัยรถยนต์"],
    bodyPaintBrands: ["Mazda", "GWM"],
    nearby: ["ถนนเพชรเกษม (Route 4)", "ชุมชน ต.ธรรมศาลา", "Central Nakhon Pathom (11 กม.)"],
  },
  {
    id: 2,
    name: "มาสด้า ช.เอราวัณ ศาลายา",
    graphicMap: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/SLBeYItuxiwOgQbb.png",
    nameEn: "Mazda Ch.Erawan Salaya",
    brand: "Mazda",
    isHQ: false,
    address: "200 ม.1 ต.บางเตย อ.สามพราน จ.นครปฐม 73210",
    phone: "02-482-2000",
    fax: "02-482-1912",
    lineId: "@mazdach.erawan",
    lineUrl: "https://line.me/R/ti/p/@mazdach.erawan",
    hours: "จ–ศ 08:00–18:00 | ส–อา 08:00–17:00",
    mapUrl: "https://maps.app.goo.gl/8L4AKtWmi8kUAgUb7",
    embedMapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.0!2d100.3!3d13.78!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ2JzQ4LjAiTiAxMDDCsDIwJzI0LjAiRQ!5e0!3m2!1sth!2sth!4v1",
    services: ["ขายรถยนต์ใหม่ Mazda", "ศูนย์บริการมาตรฐาน Mazda", "ศูนย์ Body & Paint (Mazda, Deepal)", "ศูนย์ล้อและยาง (Full Center)", "อะไหล่แท้ Mazda", "ประกันภัยรถยนต์"],
    bodyPaintBrands: ["Mazda", "Deepal"],
    nearby: ["Lotus's Salaya (0.3 กม.)", "Central Salaya (3.4 กม.)", "ม.มหิดล ศาลายา (5 กม.)"],
  },
  {
    id: 3,
    name: "Deepal ช.เอราวัณ ศาลายา",
    graphicMap: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/rTydICpCShmtxqYF.png",
    nameEn: "Deepal Ch.Erawan Salaya",
    brand: "Deepal",
    isHQ: false,
    address: "200 ม.1 ถ.พุทธมณฑลสาย 5 ต.บางเตย อ.สามพราน จ.นครปฐม 73210",
    phone: "02-482-2000",
    fax: "-",
    lineId: "@mazdach.erawan",
    lineUrl: "https://line.me/R/ti/p/@mazdach.erawan",
    hours: "ทุกวัน 10:00–20:00",
    mapUrl: "https://maps.app.goo.gl/8L4AKtWmi8kUAgUb7",
    embedMapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.0!2d100.3!3d13.78!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ2JzQ4LjAiTiAxMDDCsDIwJzI0LjAiRQ!5e0!3m2!1sth!2sth!4v1",
    services: ["ขายรถยนต์ไฟฟ้า Deepal", "EV Service Center", "ศูนย์ Body & Paint (ใช้ร่วมกับ Mazda ศาลายา)", "EV Charging Station", "อะไหล่แท้ Deepal"],
    bodyPaintBrands: ["Deepal"],
    nearby: ["ติดกับ Mazda ศาลายา", "Lotus's Salaya (0.3 กม.)", "ถ.พุทธมณฑลสาย 5"],
    note: "ตั้งอยู่ติดกับ Mazda ช.เอราวัณ ศาลายา บนที่ดินเดียวกัน",
  },
  {
    id: 4,
    name: "ฟอร์ด ช.เอราวัณ อ้อมใหญ่",
    graphicMap: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/OACqNvYyTKopUBMQ.png",
    nameEn: "Ford Ch.Erawan Omyai",
    brand: "Ford",
    isHQ: false,
    address: "1/2 หมู่ 8 ต.อ้อมใหญ่ อ.สามพราน จ.นครปฐม 73160",
    phone: "02-431-1000",
    fax: "02-431-1565",
    lineId: "@fordch.erawan",
    lineUrl: "https://line.me/R/ti/p/@fordch.erawan",
    hours: "จ–ศ 08:00–18:00 | ส–อา 08:00–17:00",
    mapUrl: "https://maps.app.goo.gl/6ivfUSsLFMpF3TAd8",
    embedMapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.0!2d100.27!3d13.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQzJzQ4LjAiTiAxMDDCsDIwJzI0LjAiRQ!5e0!3m2!1sth!2sth!4v1",
    services: ["ขายรถยนต์ใหม่ Ford", "Ford Pro (Commercial)", "ศูนย์บริการมาตรฐาน Ford", "ศูนย์ Body & Paint (Ford, Kia)", "ศูนย์ล้อและยาง", "อะไหล่แท้ Ford", "ประกันภัยรถยนต์"],
    bodyPaintBrands: ["Ford", "Kia"],
    nearby: ["ถ.เพชรเกษม อ.สามพราน", "ตลาดอ้อมใหญ่", "Big C อ้อมใหญ่"],
  },
  {
    id: 5,
    name: "มิตซูบิชิ ช.เอราวัณ นครปฐม",
    graphicMap: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/MzmZmGYusSysqPqs.png",
    nameEn: "Mitsubishi Ch.Erawan Nakhon Pathom",
    brand: "Mitsubishi",
    isHQ: false,
    address: "155 หมู่ 5 ต.ลำพยา อ.เมือง จ.นครปฐม 73000",
    phone: "034-300-333",
    fax: "034-300-390",
    lineId: "@mitsuch.erawan",
    lineUrl: "https://line.me/R/ti/p/@mitsuch.erawan",
    hours: "จ–ศ 08:00–18:00 | ส–อา 08:00–17:00",
    mapUrl: "https://maps.app.goo.gl/6VPaJr7KqBQvegB79",
    embedMapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.0!2d100.05!3d13.82!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ5JzEyLjAiTiAxMDDCsDAzJzAwLjAiRQ!5e0!3m2!1sth!2sth!4v1",
    services: ["ขายรถยนต์ใหม่ Mitsubishi", "ศูนย์บริการมาตรฐาน Mitsubishi", "ศูนย์ Body & Paint (Mitsubishi)", "ศูนย์ล้อและยาง", "อะไหล่แท้ Mitsubishi", "ประกันภัยรถยนต์", "Mitsubishi PHEV Service"],
    bodyPaintBrands: ["Mitsubishi"],
    nearby: ["ต.ลำพยา อ.เมือง นครปฐม", "ถ.นครปฐม–บางเลน"],
  },
  {
    id: 6,
    name: "GWM ช.เอราวัณ นครปฐม",
    graphicMap: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/PVkFEcgPpPbZuAXx.png",
    nameEn: "GWM Ch.Erawan Nakhon Pathom",
    brand: "GWM",
    isHQ: false,
    address: "333 ม.1 ต.ธรรมศาลา อ.เมือง จ.นครปฐม 73000",
    phone: "034-219-000",
    fax: "-",
    lineId: "@gwmch.erawan",
    lineUrl: "https://line.me/R/ti/p/@gwmch.erawan",
    hours: "จ–ศ 08:00–18:00 | ส–อา 08:00–17:00",
    mapUrl: "https://maps.app.goo.gl/h5e3T3ebtnDRCNgu5",
    embedMapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.0!2d100.02!3d13.80!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ4JzAwLjAiTiAxMDDCsDAyJzI0LjAiRQ!5e0!3m2!1sth!2sth!4v1",
    services: ["ขายรถยนต์ GWM (Haval, ORA, Tank)", "EV & Hybrid Service", "ศูนย์บริการมาตรฐาน GWM", "ศูนย์ Body & Paint (ใช้ร่วมกับ Mazda นครปฐม)", "EV Charging Station", "อะไหล่แท้ GWM"],
    bodyPaintBrands: ["GWM"],
    nearby: ["ถ.เพชรเกษม ต.ธรรมศาลา", "ติดกับ Mazda ช.เอราวัณ นครปฐม"],
    note: "ตั้งอยู่บนถนนเพชรเกษม ใกล้กับ Mazda ช.เอราวัณ นครปฐม",
  },
  {
    id: 7,
    name: "KIA ช.เอราวัณ นครปฐม",
    graphicMap: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/moqhKFCzmPuGsdVD.png",
    nameEn: "Kia Ch.Erawan Nakhon Pathom",
    brand: "Kia",
    isHQ: false,
    address: "339 ต.ยายชา อ.สามพราน จ.นครปฐม 73110",
    phone: "02-431-1565",
    fax: "-",
    lineId: "@kiach.erawan",
    lineUrl: "https://line.me/R/ti/p/@kiach.erawan",
    hours: "จ–ศ 08:00–18:00 | ส–อา 08:00–17:00",
    mapUrl: "https://maps.app.goo.gl/WHYEGfr2gQHQbv9X9",
    embedMapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.0!2d100.28!3d13.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQzJzEyLjAiTiAxMDDCsDI0JzI0LjAiRQ!5e0!3m2!1sth!2sth!4v1",
    services: ["ขายรถยนต์ Kia (Sorento, Carnival, EV5, EV9)", "EV Service Center", "ศูนย์บริการมาตรฐาน Kia", "ศูนย์ Body & Paint (ใช้ร่วมกับ Ford อ้อมใหญ่)", "ศูนย์ล้อและยาง", "อะไหล่แท้ Kia", "Kia Warranty 7 ปี"],
    bodyPaintBrands: ["Kia"],
    nearby: ["ต.ยายชา อ.สามพราน", "ใกล้ Ford ช.เอราวัณ อ้อมใหญ่"],
  },
];

const brandColors: Record<string, { bg: string; text: string; dot: string }> = {
  "Mazda":      { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-500" },
  "Ford":       { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-600" },
  "Mitsubishi": { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-600" },
  "GWM":        { bg: "bg-orange-50",  text: "text-orange-700", dot: "bg-orange-500" },
  "Deepal":     { bg: "bg-purple-50",  text: "text-purple-700", dot: "bg-purple-500" },
  "Kia":        { bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-600" },
};

const serviceMenuByBrand: Record<string, { category: string; items: string[] }[]> = {
  "Mazda": [
    { category: "บริการตรวจเช็ค", items: ["ตรวจเช็คตามระยะ Mazda Service Schedule", "ตรวจเช็คก่อนเดินทาง (Pre-Trip Check)", "ตรวจเช็คระบบ SKYACTIV"] },
    { category: "บริการซ่อมบำรุง", items: ["เปลี่ยนถ่ายน้ำมันเครื่อง", "เปลี่ยนไส้กรองอากาศ/น้ำมัน", "ซ่อมระบบเบรค", "ซ่อมระบบช่วงล่าง", "ซ่อมระบบไฟฟ้า"] },
    { category: "ศูนย์ล้อและยาง", items: ["ถ่วงล้อ (Wheel Balancing)", "ตั้งศูนย์ล้อ (Wheel Alignment)", "เปลี่ยนยาง", "สลับยาง (Tyre Rotation)", "เจียรจานเบรค"] },
    { category: "Body & Paint", items: ["ซ่อมตัวถังจากอุบัติเหตุ", "พ่นสีมาตรฐาน OEM", "ซ่อมรอยขีดข่วน/บุบ", "เคลือบแก้ว/เซรามิก", "บริการประกันภัย"] },
  ],
  "Ford": [
    { category: "บริการตรวจเช็ค", items: ["ตรวจเช็คตามระยะ Ford Service Schedule", "Ford Pro Service (Commercial)", "ตรวจเช็คระบบ EcoBoost"] },
    { category: "บริการซ่อมบำรุง", items: ["เปลี่ยนถ่ายน้ำมันเครื่อง", "ซ่อมระบบเกียร์อัตโนมัติ", "ซ่อมระบบ 4WD", "ซ่อมระบบเบรค ABS", "ซ่อมระบบช่วงล่าง"] },
    { category: "ศูนย์ล้อและยาง", items: ["ถ่วงล้อ", "ตั้งศูนย์ล้อ", "เปลี่ยนยาง", "สลับยาง", "เจียรจานเบรค"] },
    { category: "Body & Paint", items: ["ซ่อมตัวถังจากอุบัติเหตุ", "พ่นสีมาตรฐาน OEM", "ซ่อมรอยขีดข่วน/บุบ", "เคลือบแก้ว/เซรามิก", "บริการประกันภัย"] },
  ],
  "Mitsubishi": [
    { category: "บริการตรวจเช็ค", items: ["ตรวจเช็คตามระยะ Mitsubishi Service Schedule", "PHEV Battery Check", "ตรวจเช็คระบบ 4WD Super Select"] },
    { category: "บริการซ่อมบำรุง", items: ["เปลี่ยนถ่ายน้ำมันเครื่อง", "ซ่อมระบบ PHEV", "ซ่อมระบบเกียร์", "ซ่อมระบบช่วงล่าง", "ซ่อมระบบไฟฟ้า"] },
    { category: "ศูนย์ล้อและยาง", items: ["ถ่วงล้อ", "ตั้งศูนย์ล้อ", "เปลี่ยนยาง", "สลับยาง", "เจียรจานเบรค"] },
    { category: "Body & Paint", items: ["ซ่อมตัวถังจากอุบัติเหตุ", "พ่นสีมาตรฐาน OEM", "ซ่อมรอยขีดข่วน/บุบ", "เคลือบแก้ว/เซรามิก", "บริการประกันภัย"] },
  ],
  "GWM": [
    { category: "บริการตรวจเช็ค", items: ["ตรวจเช็คตามระยะ GWM Service Schedule", "EV/Hybrid Battery Check", "ตรวจเช็คระบบ ADAS"] },
    { category: "บริการซ่อมบำรุง", items: ["เปลี่ยนถ่ายน้ำมันเครื่อง", "ซ่อมระบบ EV/Hybrid", "ซ่อมระบบช่วงล่าง", "ซ่อมระบบไฟฟ้า", "อัปเดต Software OTA"] },
    { category: "EV Charging", items: ["EV Charging Station (AC/DC)", "บริการตรวจสอบแบตเตอรี่ EV"] },
    { category: "Body & Paint", items: ["ซ่อมตัวถังจากอุบัติเหตุ", "พ่นสีมาตรฐาน OEM", "ซ่อมรอยขีดข่วน/บุบ", "บริการประกันภัย"] },
  ],
  "Deepal": [
    { category: "EV Service", items: ["ตรวจเช็คตามระยะ Deepal EV Schedule", "EV Battery Health Check", "อัปเดต Software OTA", "ตรวจเช็คระบบ ADAS"] },
    { category: "EV Charging", items: ["EV Fast Charging (DC)", "EV Normal Charging (AC)", "บริการตรวจสอบแบตเตอรี่"] },
    { category: "Body & Paint", items: ["ซ่อมตัวถังจากอุบัติเหตุ", "พ่นสีมาตรฐาน OEM", "ซ่อมรอยขีดข่วน/บุบ", "บริการประกันภัย"] },
  ],
  "Kia": [
    { category: "บริการตรวจเช็ค", items: ["ตรวจเช็คตามระยะ Kia Service Schedule", "EV Battery Check", "Kia Warranty Check (7 ปี / 200,000 กม.)"] },
    { category: "บริการซ่อมบำรุง", items: ["เปลี่ยนถ่ายน้ำมันเครื่อง", "ซ่อมระบบ EV", "ซ่อมระบบช่วงล่าง", "ซ่อมระบบไฟฟ้า"] },
    { category: "ศูนย์ล้อและยาง", items: ["ถ่วงล้อ", "ตั้งศูนย์ล้อ", "เปลี่ยนยาง", "สลับยาง", "เจียรจานเบรค"] },
    { category: "Body & Paint", items: ["ซ่อมตัวถังจากอุบัติเหตุ", "พ่นสีมาตรฐาน OEM", "ซ่อมรอยขีดข่วน/บุบ", "บริการประกันภัย"] },
  ],
};

export default function ServiceLocator() {
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [filterBrand, setFilterBrand] = useState("ทั้งหมด");
  const [activeTab, setActiveTab] = useState<"map" | "info" | "services">("map");

  const brands = ["ทั้งหมด", "Mazda", "Ford", "Mitsubishi", "GWM", "Deepal", "Kia"];
  const filtered = filterBrand === "ทั้งหมด" ? branches : branches.filter(b => b.brand === filterBrand);
  const selected = branches.find(b => b.id === selectedBranch) as typeof branches[0] & { graphicMap?: string } | undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[68px]">
      {/* Header */}
      <div className="bg-[#0F172A] text-white py-14">
        <div className="container">
          <p className="text-[#0F172A] text-sm font-medium mb-2 tracking-wider uppercase">สาขาของเรา</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">ค้นหาสาขาและศูนย์บริการ</h1>
          <p className="text-white/70 max-w-xl">ช.เอราวัณ กรุ๊ป มี 7 สาขาครอบคลุมจังหวัดนครปฐมและสามพราน พร้อมให้บริการทั้งการขายและบริการหลังการขาย</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Brand Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => { setFilterBrand(brand); setSelectedBranch(null); }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterBrand === brand
                  ? "bg-[#0F172A] text-white shadow-md"
                  : "bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Branch List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map(branch => {
              const color = brandColors[branch.brand] ?? { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" };
              return (
                <button
                  key={branch.id}
                  onClick={() => { setSelectedBranch(branch.id === selectedBranch ? null : branch.id); setActiveTab("map"); }}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-md ${
                    selectedBranch === branch.id
                      ? "border-[#0F172A] shadow-md"
                      : "border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border-0 ${color.bg} ${color.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                          {branch.brand}
                        </span>
                        {branch.isHQ && (
                          <span className="px-2 py-0.5 bg-[#0F172A]/10 text-[#475569] text-xs rounded-full font-medium">
                            สำนักงานใหญ่
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-[#0F172A] text-sm leading-snug">{branch.name}</h3>
                      <p className="text-[#64748B] text-xs mt-1 line-clamp-1">{branch.address}</p>
                      <p className="text-[#0F172A] text-xs font-medium mt-1">{branch.phone}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[#94A3B8] mt-1 ml-2 shrink-0 transition-transform ${selectedBranch === branch.id ? "rotate-90" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Branch Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden sticky top-24">
                {/* Tabs */}

                {/* Tabs */}
                <div className="flex border-b border-[#E2E8F0]">
                  <button
                    onClick={() => setActiveTab("map")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "map" ? "text-[#0F172A] border-b-2 border-[#0F172A]" : "text-[#64748B]"}`}
                  >
                    แผนที่
                  </button>
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "info" ? "text-[#0F172A] border-b-2 border-[#0F172A]" : "text-[#64748B]"}`}
                  >
                    ข้อมูลสาขา
                  </button>
                  <button
                    onClick={() => setActiveTab("services")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "services" ? "text-[#0F172A] border-b-2 border-[#0F172A]" : "text-[#64748B]"}`}
                  >
                    เมนูบริการ
                  </button>
                </div>

                <div className="max-h-[520px] overflow-y-auto">
                  {activeTab === "map" ? (
                    <div className="relative bg-[#F8FAFC]">
                      {selected.graphicMap ? (
                        <>
                          <img
                            src={selected.graphicMap}
                            alt={`แผนที่กราฟฟิค ${selected.name}`}
                            className="w-full object-contain"
                          />
                          <a
                            href={selected.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-white rounded-lg px-3 py-1.5 text-xs font-medium text-[#0F172A] shadow-md hover:shadow-lg transition-shadow flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            เปิดใน Google Maps
                          </a>
                        </>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <MapPin className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                  ) : activeTab === "info" ? (
                    <div className="p-5">
                      <div className="flex items-start gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border-0 ${(brandColors[selected.brand] ?? { bg: "bg-gray-50", text: "text-gray-700" }).bg} ${(brandColors[selected.brand] ?? { bg: "bg-gray-50", text: "text-gray-700" }).text}`}>
                              {selected.brand}
                            </span>
                            {selected.isHQ && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full font-medium">สำนักงานใหญ่</span>}
                          </div>
                          <h2 className="text-lg font-bold text-[#0F172A]">{selected.name}</h2>
                          {(selected as { note?: string }).note && (
                            <p className="text-xs text-[#64748B] mt-0.5 italic">{(selected as { note?: string }).note}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2.5 mb-5">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#0F172A] mt-0.5 shrink-0" />
                          <span className="text-[#475569] text-sm">{selected.address}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-[#0F172A] shrink-0" />
                          <a href={`tel:${selected.phone}`} className="text-[#0F172A] font-semibold text-sm hover:underline">
                            {selected.phone}
                          </a>
                          {selected.fax !== "-" && <span className="text-[#64748B] text-xs">โทรสาร: {selected.fax}</span>}
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-[#0F172A] mt-0.5 shrink-0" />
                          <span className="text-[#475569] text-sm">{selected.hours}</span>
                        </div>
                      </div>

                      {/* Nearby */}
                      {selected.nearby && (
                        <div className="mb-5">
                          <h4 className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">สถานที่ใกล้เคียง</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selected.nearby.map(n => (
                              <span key={n} className="px-2.5 py-1 bg-[#F1F5F9] text-[#475569] rounded-full text-xs">{n}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <Link href={`/booking?branch=${selected.id}&type=test_drive`}>
                          <Button size="sm" className="w-full bg-[#0F172A] hover:bg-[#0B1120] text-white text-xs">
                            <Car className="w-3.5 h-3.5 mr-1" />
                            ทดลองขับ
                          </Button>
                        </Link>
                        <Link href={`/booking?branch=${selected.id}&type=service`}>
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            <Wrench className="w-3.5 h-3.5 mr-1" />
                            นัดบริการ
                          </Button>
                        </Link>
                        <a href={selected.lineUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="w-full text-xs border-[#06C755] text-[#06C755] hover:bg-[#06C755] hover:text-white">
                            <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            LINE
                          </Button>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5">
                    <div className="space-y-4">
                      {(serviceMenuByBrand[selected.brand] ?? []).map(cat => (
                        <div key={cat.category}>
                          <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-[#0F172A]" />
                            {cat.category}
                          </h4>
                          <ul className="space-y-1">
                            {cat.items.map(item => (
                              <li key={item} className="flex items-start gap-2 text-sm text-[#475569]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A] mt-1.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-[#E2E8F0]">
                        <Link href={`/booking?branch=${selected.id}&type=service`}>
                          <Button size="sm" className="w-full bg-[#0F172A] hover:bg-[#0B1120] text-white text-xs">
                            <Wrench className="w-3.5 h-3.5 mr-1.5" />
                            จองนัดหมายบริการ
                          </Button>
                        </Link>
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] h-80 flex items-center justify-center text-center">
                <div>
                  <MapPin className="w-14 h-14 mx-auto mb-3 text-[#0F172A]/15" />
                  <h3 className="font-semibold text-[#0F172A] mb-1">เลือกสาขาเพื่อดูรายละเอียด</h3>
                  <p className="text-[#64748B] text-sm">คลิกที่สาขาทางซ้ายเพื่อดูข้อมูล แผนที่ และเมนูบริการ</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { value: "7", label: "สาขาทั่วนครปฐม" },
            { value: "6", label: "แบรนด์รถยนต์" },
            { value: "4", label: "ศูนย์ Body & Paint" },
            { value: "034-305-500", label: "Call Center" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-center">
              <div className="text-xl font-bold text-[#0F172A] mb-1">{stat.value}</div>
              <div className="text-[#64748B] text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
