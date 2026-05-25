"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Wrench, Shield, Star, CheckCircle, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type BookingType = "test_drive" | "service" | "body_paint" | "insurance_quote";

const bookingTypes = [
  { id: "test_drive" as BookingType, icon: Calendar, title: "นัดหมายทดลองขับ", desc: "สัมผัสประสบการณ์ขับขี่จริงก่อนตัดสินใจ" },
  { id: "service" as BookingType, icon: Wrench, title: "นัดหมายเข้าศูนย์บริการ", desc: "จองคิวล่วงหน้า ไม่ต้องรอนาน" },
  { id: "body_paint" as BookingType, icon: Shield, title: "แจ้งซ่อมตัวถังและสี", desc: "ส่งรูปและเอกสารล่วงหน้า ประกันอนุมัติก่อน" },
  { id: "insurance_quote" as BookingType, icon: Star, title: "ขอเสนอราคาประกันภัย", desc: "รับใบเสนอราคาออนไลน์รวดเร็วทันใจ" },
];

const branches = [
  "มาสด้า ช.เอราวัณ นครปฐม",
  "มาสด้า ช.เอราวัณ ศาลายา",
  "Deepal ช.เอราวัณ ศาลายา",
  "ฟอร์ด ช.เอราวัณ อ้อมใหญ่",
  "ฟอร์ด ช.เอราวัณ นครปฐม",
  "มิตซูบิชิ ช.เอราวัณ นครปฐม",
  "GWM ช.เอราวัณ นครปฐม",
  "Kia ช.เอราวัณ นครปฐม",
];

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

interface UploadedFile { name: string; size: number; type: string; url?: string; uploading?: boolean; }

const emptyForm = {
  customerName: "", customerPhone: "", customerEmail: "", carModel: "",
  branch: "", preferredDate: "", preferredTime: "", notes: "",
  damageDescription: "", insuranceCompany: "", vehicleRegistration: "", coverageType: "",
};

