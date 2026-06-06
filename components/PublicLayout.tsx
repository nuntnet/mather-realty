"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const NO_LAYOUT_PREFIXES = ["/admin", "/login", "/register"];

export default function PublicLayout({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const pathname = usePathname();
  const hideLayout = NO_LAYOUT_PREFIXES.some((p) => pathname.startsWith(p));

  if (hideLayout) return <>{children}</>;

  return (
    <>
      <Navbar locale={locale} />
      {children}
      <Footer />
    </>
  );
}
