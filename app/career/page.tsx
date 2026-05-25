"use client";

import { useState } from "react";
import { CheckCircle, Phone, Mail, MapPin, Building, DollarSign, Clock, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

const benefits = [
  {
    title: "สวัสดิการพื้นฐานและค่าตอบแทน",
    desc: "ครอบคลุมประกันสังคม, เบี้ยขยัน, และโบนัสประจำปี",
  },
  {
    title: "การพัฒนาบุคลากร",
    desc: "ได้รับการอบรมและพัฒนาทักษะต่อ ๆ อย่างต่อเนื่อง เพื่อเพิ่มศักยภาพในการทำงาน",
  },
  {
    title: "วันลาและสิทธิประโยชน์ต่างๆ",
    desc: "มีวันหยุดและวันลาที่หลากหลาย เช่น ลาพัก, ลาป่วย, ลาพักร้อน, และลากิจอื่น",
  },
  {
    title: "สิทธิพิเศษสำหรับพนักงาน",
    desc: "ได้รับสิทธิพิเศษในเรื่องการซื้อรถ, ซ่อมรถ, และซื้อประกัน พ.ร.บ. โปรสุดพิเศษ รวมถึงกิจกรรมสันทนาการที่จัดขึ้นเพื่อพนักงานประจำปี",
  },
];

const branches = ["ทั้งหมด", "มาสด้า นครปฐม", "มาสด้า ศาลายา", "ฟอร์ด อ้อมใหญ่", "มิตซู ศาลายา"];

const jobListings = [
  {
    title: "Sales Consultant : SC",
    urgent: true,
    desc: "รับผิดชอบการนำเสนอขายรถยนต์ให้แก่ลูกค้า ดูแลลูกค้าให้เกิดความพึงพอใจสูงสุด เพื่อสร้างยอดขายที่ดีให้กับบริษัทฯ",
    branch: "โชว์รูม Mazda สสนามจันทร์",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "มาสด้า นครปฐม",
  },
  {
    title: "Sales Consultant : SC",
    urgent: true,
    desc: "รับผิดชอบการนำเสนอขายรถยนต์ให้แก่ลูกค้า ดูแลลูกค้าให้เกิดความพึงพอใจสูงสุด เพื่อสร้างยอดขายที่ดีให้กับบริษัทฯ",
    branch: "โชว์รูม Mazda สสนามจันทร์",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "มาสด้า ศาลายา",
  },
  {
    title: "Sales Consultant : SC",
    urgent: true,
    desc: "รับผิดชอบการนำเสนอขายรถยนต์ให้แก่ลูกค้า ดูแลลูกค้าให้เกิดความพึงพอใจสูงสุด เพื่อสร้างยอดขายที่ดีให้กับบริษัทฯ",
    branch: "โชว์รูม Mazda สสนามจันทร์",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "ฟอร์ด อ้อมใหญ่",
  },
  {
    title: "ช่างเทคนิค",
    urgent: false,
    desc: "รับผิดชอบงานซ่อมบำรุงรถยนต์ตามมาตรฐานศูนย์บริการ ดูแลงานเทคนิคและตรวจเช็คสภาพรถยนต์",
    branch: "โชว์รูม Mazda สสนามจันทร์",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "มาสด้า นครปฐม",
  },
  {
    title: "พนักงานบัญชี",
    urgent: false,
    desc: "ดูแลงานบัญชีทั่วไป จัดทำรายงานการเงิน ตรวจสอบเอกสารทางบัญชี",
    branch: "สำนักงานใหญ่",
    salary: "ตามประสบการณ์",
    type: "งานประจำ",
    category: "มาสด้า นครปฐม",
  },
];

export default function Career() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");

  const filteredJobs = activeTab === "ทั้งหมด"
    ? jobListings
    : jobListings.filter(j => j.category === activeTab);

  return (
    <div className="min-h-screen bg-white pt-[68px]">
      {/* Hero Banner */}
      <div className="relative bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80&auto=format&fit=crop')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-transparent" />
        <div className="container relative z-10 py-16 lg:py-20">
          <p className="text-white/40 text-sm font-medium tracking-wider uppercase mb-3">Join Our Team</p>
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">มาเป็นส่วนหนึ่งของทีมเรา</h1>
          <p className="text-white/50 max-w-xl leading-relaxed">
            ร่วมงานกับ ช.เอราวัณ กรุ๊ป ผู้นำด้านยานยนต์ครบวงจร ด้วยประสบการณ์กว่า 57 ปี พร้อมเติบโตไปด้วยกัน
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <p className="text-[#64748B] max-w-2xl leading-relaxed mb-8">
          โชว์รูมรถยนต์ MAZDA, FORD, และ Mitsubishi พร้อมศูนย์บริการ
          ครบวงจร ประจำจังหวัดนครปฐม ได้รับความไว้วางใจจากลูกค้ามากว่า 20 ปี
          บริการด้วยใจด้วยวิสัยทัศน์ "ช.เอราวัณ เพื่อนแท้พร้อมดูแลรถคุณ"
        </p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">สวัสดิการที่ ช.เอราวัณ</h2>
            <p className="text-[#64748B] mb-6 text-sm leading-relaxed">
              เราใส่ใจคุณภาพชีวิตของพนักงาน จึงจัดสวัสดิการที่ครอบคลุม ทั้งด้าน
              สุขภาพ ความมั่นคง และการพัฒนาอาชีพ เพื่อให้ทุกคนเติบโตไปด้วยกัน
            </p>
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-[#0F172A]">{b.title} : </span>
                    <span className="text-[#64748B] text-sm">{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/nIwjMZhRYFIuokUQ.jpg"
              alt="ทีมงาน ช.เอราวัณ"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Contact for Interest */}
      <div className="bg-[#F8FAFC] py-12">
        <div className="container">
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-2">สนใจร่วมงานกับเรา</h2>
          <p className="text-center text-[#64748B] mb-8">ช่องทางการติดต่อเรา</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 border-t-4 border-red-500">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-1">ติดต่อฝ่ายบุคคล</h3>
              <p className="text-[#64748B] text-sm mb-3">จันทร์-เสาร์ เวลา 8.30-17.00 น.</p>
              <p className="text-[#0F172A] font-medium text-sm">099-2121177 หรือ 034-305-500 ต่อ 7 หรือ กดต่อ 127</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-t-4 border-red-500">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-1">อีเมล</h3>
              <p className="text-[#64748B] text-sm mb-3">ติดต่อส่งเอกสารหรือส่งประวัติเข้ามาได้เลย</p>
              <p className="text-[#0F172A] font-medium text-sm">cherawan.hr@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="container py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] text-center mb-3">
          ตำแหน่งที่กำลังเปิดรับ
        </h2>
        <p className="text-center text-[#64748B] mb-4 max-w-xl mx-auto">
          ร่วมเป็นส่วนหนึ่งกับทีมของเราในหลากหลายตำแหน่งที่เปิดรับ
          พร้อมโอกาสในการเติบโตและพัฒนาศักยภาพในสายงานยานยนต์
        </p>

        {/* Team Photo */}
        <div className="rounded-2xl overflow-hidden mb-8 max-w-4xl mx-auto">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/jugzxIheHverVfXA.jpg"
            alt="ทีมงาน ช.เอราวัณ"
            className="w-full h-[300px] object-cover"
          />
        </div>

        {/* Branch Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {branches.map((b) => (
            <button
              key={b}
              onClick={() => setActiveTab(b)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === b
                  ? "bg-[#0F172A] text-white"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredJobs.map((job, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[#0F172A]">{job.title}</h3>
                    {job.urgent && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">ด่วน</span>
                    )}
                  </div>
                  <p className="text-[#64748B] text-sm mb-3">{job.desc}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {job.branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.type}
                    </span>
                  </div>
                </div>
                <button className="text-[#0F172A] text-sm font-medium flex items-center gap-1 hover:underline shrink-0">
                  ดูรายละเอียด
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-[#94A3B8]">
            ไม่พบตำแหน่งงานในสาขานี้ในขณะนี้
          </div>
        )}
      </div>
    </div>
  );
}
