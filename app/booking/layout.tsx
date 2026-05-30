import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "จองนัดหมาย",
  description: "จองนัดหมายทดลองขับ บริการศูนย์ แจ้งซ่อมตัวถัง/สี และขอใบเสนอราคาประกันออนไลน์",
  path: "/booking",
});

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
