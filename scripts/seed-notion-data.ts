/**
 * Seed Sample Data for ch-erawan-next Notion Databases
 * Run: npx tsx scripts/seed-notion-data.ts
 */

import { Client } from "@notionhq/client";
import { config } from "dotenv";
config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DB = {
  cars: process.env.NOTION_CARS_DB_ID!,
  blog: process.env.NOTION_BLOG_DB_ID!,
  stories: process.env.NOTION_STORIES_DB_ID!,
};

// Sample car images from Unsplash (free to use)
const carImages = {
  havalH6: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
  oraGoodCat: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
  tankS300: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
  gwmCannon: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  havalJolion: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
  oraGoodCat2: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
};

const blogImages = {
  review: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800",
  tips: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
  news: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
  promo: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
};

const customerImages = {
  customer1: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  customer2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  customer3: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
};

async function seedCars() {
  console.log("🚗 Seeding Cars...");

  const cars = [
    {
      name: "HAVAL H6 HEV",
      brand: "HAVAL",
      model: "H6 HEV",
      year: 2024,
      type: "SUV",
      condition: "new",
      priceMin: 1199000,
      priceMax: 1399000,
      engineSize: "1.5L Turbo Hybrid",
      transmission: "automatic",
      fuelType: "hybrid",
      description: "SUV ไฮบริดสุดหรู ประหยัดน้ำมัน ขับสบาย เทคโนโลยีล้ำสมัย",
      imageUrls: carImages.havalH6,
      isActive: true,
      isFeatured: true,
      slug: "haval-h6-hev-2024",
    },
    {
      name: "ORA Good Cat",
      brand: "ORA",
      model: "Good Cat",
      year: 2024,
      type: "EV",
      condition: "new",
      priceMin: 989000,
      priceMax: 1199000,
      engineSize: "Electric Motor",
      transmission: "automatic",
      fuelType: "electric",
      description: "รถยนต์ไฟฟ้าสไตล์ Retro วิ่งไกล 400+ กม. ชาร์จเร็ว",
      imageUrls: carImages.oraGoodCat,
      isActive: true,
      isFeatured: true,
      slug: "ora-good-cat-2024",
    },
    {
      name: "TANK 300",
      brand: "TANK",
      model: "300",
      year: 2024,
      type: "SUV",
      condition: "new",
      priceMin: 1799000,
      priceMax: 1999000,
      engineSize: "2.0L Turbo",
      transmission: "automatic",
      fuelType: "petrol",
      description: "SUV Off-road สุดแกร่ง ลุยทุกสภาพถนน หรูหราทุกมุมมอง",
      imageUrls: carImages.tankS300,
      isActive: true,
      isFeatured: true,
      slug: "tank-300-2024",
    },
    {
      name: "GWM CANNON",
      brand: "GWM",
      model: "CANNON",
      year: 2024,
      type: "Pickup",
      condition: "new",
      priceMin: 799000,
      priceMax: 999000,
      engineSize: "2.0L Turbo Diesel",
      transmission: "automatic",
      fuelType: "diesel",
      description: "กระบะพันธุ์แกร่ง ขับสี่ แรงเกินตัว อุปกรณ์ครบครัน",
      imageUrls: carImages.gwmCannon,
      isActive: true,
      isFeatured: false,
      slug: "gwm-cannon-2024",
    },
    {
      name: "HAVAL Jolion",
      brand: "HAVAL",
      model: "Jolion",
      year: 2024,
      type: "SUV",
      condition: "new",
      priceMin: 879000,
      priceMax: 1049000,
      engineSize: "1.5L Turbo",
      transmission: "automatic",
      fuelType: "petrol",
      description: "Compact SUV คุ้มค่า สวยหรู ขับง่าย อุปกรณ์ครบ",
      imageUrls: carImages.havalJolion,
      isActive: true,
      isFeatured: false,
      slug: "haval-jolion-2024",
    },
    {
      name: "ORA Good Cat GT",
      brand: "ORA",
      model: "Good Cat GT",
      year: 2024,
      type: "EV",
      condition: "new",
      priceMin: 1199000,
      priceMax: 1399000,
      engineSize: "Electric Motor 171HP",
      transmission: "automatic",
      fuelType: "electric",
      description: "รุ่นสปอร์ต วิ่งไกล 500+ กม. ชาร์จ 30 นาที 80%",
      imageUrls: carImages.oraGoodCat2,
      isActive: true,
      isFeatured: true,
      slug: "ora-good-cat-gt-2024",
    },
  ];

  for (const car of cars) {
    await notion.pages.create({
      parent: { database_id: DB.cars },
      properties: {
        "Name": { title: [{ text: { content: car.name } }] },
        "Brand": { select: { name: car.brand } },
        "Model": { rich_text: [{ text: { content: car.model } }] },
        "Year": { number: car.year },
        "Type": { select: { name: car.type } },
        "Condition": { select: { name: car.condition } },
        "Price Min": { number: car.priceMin },
        "Price Max": { number: car.priceMax },
        "Engine Size": { rich_text: [{ text: { content: car.engineSize } }] },
        "Transmission": { select: { name: car.transmission } },
        "Fuel Type": { select: { name: car.fuelType } },
        "Description": { rich_text: [{ text: { content: car.description } }] },
        "Image URLs": { rich_text: [{ text: { content: car.imageUrls } }] },
        "Is Active": { checkbox: car.isActive },
        "Is Featured": { checkbox: car.isFeatured },
        "Slug": { rich_text: [{ text: { content: car.slug } }] },
      },
    });
    console.log(`  ✅ ${car.name}`);
  }
}

