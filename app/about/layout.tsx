import type { Metadata } from "next";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "เกี่ยวกับเรา",
  description: "ประวัติและวิสัยทัศน์ ช.เอราวัณ ออโต้ กรุ๊ป ตัวแทนจำหน่ายรถยนต์ชั้นนำจ.นครปฐม กว่า 57 ปี",
  path: "/about",
});

const crumbs = breadcrumbJsonLd([
  { name: "หน้าแรก", path: "/" },
  { name: "เกี่ยวกับเรา", path: "/about" },
]);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      {children}
    </>
  );
}
