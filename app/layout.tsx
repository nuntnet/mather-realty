import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import PublicLayout from "@/components/PublicLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ch-erawan.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | ช.เอราวัณ กรุ๊ป",
    default: "ช.เอราวัณ กรุ๊ป | ตัวแทนจำหน่ายรถยนต์ Mazda, Ford, Mitsubishi, GWM, Deepal, Kia",
  },
  description: "ตัวแทนจำหน่ายรถยนต์ชั้นนำในจังหวัดนครปฐม บริการซื้อ-ขาย ทดลองขับ และบริการหลังการขายครบวงจร Mazda, Ford, Mitsubishi, GWM, Deepal, Kia",
  keywords: ["ช.เอราวัณ", "มาสด้า", "ฟอร์ด", "มิตซูบิชิ", "GWM", "Deepal", "Kia", "รถยนต์นครปฐม", "ตัวแทนจำหน่าย"],
  authors: [{ name: "ช.เอราวัณ กรุ๊ป" }],
  creator: "ช.เอราวัณ กรุ๊ป",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: BASE_URL,
    siteName: "ช.เอราวัณ กรุ๊ป",
    title: "ช.เอราวัณ กรุ๊ป | ตัวแทนจำหน่ายรถยนต์",
    description: "ตัวแทนจำหน่ายรถยนต์ชั้นนำในจังหวัดนครปฐม บริการซื้อ-ขาย ทดลองขับ และบริการหลังการขายครบวงจร",
  },
  twitter: {
    card: "summary_large_image",
    title: "ช.เอราวัณ กรุ๊ป | ตัวแทนจำหน่ายรถยนต์",
    description: "ตัวแทนจำหน่ายรถยนต์ชั้นนำในจังหวัดนครปฐม",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PublicLayout>
          {children}
        </PublicLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
