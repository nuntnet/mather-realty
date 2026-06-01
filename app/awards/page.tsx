"use client";

'use client';

import { useState } from "react";
import { Award, Trophy, Star, Users, Heart, Camera, X } from "lucide-react";

// All 32 real award images from CDN - organized by brand
const allImages = [
  // GWM Awards (5)
  {
    id: 1,
    title: "Leader Challenge 2025",
    desc: "รางวัลผู้นำยอดเยี่ยมแห่งปี 2025",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245636/ch-erawan/awards/gwm-leader-challenge-2025.jpg",
    category: "award",
    brand: "GWM",
    year: "2568",
  },
  {
    id: 2,
    title: "iAm Challenge 2025",
    desc: "รางวัลทีมงานยอดเยี่ยมแห่งปี 2025",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245637/ch-erawan/awards/gwm-iam-challenge-2025.jpg",
    category: "award",
    brand: "GWM",
    year: "2568",
  },
  {
    id: 3,
    title: "Top Sales 2024-2025",
    desc: "ยอดขายสูงสุด 2024-2025",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245639/ch-erawan/awards/gwm-top-sales-2024-2025.jpg",
    category: "award",
    brand: "GWM",
    year: "2568",
  },
  {
    id: 4,
    title: "Top Sales 2024",
    desc: "ยอดขายสูงสุด 2024",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245640/ch-erawan/awards/gwm-top-sales-2024.jpg",
    category: "award",
    brand: "GWM",
    year: "2567",
  },
  {
    id: 5,
    title: "Outstanding Sales Consultant 2025",
    desc: "รางวัลสุดยอดนักขาย 2025",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245641/ch-erawan/awards/gwm-outstanding-consultant-2025.jpg",
    category: "award",
    brand: "GWM",
    year: "2568",
  },

  // Mitsubishi Awards (8)
  {
    id: 6,
    title: "Body & Paint Performance Award 2024",
    desc: "รางวัลบริการสีและตัวถังยอดเยี่ยม 2024",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245651/ch-erawan/awards/mazda-dealer-excellence-2024b.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2567",
  },
  {
    id: 7,
    title: "Excellence Sales Award 2019",
    desc: "รางวัลที่ปรึกษาการขายยอดเยี่ยม 2019",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245644/ch-erawan/awards/mitsu-top-performance-2024.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2562",
  },
  {
    id: 8,
    title: "President Award 2018",
    desc: "รางวัลประธานบริษัท 2018",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245675/ch-erawan/team/team-photo-4.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2561",
  },
  {
    id: 9,
    title: "President Award 2019",
    desc: "รางวัลประธานบริษัท 2019",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780233453/ch-erawan/awards/mitsu-body-paint-2024.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2562",
  },
  {
    id: 10,
    title: "Mitsubishi Skill Contest Winner 2025",
    desc: "ผู้ชนะการแข่งขันทักษะมิตซูบิชิ 2025",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245648/ch-erawan/awards/mitsu-president-award.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2568",
  },
  {
    id: 11,
    title: "After Sale Performance Award 2019",
    desc: "รางวัลบริการหลังการขายยอดเยี่ยม 2019",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245643/ch-erawan/awards/mitsu-skills-contest-2025.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2562",
  },
  {
    id: 12,
    title: "Body & Paint Performance Award 2019",
    desc: "รางวัลบริการสีและตัวถังยอดเยี่ยม 2019",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245673/ch-erawan/team/team-photo-3.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2562",
  },
  {
    id: 13,
    title: "Sales Consultant Award",
    desc: "รางวัลที่ปรึกษาการขายที่มียอดขายปลึกสูงสุด",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245656/ch-erawan/awards/mazda-guild-2024b.jpg",
    category: "award",
    brand: "Mitsubishi",
    year: "2562",
  },

  // Deepal Awards (3)
  {
    id: 14,
    title: "Top Sale Performance Award",
    desc: "รางวัลยอดขายยอดเยี่ยม",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245681/ch-erawan/team/team-photo-9.jpg",
    category: "award",
    brand: "Deepal",
    year: "2568",
  },
  {
    id: 15,
    title: "Spare Part Achievement Award",
    desc: "รางวัลผลสำเร็จอะไหล่",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245652/ch-erawan/awards/mazda-sales-consultant-2024.jpg",
    category: "award",
    brand: "Deepal",
    year: "2568",
  },
  {
    id: 16,
    title: "Top Deepal S07 Sale Award",
    desc: "รางวัลยอดขาย Deepal S07 สูงสุด",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245666/ch-erawan/awards/kia-master-sales-2025.jpg",
    category: "award",
    brand: "Deepal",
    year: "2568",
  },

  // Mazda Awards (16)
  {
    id: 17,
    title: "Master Dealer 2018",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2018",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245682/ch-erawan/team/team-photo-10.jpg",
    category: "award",
    brand: "Mazda",
    year: "2561",
  },
  {
    id: 18,
    title: "Mazda Dealer of Excellence 2015",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2015",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245657/ch-erawan/awards/deepal-top-advisor-2025b.jpg",
    category: "award",
    brand: "Mazda",
    year: "2558",
  },
  {
    id: 19,
    title: "Mazda Dealer of Excellence 2017",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2017",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245649/ch-erawan/awards/mitsu-gold-standard.jpg",
    category: "award",
    brand: "Mazda",
    year: "2560",
  },
  {
    id: 20,
    title: "Mazda Dealer of Excellence 2021",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2021",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245676/ch-erawan/team/team-photo-5.jpg",
    category: "award",
    brand: "Mazda",
    year: "2564",
  },
  {
    id: 21,
    title: "Mazda Dealer of Excellence 2022",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2022",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245683/ch-erawan/team/team-photo-11.jpg",
    category: "award",
    brand: "Mazda",
    year: "2565",
  },
  {
    id: 22,
    title: "Mazda Dealer of Excellence 2023",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2023",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245679/ch-erawan/team/team-photo-8.jpg",
    category: "award",
    brand: "Mazda",
    year: "2566",
  },
  {
    id: 23,
    title: "Mazda Dealer of Excellence 2024",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2024",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245659/ch-erawan/awards/deepal-top-sales-2025.jpg",
    category: "award",
    brand: "Mazda",
    year: "2567",
  },
  {
    id: 24,
    title: "Mazda Dealer of Excellence 2024 (Alt)",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2024",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245645/ch-erawan/awards/mitsu-advisor-award.jpg",
    category: "award",
    brand: "Mazda",
    year: "2567",
  },
  {
    id: 25,
    title: "Mazda Dealer 2016",
    desc: "รางวัลผู้จำหน่ายยอดเยี่ยมแห่งปี 2016",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245662/ch-erawan/awards/kia-top-sales-2024.jpg",
    category: "award",
    brand: "Mazda",
    year: "2559",
  },
  {
    id: 26,
    title: "Mazda Guild 2015 - Nakhon Pathom",
    desc: "รางวัลทีมงานฝ่ายขายยอดเยี่ยมแห่งปี 2015 สาขานครปฐม",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245664/ch-erawan/awards/kia-top-sales-2025.jpg",
    category: "award",
    brand: "Mazda",
    year: "2558",
  },
  {
    id: 27,
    title: "Mazda Guild 2015 - Salaya",
    desc: "รางวัลทีมงานฝ่ายขายยอดเยี่ยมแห่งปี 2015 สาขาศาลายา",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245654/ch-erawan/awards/mazda-service-manager.jpg",
    category: "award",
    brand: "Mazda",
    year: "2558",
  },
  {
    id: 28,
    title: "Mazda Guild 2024",
    desc: "รางวัลทีมงานฝ่ายขายยอดเยี่ยมแห่งปี 2024",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245678/ch-erawan/team/team-photo-7.jpg",
    category: "award",
    brand: "Mazda",
    year: "2567",
  },
  {
    id: 29,
    title: "Mazda Guild 2024 - Sales",
    desc: "รางวัลฝ่ายขายยอดเยี่ยม 2024",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245667/ch-erawan/awards/ford-top-sales-2024.jpg",
    category: "award",
    brand: "Mazda",
    year: "2567",
  },
  {
    id: 30,
    title: "Service Team Award 2015",
    desc: "รางวัลทีมงานศูนย์บริการยอดเยี่ยมแห่งปี 2015",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245665/ch-erawan/awards/kia-outstanding-2025.jpg",
    category: "award",
    brand: "Mazda",
    year: "2558",
  },
  {
    id: 31,
    title: "Service Team Award 2015 (Alt)",
    desc: "รางวัลทีมงานศูนย์บริการยอดเยี่ยมแห่งปี 2015",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245650/ch-erawan/awards/mitsu-spare-kpi.jpg",
    category: "award",
    brand: "Mazda",
    year: "2558",
  },
  {
    id: 32,
    title: "Sales Team Award 2023",
    desc: "รางวัลฝ่ายขายยอดเยี่ยม 2023",
    img: "https://res.cloudinary.com/n5llrdnq/image/upload/f_auto,q_auto:best/v1780245671/ch-erawan/team/team-photo-1.jpg",
    category: "award",
    brand: "Mazda",
    year: "2566",
  },
];

