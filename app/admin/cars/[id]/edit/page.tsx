"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CarFormContent from "@/components/admin/CarFormContent";
import type { Car } from "@/lib/notion-types";

export default function EditCarPage() {
  const params = useParams();
  const id = params.id as string;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch("/api/admin/cars")
      .then((r) => r.json())
      .then((cars: Car[]) => {
        const found = cars.find((c) => c.id === id);
        if (!found) {
          setError("ไม่พบข้อมูลรถ");
        } else {
          setCar(found);
        }
      })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#94A3B8]" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="py-20 text-center text-[#94A3B8]">
        {error ?? "ไม่พบข้อมูล"}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <CarFormContent car={car} />
    </div>
  );
}
