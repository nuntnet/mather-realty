import ReactMarkdown from "react-markdown";
import { getServiceSections, getServiceSectionContent } from "@/lib/notion";
import type { ServicePageSection } from "@/lib/notion-types";

interface SectionWithContent extends ServicePageSection {
  content: string;
}

interface BrandServiceContentProps {
  brand: string;
  page: "body-repair" | "service" | "one-stop";
}

export default async function BrandServiceContent({ brand, page }: BrandServiceContentProps) {
  const sections = await getServiceSections(brand, page);
  if (!sections.length) return null;

  // Fetch content for each section in parallel
  const withContent: SectionWithContent[] = await Promise.all(
    sections.map(async (s) => ({
      ...s,
      content: await getServiceSectionContent(s.id).catch(() => ""),
    }))
  );

  const populated = withContent.filter(s => s.content.trim());
  if (!populated.length) return null;

  return (
    <div className="space-y-0">
      {populated.map((section) => (
        <section key={section.id} className="container py-12 lg:py-16">
          {section.title && (
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A]">{section.title}</h2>
            </div>
          )}
          <div className="prose prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-[#0F172A]
            prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-[#C8102E] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-md prose-img:w-full
            prose-ul:text-gray-600 prose-li:marker:text-[#C8102E]
            prose-strong:text-[#0F172A]
            prose-hr:border-gray-100">
            <ReactMarkdown>{section.content}</ReactMarkdown>
          </div>
        </section>
      ))}
    </div>
  );
}
