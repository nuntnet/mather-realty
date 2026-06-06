"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  LogOut,
  Mail,
  ScrollText,
  TrendingUp,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
};

function SidebarLink({
  item,
  isActive,
}: {
  item: MenuItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 h-10 px-3 rounded-lg font-medium text-sm transition-all ${
        isActive
          ? "bg-[#131F3C] text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-[#131F3C]"
      }`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge != null && item.badge > 0 && (
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${
            isActive ? "bg-white/20 text-white" : "bg-amber-500 text-white"
          }`}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/admin/stats?quick=1")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.pendingProperties != null) setPendingCount(d.pendingProperties); })
      .catch(() => {});
  }, []);

  const menuItems: MenuItem[] = [
    { icon: BarChart3,     label: "Dashboard",    href: "/admin" },
    { icon: Building2,     label: "Properties",   href: "/admin/properties", badge: pendingCount },
    { icon: Mail,          label: "Inquiries",    href: "/admin/inquiries" },
    { icon: ClipboardList, label: "Submissions",  href: "/admin/submissions" },
    { icon: BookOpen,      label: "Blog",         href: "/admin/blog" },
    { icon: Users,         label: "Users",        href: "/admin/users" },
    { icon: TrendingUp,    label: "Analytics",    href: "/admin/analytics" },
    { icon: ScrollText,    label: "Audit Log",    href: "/admin/audit" },
  ];

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
          <div>
            <span className="font-lexend font-extrabold tracking-tight text-base leading-none">
              <span className="text-[#1d211c]">Double</span>
              <span className="text-[#F4581A]">N</span>
            </span>
            <div className="text-[9px] text-gray-400 uppercase tracking-widest leading-tight mt-0.5">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest px-2 mb-2">
            Management
          </p>
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <SidebarLink key={item.href} item={item} isActive={isActive} />
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
                  <p className="text-sm font-medium text-[#131F3C] truncate">
                    {user?.name ?? "Admin"}
                  </p>
                  <p className="text-xs text-gray-400 truncate capitalize">
                    {(user as { role?: string })?.role ?? "admin"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen p-6 lg:p-8">{children}</main>
    </div>
  );
}