async function seedBlogPosts() {
  console.log("📝 Seeding Blog Posts...");

  const posts = [
    {
      title: "รีวิว HAVAL H6 HEV 2024: SUV ไฮบริดที่คุ้มค่าที่สุด",
      slug: "review-haval-h6-hev-2024",
      excerpt: "พาชม HAVAL H6 HEV 2024 SUV ไฮบริดสุดล้ำ ประหยัดน้ำมัน แรงเกินคาด อุปกรณ์ครบครัน",
      coverImageUrl: blogImages.review,
      category: "review",
      tags: ["HAVAL", "รีวิว"],
      seoTitle: "รีวิว HAVAL H6 HEV 2024 - SUV ไฮบริดที่ดีที่สุด | ช.เอราวัณ",
      seoDescription: "รีวิวเต็ม HAVAL H6 HEV 2024 SUV ไฮบริดสุดประหยัด ขับสบาย อุปกรณ์ล้ำสมัย ราคาคุ้มค่า",
      isPublished: true,
      publishedAt: "2024-05-15",
      authorName: "ทีมข่าว ช.เอราวัณ",
    },
    {
      title: "5 เคล็ดลับดูแลรถ EV ให้ใช้งานได้ยาวนาน",
      slug: "5-tips-ev-maintenance",
      excerpt: "แนะนำวิธีดูแลรถยนต์ไฟฟ้าอย่างถูกวิธี ช่วยยืดอายุแบตเตอรี่และประหยัดค่าใช้จ่าย",
      coverImageUrl: blogImages.tips,
      category: "tips",
      tags: ["ORA", "เคล็ดลับ"],
      seoTitle: "5 เคล็ดลับดูแลรถ EV - วิธีรักษาแบตเตอรี่ | ช.เอราวัณ",
      seoDescription: "เรียนรู้วิธีดูแลรถยนต์ไฟฟ้าให้ใช้งานได้ยาวนาน ดูแลแบตเตอรี่ ชาร์จอย่างถูกวิธี",
      isPublished: true,
      publishedAt: "2024-05-10",
      authorName: "ทีมข่าว ช.เอราวัณ",
    },
    {
      title: "ช.เอราวัณ ออโต้ กรุ๊ป เปิดตัว Showroom ใหม่",
      slug: "new-showroom-opening",
      excerpt: "พบกับโชว์รูมใหม่ พื้นที่กว้างขวาง พร้อมศูนย์บริการครบวงจร เปิดให้บริการแล้ววันนี้",
      coverImageUrl: blogImages.news,
      category: "news",
      tags: ["GWM"],
      seoTitle: "ช.เอราวัณ เปิด Showroom ใหม่ | ข่าวสาร",
      seoDescription: "ช.เอราวัณ ออโต้ กรุ๊ป เปิดตัวโชว์รูมใหม่ พื้นที่กว้าง ศูนย์บริการครบครัน",
      isPublished: true,
      publishedAt: "2024-05-01",
      authorName: "ทีมข่าว ช.เอราวัณ",
    },
    {
      title: "โปรโมชั่นพิเศษ! ดาวน์ 0% ผ่อนยาว 84 เดือน",
      slug: "promotion-0-down-84-months",
      excerpt: "โปรโมชั่นสุดพิเศษ ดาวน์ 0% ผ่อนนาน 84 เดือน สำหรับรถรุ่นใหม่ทุกรุ่น จำกัดเวลา!",
      coverImageUrl: blogImages.promo,
      category: "promotion",
      tags: ["GWM", "โปรโมชั่น"],
      seoTitle: "โปรโมชั่น ดาวน์ 0% ผ่อน 84 เดือน | ช.เอราวัณ",
      seoDescription: "โปรโมชั่นพิเศษ ดาวน์ 0% ผ่อนยาว 84 เดือน สำหรับรถ GWM, HAVAL, ORA, TANK ทุกรุ่น",
      isPublished: true,
      publishedAt: "2024-04-25",
      authorName: "ทีมโปรโมชั่น",
    },
  ];

  for (const post of posts) {
    await notion.pages.create({
      parent: { database_id: DB.blog },
      properties: {
        "Title": { title: [{ text: { content: post.title } }] },
        "Slug": { rich_text: [{ text: { content: post.slug } }] },
        "Excerpt": { rich_text: [{ text: { content: post.excerpt } }] },
        "Cover Image URL": { rich_text: [{ text: { content: post.coverImageUrl } }] },
        "Category": { select: { name: post.category } },
        "Tags": { multi_select: post.tags.map((tag) => ({ name: tag })) },
        "SEO Title": { rich_text: [{ text: { content: post.seoTitle } }] },
        "SEO Description": { rich_text: [{ text: { content: post.seoDescription } }] },
        "Is Published": { checkbox: post.isPublished },
        "Published At": { date: { start: post.publishedAt } },
        "Author Name": { rich_text: [{ text: { content: post.authorName } }] },
      },
    });
    console.log(`  ✅ ${post.title}`);
  }
}

