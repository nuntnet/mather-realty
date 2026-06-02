import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const LOCALES = [
  "en", "th", "zh-CN", "zh-TW", "ja", "ko",
  "ru", "de", "fr", "es", "it", "nl", "sv", "ar", "hi",
] as const;

const propertyDataSchema = z.object({
  title: z.string().min(1).max(500),
  address: z.string().max(500).optional(),
  city: z.string().max(200).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  sizeSqm: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional().default([]),
  priceTHB: z.number().min(0).optional(),
});

const schema = z.object({
  propertyData: propertyDataSchema,
});

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { propertyData } = schema.parse(body);

    const amenitiesStr =
      propertyData.amenities.length > 0
        ? propertyData.amenities.join(", ")
        : "Not specified";

    const prompt = `You are a professional real estate copywriter specialising in luxury rental properties in Thailand for international tenants.

Generate a compelling, authentic rental property listing description for this property:
- Title: ${propertyData.title}
- Address: ${propertyData.address ?? "Thailand"}
- City: ${propertyData.city ?? "Thailand"}
- Bedrooms: ${propertyData.bedrooms ?? "N/A"}
- Bathrooms: ${propertyData.bathrooms ?? "N/A"}
- Size: ${propertyData.sizeSqm ?? "N/A"} sqm
- Amenities: ${amenitiesStr}
- Monthly rent: ${propertyData.priceTHB ? `${propertyData.priceTHB.toLocaleString()} THB` : "Contact for price"}

Write 2–3 short paragraphs (100–180 words total) for each of these locale codes:
${LOCALES.join(", ")}

Rules:
- Write natively in each language (not translated from English)
- Be warm, inviting and highlight lifestyle benefits
- Do not fabricate specific facts not provided above
- Return ONLY a valid JSON object where keys are the locale codes above and values are the description strings
- No markdown, no code fences, no extra keys`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 6000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json(
        { error: "OpenAI request failed" },
        { status: 502 }
      );
    }

    const completion = (await response.json()) as {
      choices: { message: { content: string } }[];
    };

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Empty response from OpenAI" },
        { status: 502 }
      );
    }

    const descriptions: Record<string, string> = JSON.parse(content);

    // Validate that we have at least the English description
    if (!descriptions["en"]) {
      return NextResponse.json(
        { error: "Missing required locale in AI response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ descriptions }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 502 }
      );
    }
    console.error("POST /api/ai/description error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
