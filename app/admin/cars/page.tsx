import Link from "next/link";
import { ExternalLink, Car } from "lucide-react";
import { getActiveCars } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage() {
  const cars = await getActiveCars();

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">รถยนต์</h1>
          <p className="text-sm text-gray-500 mt-0.5">จัดการรถยนต์ผ่าน Notion Cars Database</p>
        </div>
        <a
          href={`https://www.notion.so/${process.env.NOTION_CARS_DB_ID?.replace(/-/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#131F3C] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1a2a50] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          เปิด Notion Database
        </a>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>วิธีจัดการรถยนต์:</strong> เพิ่ม แก้ไข หรือลบรถได้โดยตรงใน Notion Cars Database
        รูปภาพให้ upload ที่ Cloudinary แล้ว paste URL ลงใน &ldquo;Image URLs&rdquo; field (1 URL ต่อบรรทัด)
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider">รถยนต์</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-24">แบรนด์</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-28">ประเภท</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-36">ราคา (เริ่มต้น)</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wider w-24">แนะนำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cars.map(car => (
              <tr key={car.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {car.imageUrls[0] ? (
                      <img src={car.imageUrls[0]} alt="" className="w-12 h-9 object-cover rounded-lg bg-gray-100 shrink-0" />
                    ) : (
                      <div className="w-12 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <Link href={`/cars/${car.id}`} target="_blank" className="text-sm font-medium text-[#131F3C] hover:underline">
                        {car.model}
                      </Link>
                      <p className="text-xs text-gray-400">{car.year} · {car.condition === "new" ? "รถใหม่" : "รถใช้แล้ว"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{car.brand}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 capitalize">{car.type}</td>
                <td className="px-5 py-4 text-sm font-medium text-[#131F3C]">
                  ฿{car.priceMin.toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  {car.isFeatured ? (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">แนะนำ</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Car className="w-10 h-10" />
            <p className="text-sm">ยังไม่มีรถยนต์ในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
}
