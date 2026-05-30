import { cache } from "react";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { markdownToBlocks as martianMarkdownToBlocks } from "@tryfabric/martian";
import type {
  Car,
  CarInput,
  BlogPost,
  BlogPostWithContent,
  BlogMetaInput,
  CustomerStory,
  Appointment,
  ContactSubmission,
} from "./notion-types";

// ─── Rate-limit aware fetch (429 + transient 5xx retry w/ backoff) ────────────

const MAX_RETRIES = 4;

/** Backoff: honor Retry-After header if present, else exponential + jitter (capped 8s). */
function backoffDelayMs(attempt: number, retryAfterHeader: string | null): number {
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : NaN;
  if (!Number.isNaN(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 15000);
  return Math.min(500 * 2 ** attempt, 8000) + Math.floor(Math.random() * 250);
}

/**
 * Drop-in fetch for the Notion client that retries on 429 (rate limit) and,
 * for idempotent GET reads, on transient 5xx. Non-GET writes are NOT retried on
 * 5xx to avoid duplicate page creation. 429s are always safe to retry (rejected
 * before processing).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const notionFetchWithRetry = async (url: any, init?: any): Promise<Response> => {
  const method = (init?.method ?? "GET").toUpperCase();
  for (let attempt = 0; ; attempt++) {
    const res: Response = await fetch(url, init);
    const isRateLimited = res.status === 429;
    const isServerError = res.status >= 500;
    const retryable = isRateLimited || (isServerError && method === "GET");

    if (!retryable || attempt >= MAX_RETRIES) return res;

    const delay = backoffDelayMs(attempt, res.headers.get("retry-after"));
    console.warn(
      `[notion] ${res.status} — retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
    );
    await new Promise((r) => setTimeout(r, delay));
  }
};

// ─── Client (server-side only) ───────────────────────────────────────────────

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: notionFetchWithRetry as any,
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

export const getCarById = cache(async (id: string): Promise<Car | null> => {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return pageToCar(page);
  } catch {
    return null;
  }
});

/** True if `value` looks like a Notion page UUID (32 hex chars, with or without dashes). */
function looksLikeNotionId(value: string): boolean {
  return /^[0-9a-f]{32}$/i.test(value.replace(/-/g, ""));
}

/**
 * Fetch a car by its human-readable Slug. Falls back to `getCarById` when no
 * slug match is found AND the passed string looks like a Notion UUID — keeps
 * old `/cars/<uuid>` links working and covers cars with an empty Slug.
 */
export const getCarBySlug = cache(async (slug: string): Promise<Car | null> => {
  const response = await notion.databases.query({
    database_id: DB.cars,
    filter: { property: "Slug", rich_text: { equals: slug } },
    page_size: 1,
  });
  if (response.results.length) return pageToCar(response.results[0]);
  if (looksLikeNotionId(slug)) return getCarById(slug);
  return null;
});

export async function getAllCarIds(): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: DB.cars,
    filter: { property: "Is Active", checkbox: { equals: true } },
  });
  return response.results.map((p) => p.id);
}

/** Slugs of all active cars (empty slugs filtered out). */
export async function getAllCarSlugs(): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: DB.cars,
    filter: { property: "Is Active", checkbox: { equals: true } },
  });
  return response.results.map(pageToCar).map((c) => c.slug).filter(Boolean);
}

/**
 * Bounded set of slugs to prerender at build time: the most recent active cars
 * by Year (descending). Keeps build time flat as the catalog grows; the rest
 * render on-demand thanks to `dynamicParams = true`.
 */
export async function getCarSlugsForPrerender(limit = 40): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: DB.cars,
    filter: { property: "Is Active", checkbox: { equals: true } },
    sorts: [{ property: "Year", direction: "descending" }],
    page_size: limit,
  });
  return response.results.map(pageToCar).map((c) => c.slug).filter(Boolean);
}

// ─── Cars (admin write) ─────────────────────────────────────────────────────

/** Admin list: every car including inactive/archived. */
export async function getAllCarsAdmin(): Promise<Car[]> {
  const response = await notion.databases.query({
    database_id: DB.cars,
    sorts: [{ property: "Year", direction: "descending" }],
    page_size: 100,
  });
  return response.results.map(pageToCar);
}

