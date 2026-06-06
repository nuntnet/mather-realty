# AI Content Generation

## Overview

`POST /api/ai/generate-content` handles all AI-powered content for property listings.

**Auth:** requires admin session (`requireAdmin()`)

## Actions

### `generate-field`
Generates a single field for a property, in a specified locale.

```json
{ "propertyId": "...", "action": "generate-field", "field": "title_en", "locale": "ko" }
```

Supported fields: `title_en`, `description_en`, `seo`, `highlights`, `faq`, `personas`

Auto-saves locale-specific fields directly to Notion (`highlights_ko`, `faq_json_ko`, etc.)

### `translate`
Translates EN title + description to specified locales.

```json
{ "action": "translate", "titleEn": "...", "descriptionEn": "...", "locales": ["ko","th"] }
```

### `translate-all`
Translates ALL fields (title, description, highlights, SEO, FAQ, personas) to ONE locale.

```json
{
  "action": "translate-all",
  "propertyId": "...",
  "targetLocale": "ko",
  "titleEn": "...",
  "descriptionEn": "...",
  "highlightsEn": "...",
  "seoEn": "...",
  "faqEn": [...],
  "personasEn": "..."
}
```

Saves all translations directly to Notion.

### `save`
Saves pre-approved generated content back to Notion.

```json
{ "propertyId": "...", "action": "save", "data": { "title_en": "...", ... } }
```

## Gemini model fallback

The route tries models in order on 429 quota errors:
1. `gemini-2.5-flash-lite`
2. `gemini-2.5-flash`
3. `gemini-2.0-flash-lite`
4. `gemini-2.0-flash`

Override with `GEMINI_MODEL` env var (skips fallback).

## Adding a new content type

1. Add prompt to `FIELD_PROMPTS` in the generate-field section
2. Add the field to `localeFields` array if it should auto-save per-locale
3. Add the Notion property creation in `scripts/` or directly via API
4. Update admin edit page: form type, UI section, save payload, loading parser
