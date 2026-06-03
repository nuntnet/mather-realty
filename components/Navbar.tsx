"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, Building2, BookOpen, Info, Home, LayoutDashboard, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LangSelector from "@/components/LangSelector";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavbarProps {
  locale: string;
}

interface NavLink {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const NAV_LINKS: NavLink[] = [
  { labelKey: "properties", href: "/properties", icon: Building2 },
  { labelKey: "blog", href: "/blog", icon: BookOpen },
  { labelKey: "howItWorks", href: "/how-it-works", icon: Info },
];

export default function Navbar({ locale }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const user = session?.user;
  const isAdmin = (user as { role?: string } | undefined)?.role === "admin";
  const isLoggedIn = !!user;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleSignOut = async () => {
    await signOut();
    window.location.href = `/${locale}`;
  };

  return (
    <>
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white shadow-md"
          : "bg-white/90 backdrop-blur-md border-b border-gray-100/80"
      )}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity"
          aria-label="DoubleN Realty — Home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm select-none shrink-0">
            2N
          </span>
          <span className="text-2xl font-black tracking-tight hidden sm:block">
            <span className="text-blue-900">Double</span>
            <span className="text-blue-600">N</span>
            <span className="text-blue-900"> Realty</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ labelKey, href }) => (
            <Link
              key={href}
              href={href as `/properties` | `/blog` | `/how-it-works`}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors group",
                isActive(href)
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              )}
            >
              {t(labelKey as "properties" | "blog" | "howItWorks")}
              {/* Underline animation */}
              <span
                className={cn(
                  "absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-transform duration-200 origin-left",
                  "bg-blue-600",
                  isActive(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* CTA: List Your Property */}
          <Button
            asChild
            size="sm"
            className="hidden sm:flex gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-sm"
          >
            <Link href="/submit">
              <Home className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{t("submitListing")}</span>
              <span className="lg:hidden">List</span>
            </Link>
          </Button>

          {/* Lang selector */}
          <LangSelector variant="ghost" />

          {/* Auth */}
          {!isPending && (
            <>
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="User menu"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={(user as { image?: string }).image ?? ""}
                          alt={user?.name ?? "User"}
                        />
                        <AvatarFallback className="text-xs font-semibold bg-blue-600 text-white">
                          {user?.name?.slice(0, 2).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            {t("admin")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("dashboard")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-gray-700 hover:text-blue-600"
                  )}
                >
                  <Link href="/login" className="flex items-center gap-1.5">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("login")}</span>
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(
              "md:hidden h-11 w-11",
              "text-gray-700 hover:text-gray-900"
            )}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>

    {/* Mobile slide-down drawer — rendered outside header so it overlays content */}
    <>{/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer panel */}
      <div
        id="mobile-nav"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed top-16 left-0 right-0 z-40 md:hidden",
          "bg-white border-b border-gray-200 shadow-xl",
          "transition-all duration-300 ease-out origin-top",
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <nav className="flex flex-col divide-y divide-gray-100" aria-label="Mobile navigation">
          {/* Main links */}
          <div className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map(({ labelKey, href, icon: Icon }) => (
              <Link
                key={href}
                href={href as `/properties` | `/blog` | `/how-it-works`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 rounded-xl text-base font-medium transition-colors min-h-[44px]",
                  isActive(href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {t(labelKey as "properties" | "blog" | "howItWorks")}
              </Link>
            ))}
          </div>

          {/* CTA + Auth actions */}
          <div className="flex flex-col px-4 py-3 gap-2">
            <Link
              href="/submit"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-colors min-h-[44px]"
            >
              <Home className="h-5 w-5 shrink-0" />
              {t("submitListing")}
            </Link>

            {!isPending && !isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 rounded-xl text-base font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <LogIn className="h-5 w-5 shrink-0" />
                {t("login")}
              </Link>
            )}

            {!isPending && isLoggedIn && (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    {t("admin")}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  {t("dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="flex items-center gap-3 px-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[44px] w-full text-left"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Language selector */}
          <div className="px-4 py-3 flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Language</span>
            <LangSelector variant="outline" />
          </div>
        </nav>
      </div>
    </>
    </>
  );
}