/** Map a (partial) Car into Notion property payload. Only included keys are written. */
function carToProperties(data: Partial<CarInput>): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (data.name !== undefined) p["Name"] = { title: [{ text: { content: data.name } }] };
  if (data.brand !== undefined) p["Brand"] = { select: { name: data.brand } };
  if (data.model !== undefined) p["Model"] = { rich_text: [{ text: { content: data.model } }] };
  if (data.year !== undefined) p["Year"] = { number: data.year };
  if (data.type !== undefined) p["Type"] = { select: { name: data.type } };
  if (data.condition !== undefined) p["Condition"] = { select: { name: data.condition } };
  if (data.priceMin !== undefined) p["Price Min"] = { number: data.priceMin };
  if (data.priceMax !== undefined) p["Price Max"] = { number: data.priceMax };
  if (data.engineSize !== undefined) p["Engine Size"] = { rich_text: [{ text: { content: data.engineSize } }] };
  if (data.transmission !== undefined) p["Transmission"] = { select: { name: data.transmission } };
  if (data.fuelType !== undefined) p["Fuel Type"] = { select: { name: data.fuelType } };
  if (data.description !== undefined) p["Description"] = { rich_text: [{ text: { content: data.description } }] };
  if (data.specs !== undefined) p["Specs"] = { rich_text: [{ text: { content: JSON.stringify(data.specs) } }] };
  if (data.imageUrls !== undefined) p["Image URLs"] = { rich_text: [{ text: { content: data.imageUrls.join("\n") } }] };
  if (data.videoUrl !== undefined) p["Video URL"] = { url: data.videoUrl || null };
  if (data.isActive !== undefined) p["Is Active"] = { checkbox: data.isActive };
  if (data.isFeatured !== undefined) p["Is Featured"] = { checkbox: data.isFeatured };
  if (data.slug !== undefined) p["Slug"] = { rich_text: [{ text: { content: data.slug } }] };
  return p;
}

export async function createCar(data: CarInput): Promise<Car> {
  const page = await notion.pages.create({
    parent: { database_id: DB.cars },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: carToProperties(data) as any,
  });
  return pageToCar(page);
}

export async function updateCar(id: string, data: Partial<CarInput>): Promise<Car> {
  const page = await notion.pages.update({
    page_id: id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: carToProperties(data) as any,
  });
  return pageToCar(page);
}

/** Toggle featured / active flags. */
export async function setCarFlags(
  id: string,
  flags: { isActive?: boolean; isFeatured?: boolean }
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: Record<string, any> = {};
  if (flags.isActive !== undefined) props["Is Active"] = { checkbox: flags.isActive };
  if (flags.isFeatured !== undefined) props["Is Featured"] = { checkbox: flags.isFeatured };
  await notion.pages.update({ page_id: id, properties: props });
}

/** Soft delete: set Is Active = false. */
export async function archiveCar(id: string): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: { "Is Active": { checkbox: false } },
  });
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

export const getBlogPostWithContent = cache(
  async (slug: string): Promise<BlogPostWithContent | null> => {
    const post = await getBlogPostBySlug(slug);
    if (!post) return null;

    const mdBlocks = await n2m.pageToMarkdown(post.id);
    const contentMarkdown = n2m.toMarkdownString(mdBlocks).parent;

    return { ...post, contentMarkdown };
  }
);

export async function getAllBlogSlugs(): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: DB.blog,
    filter: { property: "Is Published", checkbox: { equals: true } },
  });
  return response.results
    .map((p) => pageToBlogPost(p).slug)
    .filter(Boolean);
}

// ─── Blog (admin write) ─────────────────────────────────────────────────────

/** Convert markdown text into Notion block objects via martian. */
export function markdownToBlocks(markdown: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return martianMarkdownToBlocks(markdown ?? "") as any[];
}

/** Admin list: every blog post including drafts. */
export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: DB.blog,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: 100,
  });
  return response.results.map(pageToBlogPost);
}

/** Load a post's meta + content (as markdown) for the editor. */
export async function getBlogPostForEdit(
  id: string
): Promise<BlogPostWithContent | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const meta = pageToBlogPost(page);
    const mdBlocks = await n2m.pageToMarkdown(id);
    const contentMarkdown = n2m.toMarkdownString(mdBlocks).parent ?? "";
    return { ...meta, contentMarkdown };
  } catch (err) {
    console.error("getBlogPostForEdit error:", err);
    return null;
  }
}