function BookingForm() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as BookingType | null;
  const carParam = searchParams.get("car") ?? "";

  const [selectedType, setSelectedType] = useState<BookingType>(typeParam ?? "test_drive");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [damagePhotos, setDamagePhotos] = useState<UploadedFile[]>([]);
  const [insuranceDocs, setInsuranceDocs] = useState<UploadedFile[]>([]);
  const [form, setForm] = useState({ ...emptyForm, carModel: carParam });

  useEffect(() => { if (typeParam) setSelectedType(typeParam); }, [typeParam]);

  const handleFileUpload = (files: FileList | null, type: "damage" | "insurance") => {
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type, uploading: true }));
    const setter = type === "damage" ? setDamagePhotos : setInsuranceDocs;
    setter(prev => [...prev, ...newFiles]);
    setTimeout(() => {
      setter(prev => prev.map(f => newFiles.find(nf => nf.name === f.name) ? { ...f, uploading: false, url: "#" } : f));
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone) { toast.error("กรุณากรอกชื่อและเบอร์โทรศัพท์"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/submit/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: selectedType }),
      });
      if (!res.ok) throw new Error("ส่งไม่สำเร็จ");
      setSubmitted(true);
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const currentType = bookingTypes.find(t => t.id === selectedType)!;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-[68px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-3">ส่งคำขอสำเร็จ!</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            เราได้รับการนัดหมายของคุณแล้ว ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง
            {selectedType === "body_paint" && " เจ้าหน้าที่จะตรวจสอบรูปภาพและเอกสารเพื่อประสานงานกับประกันภัย"}
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 text-left">
            <div className="text-sm space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">ประเภท</span><span className="font-medium text-[#0F172A]">{currentType.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">ชื่อ</span><span className="font-medium text-[#0F172A]">{form.customerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">โทรศัพท์</span><span className="font-medium text-[#0F172A]">{form.customerPhone}</span></div>
              {form.preferredDate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">วันที่</span>
                  <span className="font-medium text-[#0F172A]">{new Date(form.preferredDate).toLocaleDateString("th-TH")}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={() => { setSubmitted(false); setDamagePhotos([]); setInsuranceDocs([]); setForm({ ...emptyForm }); }}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white"
          >
            จองนัดหมายใหม่
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[68px]">
      {/* Header */}
      <div className="bg-[#0F172A] text-white py-16 lg:py-20">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-white/40 text-sm font-medium tracking-wider uppercase mb-3">Appointment</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">จองนัดหมาย</h1>
            <p className="text-white/50 text-base lg:text-lg">เลือกบริการที่ต้องการและกรอกข้อมูลเพื่อจองนัดหมาย</p>
          </div>
        </div>
      </div>

      <div className="container py-10 lg:py-14">
        {/* Type Selection */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {bookingTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                selectedType === type.id
                  ? "border-[#0F172A] bg-[#0F172A] text-white shadow-lg shadow-[#0F172A]/20"
                  : "border-gray-100 bg-white hover:border-gray-300"
              }`}
            >
              <type.icon className={`w-7 h-7 mb-3 ${selectedType === type.id ? "text-white/70" : "text-[#0F172A]"}`} />
              <div className={`font-semibold text-sm mb-1 ${selectedType === type.id ? "text-white" : "text-[#0F172A]"}`}>{type.title}</div>
              <div className={`text-xs leading-relaxed ${selectedType === type.id ? "text-white/60" : "text-gray-400"}`}>{type.desc}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center">
                <currentType.icon className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h2 className="font-bold text-[#0F172A]">{currentType.title}</h2>
                <p className="text-sm text-gray-400">{currentType.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-600 text-sm">ชื่อ-นามสกุล *</Label>
                  <Input id="name" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="กรอกชื่อ-นามสกุล" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" required />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-600 text-sm">เบอร์โทรศัพท์ *</Label>
                  <Input id="phone" type="tel" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="0xx-xxx-xxxx" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" required />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-600 text-sm">อีเมล (ไม่บังคับ)</Label>
                <Input id="email" type="email" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="email@example.com" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" />
              </div>

              <div>
                <Label htmlFor="car" className="text-gray-600 text-sm">รุ่นรถที่สนใจ</Label>
                <Input id="car" value={form.carModel} onChange={e => setForm(f => ({ ...f, carModel: e.target.value }))} placeholder="เช่น Mazda CX-5, Ford Ranger" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600 text-sm">สาขา</Label>
                  <Select value={form.branch} onValueChange={v => setForm(f => ({ ...f, branch: v }))}>
                    <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue placeholder="เลือกสาขา" /></SelectTrigger>
                    <SelectContent>{branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date" className="text-gray-600 text-sm">วันที่ต้องการ</Label>
                  <Input id="date" type="date" value={form.preferredDate} onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))} className="mt-1.5 border-gray-200 focus:border-[#0F172A]" min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              {form.preferredDate && (
                <div>
                  <Label className="text-gray-600 text-sm">เวลาที่ต้องการ</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {timeSlots.map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, preferredTime: t }))}
                        className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${form.preferredTime === t ? "bg-[#0F172A] text-white border-[#0F172A]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Body Paint fields */}
              {selectedType === "body_paint" && (
                <div className="space-y-5 pt-5 border-t border-gray-50">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-amber-800 text-sm font-semibold mb-1.5">ขั้นตอนการแจ้งซ่อมออนไลน์</p>
                    <ol className="text-amber-700 text-xs leading-relaxed space-y-1 list-decimal list-inside">
                      <li>กรอกข้อมูลและอัปโหลดรูปภาพความเสียหาย</li>
                      <li>อัปโหลดเอกสารประกันภัย (กรมธรรม์, บัตรประชาชน)</li>
                      <li>ทีมงานจะส่งข้อมูลให้ประกันภัยอนุมัติงานซ่อมก่อน</li>
                      <li>เมื่อได้รับการอนุมัติ จึงนำรถเข้าซ่อม</li>
                    </ol>
                  </div>

                  <div>
                    <Label htmlFor="damage" className="text-gray-600 text-sm">รายละเอียดความเสียหาย</Label>
                    <Textarea id="damage" value={form.damageDescription} onChange={e => setForm(f => ({ ...f, damageDescription: e.target.value }))} placeholder="อธิบายตำแหน่งและลักษณะความเสียหาย" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" rows={3} />
                  </div>

                  <div>
                    <Label className="text-gray-600 text-sm">รูปภาพความเสียหาย</Label>
                    <div className="mt-1.5 border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-[#0F172A]/30 transition-colors bg-gray-50/50">
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                        <span className="text-sm text-gray-500 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                        <span className="text-xs text-gray-400">JPG, PNG ขนาดไม่เกิน 10MB</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files, "damage")} />
                      </label>
                    </div>
                    {damagePhotos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {damagePhotos.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                            {f.uploading ? <div className="w-3.5 h-3.5 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                            <span className="truncate flex-1 text-gray-600">{f.name}</span>
                            <button type="button" onClick={() => setDamagePhotos(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-600 text-sm">เอกสารประกันภัย</Label>
                    <div className="mt-1.5 border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-[#0F172A]/30 transition-colors bg-gray-50/50">
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-gray-300" />
                        <span className="text-sm text-gray-500 font-medium">คลิกเพื่ออัปโหลดเอกสาร</span>
                        <span className="text-xs text-gray-400">PDF, JPG, PNG ขนาดไม่เกิน 10MB</span>
                        <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={e => handleFileUpload(e.target.files, "insurance")} />
                      </label>
                    </div>
                    {insuranceDocs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {insuranceDocs.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                            {f.uploading ? <div className="w-3.5 h-3.5 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                            <span className="truncate flex-1 text-gray-600">{f.name}</span>
                            <button type="button" onClick={() => setInsuranceDocs(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="insurance" className="text-gray-600 text-sm">บริษัทประกันภัย</Label>
                    <Input id="insurance" value={form.insuranceCompany} onChange={e => setForm(f => ({ ...f, insuranceCompany: e.target.value }))} placeholder="เช่น เมืองไทยประกันภัย" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" />
                  </div>
                </div>
              )}

              {/* Insurance Quote fields */}
              {selectedType === "insurance_quote" && (
                <div className="space-y-4 pt-5 border-t border-gray-50">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg" className="text-gray-600 text-sm">ทะเบียนรถ</Label>
                      <Input id="reg" value={form.vehicleRegistration} onChange={e => setForm(f => ({ ...f, vehicleRegistration: e.target.value }))} placeholder="เช่น กก 1234 กรุงเทพ" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" />
                    </div>
                    <div>
                      <Label className="text-gray-600 text-sm">ประเภทความคุ้มครอง</Label>
                      <Select value={form.coverageType} onValueChange={v => setForm(f => ({ ...f, coverageType: v }))}>
                        <SelectTrigger className="mt-1.5 border-gray-200"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="type1">ชั้น 1</SelectItem>
                          <SelectItem value="type2">ชั้น 2</SelectItem>
                          <SelectItem value="type2plus">ชั้น 2+</SelectItem>
                          <SelectItem value="type3">ชั้น 3</SelectItem>
                          <SelectItem value="type3plus">ชั้น 3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-gray-600 text-sm">หมายเหตุเพิ่มเติม</Label>
                <Textarea id="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้ง" className="mt-1.5 border-gray-200 focus:border-[#0F172A]" rows={3} />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-3 text-base h-12"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังส่งข้อมูล...
                  </span>
                ) : "ยืนยันการนัดหมาย"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] pt-[68px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" /></div>}>
      <BookingForm />
    </Suspense>
  );
}
