"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { BarChart3, BookOpen, Calendar, Car, LogOut, MessageSquare } from "lucide-react";
import {
  Avatar, AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: BarChart3, label: "ภาพรวม", href: "/admin" },
  { icon: BookOpen, label: "บทความ", href: "/admin/blog" },
  { icon: Car, label: "รถยนต์", href: "/admin/cars" },
  { icon: Calendar, label: "นัดหมาย", href: "/admin/appointments" },
  { icon: MessageSquare, label: "รีวิวลูกค้า", href: "/admin/stories" },
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
          <div className="w-7 h-7 shrink-0">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M18 2L4 8V18C4 25.73 10.24 32.98 18 35C25.76 32.98 32 25.73 32 18V8L18 2Z" fill="url(#ag)" />
              <path d="M18 7L8 11.5V18C8 23.4 12.48 28.52 18 30.5C23.52 28.52 28 23.4 28 18V11.5L18 7Z" fill="#2E5EA8" opacity="0.5" />
              <text x="18" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="serif">ช</text>
              <defs>
                <linearGradient id="ag" x1="18" y1="2" x2="18" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563EB" /><stop offset="1" stopColor="#1B3A6B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="font-bold text-[#131F3C] text-[12px] leading-tight">CH.ERAWAN</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider">Admin Panel</div>
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
