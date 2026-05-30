"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { BarChart3, BookOpen, Calendar, Car, LogOut, Mail, MessageSquare, Tag, Wrench, Palette, MessageSquareWarning } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";
import {
  Avatar, AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: BarChart3,    label: "ภาพรวม",      href: "/admin" },
  { icon: BookOpen,     label: "บทความ",       href: "/admin/blog" },
  { icon: Car,          label: "รถยนต์",       href: "/admin/cars" },
  { icon: Tag,                  label: "โปรโมชั่น",    href: "/admin/promotions" },
  { icon: MessageSquareWarning, label: "Feedback",      href: "/admin/feedback" },
  { icon: Wrench,               label: "Brand Content", href: "/admin/service-content" },
  { icon: Calendar,     label: "นัดหมาย",      href: "/admin/appointments" },
  { icon: MessageSquare,label: "รีวิวลูกค้า",  href: "/admin/stories" },
  { icon: Mail,         label: "ข้อความติดต่อ",href: "/admin/contacts" },
];

const brandWebLinks = [
  { icon: Wrench,  label: "ศูนย์บริการ GWM",  href: "/gwm/service",     notion: "https://www.notion.so" },
  { icon: Palette, label: "ซ่อมสี/ตัวถัง GWM", href: "/gwm/body-repair", notion: "https://www.notion.so" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FB]">
        <div className="w-6 h-6 border-2 border-[#131F3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0">
        {/* Logo */}
        <div className="h-14 border-b border-gray-100 px-4 flex items-center gap-2.5">
          <CompanyLogo height={36} className="h-9 w-auto" />
          <div className="text-[9px] text-gray-400 uppercase tracking-wider leading-tight">
            Admin Panel
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest px-2 mb-2">เมนูหลัก</p>
          {menuItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 h-10 px-3 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? "bg-[#131F3C] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#131F3C]"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Brand Web quick links */}
        <div className="px-2 pb-3 border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest px-2 mb-2">Brand Web</p>
          {brandWebLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              className="flex items-center gap-2.5 h-9 px-3 rounded-lg text-xs text-gray-500 hover:bg-gray-100 hover:text-[#131F3C] transition-all"
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <span className="text-gray-300 text-[10px]">↗</span>
            </Link>
          ))}
        </div>

        {/* User footer */}
        <div className="border-t border-gray-100 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-[#131F3C] text-white text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase() ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#131F3C] truncate">{user?.name ?? "Admin"}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email ?? ""}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