const BRAND_FILTERS = [
  { label: "ทั้งหมด", value: "all" },
  { label: "Mazda", value: "Mazda" },
  { label: "Mitsubishi", value: "Mitsubishi" },
  { label: "GWM", value: "GWM" },
  { label: "Deepal", value: "Deepal" },
];

export default function Awards() {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedImage, setSelectedImage] = useState<typeof allImages[0] | null>(null);

  const filteredImages =
    selectedBrand === "all"
      ? allImages
      : allImages.filter((img) => img.brand === selectedBrand);

  return (
    <div className="min-h-screen bg-white pt-[68px]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0F172A] to-[#1a2847] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">รางวัลและผลสำเร็จ</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            ช.เอราวัณ ได้รับการยอมรับจากหลายองค์กรและบริษัทชั้นนำ สำหรับความเป็นเลิศในการบริการและการขาย
          </p>
        </div>
      </section>

      {/* Brand Filter */}
      <section className="bg-white py-8 px-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {BRAND_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedBrand(filter.value)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedBrand === filter.value
                    ? "bg-[#0F172A] text-white shadow-lg"
                    : "bg-gray-100 text-[#0F172A] hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-4 text-sm">
            แสดง {filteredImages.length} รางวัล
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#0F172A]"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={image.img}
                    alt={image.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23ddd' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Award className="w-12 h-12 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#0F172A] text-sm mb-2 line-clamp-2">
                    {image.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {image.desc}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      {image.brand}
                    </span>
                    <span className="text-gray-500">{image.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-[#0F172A]" />
            </button>

            <div className="grid md:grid-cols-3 gap-6 p-6">
              <div className="md:col-span-2">
                <img
                  src={selectedImage.img}
                  alt={selectedImage.title}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23ddd' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              <div className="md:col-span-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-4">
                    {selectedImage.title}
                  </h2>
                  <p className="text-gray-600 mb-6">{selectedImage.desc}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-[#0F172A]">{selectedImage.brand}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-[#0F172A]">ปี {selectedImage.year}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="mt-6 w-full bg-[#0F172A] hover:bg-[#1a2847] text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
