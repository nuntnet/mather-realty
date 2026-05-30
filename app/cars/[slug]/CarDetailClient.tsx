"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Calendar, Wrench, ArrowLeft, ChevronLeft, ChevronRight, Calculator, Share2 } from "lucide-react";
import type { Car } from "@/lib/notion-types";

const fuelLabel: Record<string, string> = {
  petrol: "เบนซิน", diesel: "ดีเซล", hybrid: "ไฮบริด", electric: "ไฟฟ้า",
};

export default function CarDetailClient({ car }: { car: Car }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [downPayment, setDownPayment] = useState(20);
  const [loanTerm, setLoanTerm] = useState(60);

  const basePrice = car.priceMin || 1000000;
  const downAmount = Math.round(basePrice * downPayment / 100);
  const loanAmount = basePrice - downAmount;
  const monthlyRate = 0.0265 / 12;
  const monthlyPayment = Math.round(
    loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm) /
    (Math.pow(1 + monthlyRate, loanTerm) - 1)
  );

  const images = car.imageUrls;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[68px]">
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#64748B] mb-6">
          <Link href="/cars" className="flex items-center gap-1 hover:text-[#0F172A] transition-colors">
            <ArrowLeft className="w-4 h-4" /> ค้นหารถยนต์
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] font-medium">{car.brand} {car.model}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Images & Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] mb-6">
              <div className="aspect-[16/9] bg-gray-100 relative">
                {images.length > 0 ? (
                  <img
                    src={images[currentImage]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl font-bold">
                    {car.brand[0]}
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage(Math.min(images.length - 1, currentImage + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 ${i === currentImage ? "border-[#0F172A]" : "border-transparent"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                  <TabsTrigger value="specs">สเปค</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge className="bg-[#0F172A] text-white border-0">
                      {car.condition === "new" ? "รถใหม่" : "รถใช้แล้ว"}
                    </Badge>
                    {car.fuelType && <Badge variant="outline">{fuelLabel[car.fuelType] ?? car.fuelType}</Badge>}
                    {car.transmission && <Badge variant="outline">{car.transmission === "auto" ? "อัตโนมัติ" : "ธรรมดา"}</Badge>}
                    {car.engineSize && <Badge variant="outline">{car.engineSize}</Badge>}
                  </div>
                  <p className="text-[#475569] leading-relaxed">
                    {car.description || `${car.brand} ${car.model} รถยนต์คุณภาพสูงจาก ช.เอราวัณ กรุ๊ป พร้อมบริการหลังการขายครบวงจร`}
                  </p>
                </TabsContent>
                <TabsContent value="specs">
                  {Object.keys(car.specs).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(car.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2.5 border-b border-[#F1F5F9]">
                          <span className="text-[#64748B] text-sm">{key}</span>
                          <span className="font-medium text-[#0F172A] text-sm text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#64748B] text-sm">ไม่มีข้อมูลสเปค</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right: Price & Actions */}
          <div className="space-y-5">
            {/* Price Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="text-xs text-[#64748B] mb-1">{car.brand}</div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-3">{car.model}</h1>
              <div className="text-[#0F172A] font-bold text-2xl mb-1">
                ฿{car.priceMin.toLocaleString()}
                {car.priceMax > car.priceMin && ` – ฿${car.priceMax.toLocaleString()}`}
              </div>
              <p className="text-xs text-[#64748B] mb-5">ราคาเริ่มต้น (ยังไม่รวมค่าใช้จ่ายอื่น)</p>
              <div className="space-y-3">
                <Link href={`/booking?type=test_drive&car=${car.model}`}>
                  <Button className="w-full bg-[#0F172A] hover:bg-[#0B1120] text-white font-semibold">
                    <Calendar className="w-4 h-4 mr-2" />
                    นัดหมายทดลองขับ
                  </Button>
                </Link>
                <Link href={`/booking?type=service&car=${car.model}`}>
                  <Button variant="outline" className="w-full">
                    <Wrench className="w-4 h-4 mr-2" />
                    นัดหมายบริการ
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-[#64748B]"
                  onClick={() => navigator.share?.({ title: `${car.brand} ${car.model}`, url: window.location.href })}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  แชร์รถคันนี้
                </Button>
              </div>
            </div>

            {/* Financing Calculator */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calculator className="w-5 h-5 text-[#0F172A]" />
                <h3 className="font-semibold text-[#0F172A]">คำนวณสินเชื่อเบื้องต้น</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#64748B]">เงินดาวน์</span>
                    <span className="font-semibold text-[#0F172A]">{downPayment}% (฿{downAmount.toLocaleString()})</span>
                  </div>
                  <Slider value={[downPayment]} onValueChange={(v) => setDownPayment(v[0]!)} min={10} max={50} step={5} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#64748B]">ระยะเวลาผ่อน</span>
                    <span className="font-semibold text-[#0F172A]">{loanTerm} เดือน</span>
                  </div>
                  <Slider value={[loanTerm]} onValueChange={(v) => setLoanTerm(v[0]!)} min={24} max={84} step={12} className="w-full" />
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                  <div className="text-xs text-[#64748B] mb-1">ผ่อนชำระประมาณ</div>
                  <div className="text-2xl font-bold text-[#0F172A]">฿{monthlyPayment.toLocaleString()} / เดือน</div>
                  <div className="text-xs text-[#64748B] mt-1">ยอดกู้ ฿{loanAmount.toLocaleString()} · ดอกเบี้ย 2.65%</div>
                </div>
                <p className="text-[10px] text-[#64748B] leading-relaxed">
                  * ตัวเลขนี้เป็นการประมาณการเบื้องต้นเท่านั้น ยอดผ่อนจริงขึ้นอยู่กับเงื่อนไขสินเชื่อของแต่ละธนาคาร
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
