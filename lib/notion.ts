import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type {
  Car,
  BlogPost,
  BlogPostWithContent,
  CustomerStory,
  Appointment,
} from "./notion-types";

// ─── Client (server-side only) ───────────────────────────────────────────────

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

// ─── Database IDs ─────────────────────────────────────────────────────────────

const DB = {
  cars: process.env.NOTION_CARS_DB_ID!,
  blog: process.env.NOTION_BLOG_DB_ID!,
  stories: process.env.NOTION_STORIES_DB_ID!,
  appointments: process.env.NOTION_APPOINTMENTS_DB_ID!,
  contacts: process.env.NOTION_CONTACTS_DB_ID!,
};

// ─── Property Helpers ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotionPage = any;

function propTitle(page: NotionPage, name: string): string {
  return page.properties[name]?.title?.[0]?.plain_text ?? "";
}

function propText(page: NotionPage, name: string): string {
  return page.properties[name]?.rich_text?.[0]?.plain_text ?? "";
}

function propNumber(page: NotionPage, name: string): number {
  return page.properties[name]?.number ?? 0;
}

function propSelect(page: NotionPage, name: string): string {
  return page.properties[name]?.select?.name ?? "";
}

function propMultiSelect(page: NotionPage, name: string): string[] {
  return page.properties[name]?.multi_select?.map((o: { name: string }) => o.name) ?? [];
}

function propCheckbox(page: NotionPage, name: string): boolean {
  return page.properties[name]?.checkbox ?? false;
}

function propDate(page: NotionPage, name: string): string | null {
  return page.properties[name]?.date?.start ?? null;
}

function propUrl(page: NotionPage, name: string): string | null {
  return page.properties[name]?.url ?? null;
}

function propCreatedTime(page: NotionPage): string {
  return page.created_time ?? "";
}

function propPhone(page: NotionPage, name: string): string {
  return page.properties[name]?.phone_number ?? "";
}

function propEmail(page: NotionPage, name: string): string {
  return page.properties[name]?.email ?? "";
}

/** Parse newline-separated Cloudinary URLs from a text property */
function propImageUrls(page: NotionPage, name: string): string[] {
  const raw = propText(page, name);
  if (!raw) return [];
  return raw
    .split("\n")
    .map((u: string) => u.trim())
    .filter(Boolean);
}

/** Parse JSON string from a text property, return empty object on failure */
function propJson(page: NotionPage, name: string): Record<string, string> {
  try {
    return JSON.parse(propText(page, name));
  } catch {
    return {};
  }
}

// ─── Cars ─────────────────────────────────────────────────────────────────────

function pageToCar(page: NotionPage): Car {
  return {
    id: page.id,
    name: propTitle(page, "Name"),
    brand: propSelect(page, "Brand") as Car["brand"],
    model: propText(page, "Model"),
    year: propNumber(page, "Year"),
    type: propSelect(page, "Type") as Car["type"],
    condition: propSelect(page, "Condition") as Car["condition"],
    priceMin: propNumber(page, "Price Min"),
    priceMax: propNumber(page, "Price Max"),
    engineSize: propText(page, "Engine Size"),
    transmission: propSelect(page, "Transmission") as Car["transmission"],
    fuelType: propSelect(page, "Fuel Type") as Car["fuelType"],
    description: propText(page, "Description"),
    specs: propJson(page, "Specs"),
    imageUrls: propImageUrls(page, "Image URLs"),
    videoUrl: propUrl(page, "Video URL"),
    isActive: propCheckbox(page, "Is Active"),
    isFeatured: propCheckbox(page, "Is Featured"),
    slug: propText(page, "Slug"),
  };
}

export async function getActiveCars(filters?: {
  brand?: string;
  condition?: "new" | "used";
  type?: string;
}): Promise<Car[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterConditions: any[] = [
    { property: "Is Active", checkbox: { equals: true } },
  ];

  if (filters?.brand) {
    filterConditions.push({
      property: "Brand",
      select: { equals: filters.brand },
    });
  }
  if (filters?.condition) {
    filterConditions.push({
      property: "Condition",
      select: { equals: filters.condition },
    });
  }
  if (filters?.type) {
    filterConditions.push({
      property: "Type",
      select: { equals: filters.type },
    });
  }

  const response = await notion.databases.query({
    database_id: DB.cars,
    filter: { and: filterConditions },
    sorts: [{ property: "Year", direction: "descending" }],
  });

  return response.results.map(pageToCar);
}

export async function getFeaturedCars(): Promise<Car[]> {
  const response = await notion.databases.query({
    database_id: DB.cars,
    filter: {
      and: [
        { property: "Is Active", checkbox: { equals: true } },
        { property: "Is Featured", checkbox: { equals: true } },
      ],
    },
    page_size: 6,
  });
  return response.results.map(pageToCar);
}

