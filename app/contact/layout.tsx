import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "ติดต่อเรา",
  description: "ติดต่อ ช.เอราวัณ ออโต้ กรุ๊ป 7 สาขาในนครปฐมและปริมณฑล",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
