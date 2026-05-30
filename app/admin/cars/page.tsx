"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car as CarIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CarForm from "@/components/admin/CarForm";
import type { Car } from "@/lib/notion-types";

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [deleting, setDeleting] = useState<Car | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchCars = () => {
    setLoading(true);
    fetch("/api/admin/cars")
      .then((r) => r.json())
      .then((data) => setCars(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const toggleFlag = async (car: Car, flag: "isActive" | "isFeatured", value: boolean) => {
    setBusyId(car.id);
    setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, [flag]: value } : c)));
    try {
      const res = await fetch("/api/admin/cars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: car.id, flags: { [flag]: value } }),
      });
      if (!res.ok) throw new Error();
      toast.success("อัปเดตสำเร็จ");
    } catch {
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, [flag]: !value } : c)));
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    try {
      const res = await fetch(`/api/admin/cars?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCars((prev) => prev.filter((c) => c.id !== id));
      toast.success("ลบรถสำเร็จ");
    } catch {
      toast.error("ลบไม่สำเร็จ");
    }
  };

  const filtered = cars.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">รถยนต์</h1>
          <p className="text-sm text-gray-500 mt-0.5">จัดการข้อมูลรถยนต์ทั้งหมด</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 bg-[#131F3C] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1a2a50] transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มรถ
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อ / รุ่น / แบรนด์..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#131F3C]/20"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <CarIcon className="w-10 h-10" />
            <p className="text-sm">ยังไม่มีรถยนต์ในระบบ</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">รถยนต์</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-24">แบรนด์</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-36">ราคา (เริ่มต้น)</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-3 py-3 uppercase tracking-wider w-20">แสดงผล</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-3 py-3 uppercase tracking-wider w-20">แนะนำ</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-28">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((car) => (
                <tr key={car.id} className={`hover:bg-gray-50/50 transition-colors ${!car.isActive ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {car.imageUrls[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={car.imageUrls[0]} alt="" className="w-12 h-9 object-cover rounded-lg bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-12 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <CarIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <Link href={`/cars/${car.slug || car.id}`} target="_blank" className="text-sm font-medium text-[#131F3C] hover:underline">
                          {car.model || car.name}
                        </Link>
                        <p className="text-xs text-gray-400">{car.year} · {car.condition === "new" ? "รถใหม่" : "รถมือสอง"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{car.brand}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-[#131F3C]">฿{car.priceMin.toLocaleString()}</td>
                  <td className="px-3 py-4 text-center">
                    <Switch
                      checked={car.isActive}
                      disabled={busyId === car.id}
                      onCheckedChange={(v) => toggleFlag(car, "isActive", v)}
                    />
                  </td>
                  <td className="px-3 py-4 text-center">
                    <Switch
                      checked={car.isFeatured}
                      disabled={busyId === car.id}
                      onCheckedChange={(v) => toggleFlag(car, "isFeatured", v)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(car);
                          setFormOpen(true);
                        }}
                        className="p-2 text-gray-500 hover:text-[#131F3C] hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="แก้ไข"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(car)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CarForm open={formOpen} onOpenChange={setFormOpen} car={editing} onSaved={fetchCars} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบรถ</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการลบ &ldquo;{deleting?.model || deleting?.name}&rdquo; ออกจากระบบหรือไม่?
              รถจะถูกซ่อนจากหน้าเว็บ (สามารถกู้คืนได้ใน Notion)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