export async function getCarById(id: string): Promise<Car | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return pageToCar(page);
  } catch {
    return null;
  }
}

export async function getAllCarIds(): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: DB.cars,
    filter: { property: "Is Active", checkbox: { equals: true } },
  });
  return response.results.map((p) => p.id);
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

function pageToBlogPost(page: NotionPage): BlogPost {
  return {
    id: page.id,
    title: propTitle(page, "Title"),
    slug: propText(page, "Slug"),
    excerpt: propText(page, "Excerpt"),
    coverImageUrl: propText(page, "Cover Image URL") || null,
    category: propSelect(page, "Category") as BlogPost["category"],
    tags: propMultiSelect(page, "Tags"),
    seoTitle: propText(page, "SEO Title"),
    seoDescription: propText(page, "SEO Description"),
    isPublished: propCheckbox(page, "Is Published"),
    publishedAt: propDate(page, "Published At"),
    authorName: propText(page, "Author Name"),
  };
}

export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: DB.blog,
    filter: { property: "Is Published", checkbox: { equals: true } },
    sorts: [{ property: "Published At", direction: "descending" }],
    page_size: limit ?? 100,
  });
  return response.results.map(pageToBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await notion.databases.query({
    database_id: DB.blog,
    filter: {
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "Is Published", checkbox: { equals: true } },
      ],
    },
    page_size: 1,
  });
  if (!response.results.length) return null;
  return pageToBlogPost(response.results[0]);
}

export async function getBlogPostWithContent(slug: string): Promise<BlogPostWithContent | null> {
  const post = await getBlogPostBySlug(slug);
  if (!post) return null;

  const mdBlocks = await n2m.pageToMarkdown(post.id);
  const contentMarkdown = n2m.toMarkdownString(mdBlocks).parent;

  return { ...post, contentMarkdown };
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: DB.blog,
    filter: { property: "Is Published", checkbox: { equals: true } },
  });
  return response.results
    .map((p) => pageToBlogPost(p).slug)
    .filter(Boolean);
}

// ─── Customer Stories ─────────────────────────────────────────────────────────

function pageToStory(page: NotionPage): CustomerStory {
  return {
    id: page.id,
    customerName: propText(page, "Customer Name") || propTitle(page, "Name"),
    customerEmail: propEmail(page, "Email"),
    customerPhone: propPhone(page, "Phone"),
    story: propText(page, "Story"),
    rating: propNumber(page, "Rating"),
    carModel: propText(page, "Car Model"),
    imageUrl: propUrl(page, "Image URL"),
    status: propSelect(page, "Status") as CustomerStory["status"],
    isPublic: propCheckbox(page, "Is Public"),
    submittedAt: propCreatedTime(page),
  };
}

export async function getPublicStories(limit?: number): Promise<CustomerStory[]> {
  const response = await notion.databases.query({
    database_id: DB.stories,
    filter: {
      and: [
        { property: "Status", select: { equals: "approved" } },
        { property: "Is Public", checkbox: { equals: true } },
      ],
    },
    page_size: limit ?? 20,
  });
  return response.results.map(pageToStory);
}

export async function getAllStories(status?: CustomerStory["status"]): Promise<CustomerStory[]> {
  const response = await notion.databases.query({
    database_id: DB.stories,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    ...(status ? {
      filter: { property: "Status", select: { equals: status } },
    } : {}),
  });
  return response.results.map(pageToStory);
}

// ─── Appointments ─────────────────────────────────────────────────────────────

function pageToAppointment(page: NotionPage): Appointment {
  return {
    id: page.id,
    customerName: propText(page, "Customer Name") || propTitle(page, "Name"),
    type: propSelect(page, "Type") as Appointment["type"],
    status: (propSelect(page, "Status") || "pending") as Appointment["status"],
    customerPhone: propPhone(page, "Phone"),
    customerEmail: propEmail(page, "Email"),
    carModel: propText(page, "Car Model"),
    branch: propText(page, "Branch"),
    preferredDate: propDate(page, "Preferred Date"),
    preferredTime: propText(page, "Preferred Time"),
    notes: propText(page, "Notes"),
    damageDescription: propText(page, "Damage Description"),
    insuranceCompany: propText(page, "Insurance Company"),
    vehicleRegistration: propText(page, "Vehicle Registration"),
    coverageType: propText(page, "Coverage Type"),
    submittedAt: propCreatedTime(page),
  };
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const response = await notion.databases.query({
    database_id: DB.appointments,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });
  return response.results.map(pageToAppointment);
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"]
): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: {
      Status: { select: { name: status } },
    },
  });
}

export async function updateStoryStatus(
  id: string,
  status: CustomerStory["status"],
  isPublic?: boolean
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: Record<string, any> = {
    Status: { select: { name: status } },
  };
  if (isPublic !== undefined) {
    props["Is Public"] = { checkbox: isPublic };
  }
  await notion.pages.update({ page_id: id, properties: props });
}
