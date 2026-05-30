// TypeScript interfaces matching Notion database schemas
// See architecture.md for full database structure

export interface Car {
  id: string; // Notion page ID
  name: string;
  brand: "Mazda" | "Ford" | "Mitsubishi" | "GWM" | "Deepal" | "Kia";
  model: string;
  year: number;
  type: "sedan" | "suv" | "pickup" | "hatchback" | "mpv" | "ev" | "other";
  condition: "new" | "used";
  priceMin: number;
  priceMax: number;
  engineSize: string;
  transmission: "auto" | "manual";
  fuelType: "petrol" | "diesel" | "hybrid" | "electric";
  description: string;
  specs: Record<string, string>; // parsed from JSON string
  imageUrls: string[]; // Cloudinary URLs parsed from newline-separated text
  videoUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
}

export interface BlogPost {
  id: string; // Notion page ID
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null; // Cloudinary URL
  category: "review" | "tips" | "news" | "promotion" | "csr";
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  publishedAt: string | null; // ISO date string
  authorName: string;
  // content (Notion blocks) fetched separately via notion.ts getPostContent()
}

export interface BlogPostWithContent extends BlogPost {
  contentMarkdown: string; // converted from Notion blocks via notion-to-md
}

export interface CustomerStory {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  story: string;
  rating: number; // 1-5
  carModel: string;
  imageUrl: string | null;
  status: "pending" | "approved" | "rejected";
  isPublic: boolean;
  submittedAt: string; // ISO date string
}

export interface Appointment {
  id: string;
  customerName: string;
  type: "test_drive" | "service" | "body_paint" | "insurance_quote";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  customerPhone: string;
  customerEmail: string;
  carModel: string;
  branch: string;
  preferredDate: string | null;
  preferredTime: string;
  notes: string;
  damageDescription: string;
  insuranceCompany: string;
  vehicleRegistration: string;
  coverageType: string;
  submittedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  branch: string;
  submittedAt: string;
}

// ─── Admin write inputs ─────────────────────────────────────────────────────

/** Payload for creating a car (all fields). Update uses Partial of this. */
export type CarInput = Omit<Car, "id">;

/** Blog post metadata payload (content body is handled separately as markdown). */
export type BlogMetaInput = Omit<
  BlogPost,
  "id" | "isPublished" | "publishedAt"
> & {
  isPublished?: boolean;
  publishedAt?: string | null;
};

// Form submission types (what the API routes receive)
export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  type: Appointment["type"];
  carModel: string;
  branch: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  damageDescription?: string;
  insuranceCompany?: string;
  vehicleRegistration?: string;
  coverageType?: string;
}

export interface StoryFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  story: string;
  rating: number;
  carModel: string;
  imageUrl?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  branch: string;
}
