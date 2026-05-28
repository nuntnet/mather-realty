import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import PublicLayout from "@/components/PublicLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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

const autoDealerJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "ช.เอราวัณ ออโต้ กรุ๊ป",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: "ตัวแทนจำหน่ายรถยนต์ชั้นนำในจังหวัดนครปฐม Mazda, Ford, Mitsubishi, GWM, Deepal, Kia — 7 สาขา",
  address: {
    "@type": "PostalAddress",
    addressLocality: "นครปฐม",
    addressCountry: "TH",
  },
  telephone: "094-413-3555",
  areaServed: { "@type": "City", name: "นครปฐม" },
  brand: [
    { "@type": "Brand", name: "Mazda" },
    { "@type": "Brand", name: "Ford" },
    { "@type": "Brand", name: "Mitsubishi" },
    { "@type": "Brand", name: "GWM" },
    { "@type": "Brand", name: "Deepal" },
    { "@type": "Brand", name: "Kia" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${ibmPlexSansThai.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(autoDealerJsonLd) }}
        />
        <PublicLayout>
          {children}
        </PublicLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
