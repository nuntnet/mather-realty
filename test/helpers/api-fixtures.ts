/** Valid payloads matching route zod schemas — reuse across integration tests. */

export const validCarBody = {
  name: "Mazda CX-5",
  brand: "Mazda" as const,
  model: "CX-5",
  year: 2024,
  type: "suv" as const,
  condition: "new" as const,
  priceMin: 1_290_000,
  priceMax: 1_490_000,
  engineSize: "2.0L",
  transmission: "auto" as const,
  fuelType: "petrol" as const,
  description: "A great SUV",
  specs: { horsepower: "170hp" },
  imageUrls: ["https://cdn.example/car.jpg"],
  videoUrl: "",
  isActive: true,
  isFeatured: false,
  navFeatured: false,
  navNew: false,
  slug: "mazda-cx-5-2024",
};

export const validBlogCreateBody = {
  meta: {
    title: "Top 5 SUVs",
    slug: "top-5-suvs",
    excerpt: "Best picks",
    coverImageUrl: "",
    category: "review" as const,
    tags: ["suv"],
    seoTitle: "SEO",
    seoDescription: "desc",
    authorName: "Admin",
    isPublished: false,
    publishedAt: null,
  },
  markdown: "# Hello\n\nBody text.",
};

export const validBookingBody = {
  customerName: "Somchai",
  customerPhone: "0812345678",
  customerEmail: "",
  type: "test_drive" as const,
  carModel: "CX-5",
  branch: "นครปฐม",
};

export const validContactBody = {
  name: "Somchai",
  email: "som@example.com",
  phone: "0812345678",
  message: "สนใจรถยนต์",
  branch: "นครปฐม",
};

export const validStoryBody = {
  customerName: "Somchai",
  customerEmail: "",
  customerPhone: "0812345678",
  story: "บริการดีมาก",
  rating: 5,
  carModel: "CX-5",
};

export const mockCar = { ...validCarBody, id: "car-1" };
export const mockBlogPost = { ...validBlogCreateBody.meta, id: "blog-1" };
