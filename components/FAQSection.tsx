import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQSectionProps {
  faqItems: Array<{ q: string; a: string }> | null
  propertyTitle: string
}

export default function FAQSection({ faqItems, propertyTitle }: FAQSectionProps) {
  if (!faqItems || faqItems.length === 0) return null

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }

  return (
    <section className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="text-2xl font-serif font-medium text-[#1A2624] mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`faq-${index}`} className="border border-[#E2DDD7] rounded-lg px-4 last:!border-b">
            <AccordionTrigger className="text-left text-base font-medium py-4 hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
