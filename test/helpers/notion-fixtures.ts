/**
 * Helpers that build fake Notion API "page" objects of the shape the property
 * mappers in `lib/notion.ts` expect (`page.properties[name]?.<type>...`).
 *
 * These let us feed deterministic input to `pageToCar` / `pageToBlogPost` / etc.
 * via the exported functions that call them (e.g. `createCar` returns
 * `pageToCar(page)`).
 */

type Prop = Record<string, unknown>;

export const title = (text: string): Prop => ({
  title: text ? [{ plain_text: text, type: "text", text: { content: text } }] : [],
});

export const richText = (text: string): Prop => ({
  rich_text: text ? [{ plain_text: text, type: "text", text: { content: text } }] : [],
});

export const number = (n: number): Prop => ({ number: n });
export const select = (name: string): Prop => (name ? { select: { name } } : { select: null });
export const multiSelect = (names: string[]): Prop => ({
  multi_select: names.map((name) => ({ name })),
});
export const checkbox = (value: boolean): Prop => ({ checkbox: value });
export const date = (start: string | null): Prop => ({ date: start ? { start } : null });
export const url = (value: string | null): Prop => ({ url: value });
export const email = (value: string): Prop => ({ email: value });
export const phone = (value: string): Prop => ({ phone_number: value });

export interface FakePage {
  id: string;
  created_time?: string;
  properties: Record<string, Prop>;
}

export function makePage(properties: Record<string, Prop>, opts?: {
  id?: string;
  created_time?: string;
}): FakePage {
  return {
    id: opts?.id ?? "page-id-123",
    created_time: opts?.created_time ?? "2024-01-01T00:00:00.000Z",
    properties,
  };
}

/** A fully-populated Notion "Car" page. */
export function makeCarPage(overrides?: Partial<Record<string, Prop>>): FakePage {
  return makePage({
    Name: title("Mazda CX-5 2024"),
    Brand: select("Mazda"),
    Model: richText("CX-5"),
    Year: number(2024),
    Type: select("suv"),
    Condition: select("new"),
    "Price Min": number(1290000),
    "Price Max": number(1490000),
    "Engine Size": richText("2.0L"),
    Transmission: select("auto"),
    "Fuel Type": select("petrol"),
    Description: richText("A great SUV"),
    Specs: richText(JSON.stringify({ horsepower: "170hp", seats: "5" })),
    "Image URLs": richText("https://cdn/img1.jpg\nhttps://cdn/img2.jpg"),
    "Video URL": url("https://youtube.com/watch?v=abc"),
    "Is Active": checkbox(true),
    "Is Featured": checkbox(false),
    Slug: richText("mazda-cx-5-2024"),
    ...overrides,
  }, { id: "car-1" });
}

/** A fully-populated Notion "Blog" page. */
export function makeBlogPage(overrides?: Partial<Record<string, Prop>>): FakePage {
  return makePage({
    Title: title("Top 5 SUVs"),
    Slug: richText("top-5-suvs"),
    Excerpt: richText("The best SUVs of the year"),
    "Cover Image URL": richText("https://cdn/cover.jpg"),
    Category: select("review"),
    Tags: multiSelect(["mazda", "review"]),
    "SEO Title": richText("Top 5 SUVs SEO"),
    "SEO Description": richText("seo desc"),
    "Is Published": checkbox(true),
    "Published At": date("2024-02-02"),
    "Author Name": richText("Somchai"),
    ...overrides,
  }, { id: "blog-1" });
}