function blogMetaToProperties(meta: Partial<BlogMetaInput>): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (meta.title !== undefined) p["Title"] = { title: [{ text: { content: meta.title } }] };
  if (meta.slug !== undefined) p["Slug"] = { rich_text: [{ text: { content: meta.slug } }] };
  if (meta.excerpt !== undefined) p["Excerpt"] = { rich_text: [{ text: { content: meta.excerpt } }] };
  if (meta.coverImageUrl !== undefined)
    p["Cover Image URL"] = { rich_text: meta.coverImageUrl ? [{ text: { content: meta.coverImageUrl } }] : [] };
  if (meta.category !== undefined) p["Category"] = { select: { name: meta.category } };
  if (meta.tags !== undefined) p["Tags"] = { multi_select: meta.tags.map((name) => ({ name })) };
  if (meta.seoTitle !== undefined) p["SEO Title"] = { rich_text: [{ text: { content: meta.seoTitle } }] };
  if (meta.seoDescription !== undefined) p["SEO Description"] = { rich_text: [{ text: { content: meta.seoDescription } }] };
  if (meta.authorName !== undefined) p["Author Name"] = { rich_text: [{ text: { content: meta.authorName } }] };
  if (meta.isPublished !== undefined) p["Is Published"] = { checkbox: meta.isPublished };
  if (meta.publishedAt !== undefined)
    p["Published At"] = { date: meta.publishedAt ? { start: meta.publishedAt } : null };
  return p;
}

/** Append markdown content as blocks (chunked to Notion's 100-block limit). */
async function appendMarkdownBlocks(pageId: string, markdown: string) {
  const blocks = markdownToBlocks(markdown);
  for (let i = 0; i < blocks.length; i += 100) {
    await notion.blocks.children.append({
      block_id: pageId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: blocks.slice(i, i + 100) as any,
    });
  }
}

/** Remove all existing child blocks of a page. */
async function clearPageBlocks(pageId: string) {
  const children = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  for (const block of children.results) {
    await notion.blocks.delete({ block_id: block.id });
  }
}

export async function createBlogPost(
  meta: BlogMetaInput,
  markdown: string
): Promise<BlogPost> {
  const blocks = markdownToBlocks(markdown);
  const page = await notion.pages.create({
    parent: { database_id: DB.blog },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: blogMetaToProperties(meta) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: blocks.slice(0, 100) as any,
  });
  // Append any overflow beyond the first 100 blocks
  if (blocks.length > 100) {
    for (let i = 100; i < blocks.length; i += 100) {
      await notion.blocks.children.append({
        block_id: page.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: blocks.slice(i, i + 100) as any,
      });
    }
  }
  return pageToBlogPost(page);
}

export async function updateBlogPost(
  id: string,
  meta: Partial<BlogMetaInput>,
  markdown?: string
): Promise<BlogPost> {
  const page = await notion.pages.update({
    page_id: id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: blogMetaToProperties(meta) as any,
  });
  if (markdown !== undefined) {
    await clearPageBlocks(id);
    await appendMarkdownBlocks(id, markdown);
  }
  return pageToBlogPost(page);
}

/** Toggle publish state, stamping Published At when publishing. */
export async function setBlogPublished(id: string, isPublished: boolean): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: Record<string, any> = {
    "Is Published": { checkbox: isPublished },
  };
  if (isPublished) {
    props["Published At"] = { date: { start: new Date().toISOString() } };
  }
  await notion.pages.update({ page_id: id, properties: props });
}

/** Soft delete: move the Notion page to trash. */
export async function archiveBlogPost(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

// ─── Contacts ───────────────────────────────────────────────────────────────

function pageToContact(page: NotionPage): ContactSubmission {
  return {
    id: page.id,
    name: propTitle(page, "Name"),
    email: propEmail(page, "Email"),
    phone: propPhone(page, "Phone"),
    message: propText(page, "Message"),
    branch: propText(page, "Branch"),
    submittedAt: propDate(page, "Submitted At") ?? propCreatedTime(page),
  };
}

export async function getAllContacts(): Promise<ContactSubmission[]> {
  const response = await notion.databases.query({
    database_id: DB.contacts,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: 100,
  });
  return response.results.map(pageToContact);
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
