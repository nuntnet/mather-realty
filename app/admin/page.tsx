"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, Calendar, Car, Mail, MessageSquare, RefreshCw, TrendingUp } from "lucide-react";
import type { Appointment, BlogPost, Car as CarType, ContactSubmission, CustomerStory } from "@/lib/notion-types";

function RevalidateButton() {
  const [loading, setLoading] = useState(false);

  async function handleRevalidate() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "all" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.success("รีเฟรชเว็บไซต์แล้ว", {
        description: "หน้าเว็บสาธารณะจะดึงข้อมูลล่าสุดจาก Notion ในการเข้าชมครั้งถัดไป",
      });
    } catch {
      toast.error("รีเฟรชไม่สำเร็จ", { description: "กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRevalidate}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-[#131F3C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1f2d52] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "กำลังรีเฟรช..." : "รีเฟรชเว็บไซต์"}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:   { label: "รอดำเนินการ", className: "bg-amber-100 text-amber-700" },
    confirmed: { label: "ยืนยันแล้ว",  className: "bg-blue-100 text-blue-700" },
    completed: { label: "เสร็จสิ้น",   className: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: "ยกเลิก",      className: "bg-red-100 text-red-600" },
  };
  const s = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>{s.label}</span>;
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [cars, setCars] = useState<CarType[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/appointments").then(r => r.json()),
      fetch("/api/admin/stories").then(r => r.json()),
      fetch("/api/admin/cars").then(r => r.json()),
      fetch("/api/admin/blog").then(r => r.json()),
      fetch("/api/admin/contacts").then(r => r.json()),
    ]).then(([apts, strs, crs, pts, cts]) => {
      setAppointments(Array.isArray(apts) ? apts : []);
      setStories(Array.isArray(strs) ? strs : []);
      setCars(Array.isArray(crs) ? crs : []);
      setPosts(Array.isArray(pts) ? pts : []);
      setContacts(Array.isArray(cts) ? cts : []);
    }).finally(() => setLoading(false));
  }, []);

  const pendingAppointments = appointments.filter(a => a.status === "pending").length;
  const pendingStories = stories.filter(s => s.status === "pending").length;
  const activeCars = cars.filter(c => c.isActive).length;
  const publishedPosts = posts.filter(p => p.isPublished).length;

  const stats = [
    { label: "รถยนต์ทั้งหมด", value: cars.length, sub: `${activeCars} กำลังแสดงผล`, icon: Car, color: "bg-emerald-50 text-emerald-600", href: "/admin/cars" },
    { label: "บทความเผยแพร่", value: publishedPosts, sub: `${posts.length} บทความทั้งหมด`, icon: BookOpen, color: "bg-blue-50 text-blue-600", href: "/admin/blog" },
    { label: "นัดหมาย", value: appointments.length, sub: `${pendingAppointments} รอดำเนินการ`, icon: Calendar, color: "bg-orange-50 text-orange-600", href: "/admin/appointments" },
    { label: "รีวิวลูกค้า", value: stories.length, sub: `${pendingStories} รอตรวจสอบ`, icon: MessageSquare, color: "bg-purple-50 text-purple-600", href: "/admin/stories" },
    { label: "ข้อความติดต่อ", value: contacts.length, sub: "จากฟอร์มติดต่อเรา", icon: Mail, color: "bg-rose-50 text-rose-600", href: "/admin/contacts" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#131F3C]">ภาพรวม</h1>
          <p className="text-sm text-gray-500 mt-1">สรุปข้อมูลทั้งหมดของระบบ</p>
        </div>
        <RevalidateButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#131F3C] mt-1">
                    {loading ? <span className="inline-block w-8 h-7 bg-gray-100 animate-pulse rounded" /> : stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#131F3C]">นัดหมายล่าสุด</h2>
            <Link href="/admin/appointments" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          {loading ? (
            <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" /></div>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">ยังไม่มีนัดหมาย</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#131F3C]">{apt.customerName}</p>
                    <p className="text-xs text-gray-400">{apt.carModel || apt.type} · {apt.customerPhone}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Stories */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#131F3C]">รีวิวรอตรวจสอบ</h2>
            <Link href="/admin/stories" className="text-xs text-blue-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          {loading ? (
            <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" /></div>
          ) : pendingStories === 0 ? (
            <div className="flex items-center gap-2 py-4 justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-gray-400">ไม่มีรีวิวรอตรวจสอบ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.filter(s => s.status === "pending").slice(0, 5).map((story) => (
                <div key={story.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#131F3C]">{story.customerName}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{story.story}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: story.rating }).map((_, i) => (
                      <span key={i} className="text-amber-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