async function seedCustomerStories() {
  console.log("⭐ Seeding Customer Stories...");

  const stories = [
    {
      name: "คุณสมชาย ใจดี",
      customerName: "คุณสมชาย ใจดี",
      story: "ประทับใจมากครับ พนักงานบริการดี ให้คำแนะนำครบถ้วน ได้รถในราคาที่คุ้มค่า รถขับดีมาก ประหยัดน้ำมันจริงๆ",
      rating: 5,
      carModel: "HAVAL H6 HEV",
      imageUrl: customerImages.customer1,
      status: "approved",
      isPublic: true,
    },
    {
      name: "คุณมาลี รักรถ",
      customerName: "คุณมาลี รักรถ",
      story: "ชอบ ORA Good Cat มากค่ะ ดีไซน์น่ารัก ขับง่าย ชาร์จที่บ้านได้สะดวก ค่าไฟถูกกว่าน้ำมันเยอะเลย แนะนำเลย!",
      rating: 5,
      carModel: "ORA Good Cat",
      imageUrl: customerImages.customer2,
      status: "approved",
      isPublic: true,
    },
    {
      name: "คุณวิชัย ขับเก่ง",
      customerName: "คุณวิชัย ขับเก่ง",
      story: "TANK 300 แข็งแกร่งมากครับ ลุยป่าลุยเขาได้สบาย แถมหรูหราด้วย พนักงานบริการหลังการขายดีเยี่ยม",
      rating: 5,
      carModel: "TANK 300",
      imageUrl: customerImages.customer3,
      status: "approved",
      isPublic: true,
    },
  ];

  for (const story of stories) {
    await notion.pages.create({
      parent: { database_id: DB.stories },
      properties: {
        "Name": { title: [{ text: { content: story.name } }] },
        "Customer Name": { rich_text: [{ text: { content: story.customerName } }] },
        "Story": { rich_text: [{ text: { content: story.story } }] },
        "Rating": { number: story.rating },
        "Car Model": { rich_text: [{ text: { content: story.carModel } }] },
        "Image URL": { url: story.imageUrl },
        "Status": { select: { name: story.status } },
        "Is Public": { checkbox: story.isPublic },
      },
    });
    console.log(`  ✅ ${story.name}`);
  }
}

async function main() {
  console.log("\n🌱 Seeding Notion databases with sample data\n");

  try {
    await seedCars();
    await seedBlogPosts();
    await seedCustomerStories();

    console.log("\n🎉 All sample data created successfully!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
