# Locale / i18n Guide

Mather supports **15 locales**: `en th zh-CN zh-TW ja ko ru de fr es it nl sv ar hi`

## Adding a new locale

1. Add the locale code to `i18n/routing.ts` → `locales` array
2. Create `messages/{locale}.json` — copy from `messages/en.json` and translate all values
3. If the locale is RTL (e.g. Arabic), ensure it's handled in `app/[locale]/layout.tsx`:
   ```tsx
   const dir = locale === 'ar' ? 'rtl' : 'ltr'
   <main lang={locale} dir={dir}>
   ```
4. Add locale flag/label to `components/LangSelector.tsx` → `LOCALES` array
5. Add the locale to Algolia if multilingual search is needed

## Message files structure

```
messages/
  en.json        ← source of truth
  th.json
  ko.json
  ...
```

Each file must have ALL keys present in `en.json`. Missing keys show the raw key name to users.

**Required top-level sections:**
- `nav` — navigation labels
- `home` — homepage strings
- `property` — property detail page labels (availability, rental terms, amenities, etc.)
- `search` — search/filter labels
- `blog` — blog page labels
- `submit` — property submission form
- `footer` — footer labels
- `auth` — login/logout
- `common` — generic labels (save, cancel, etc.)

## Notion per-locale fields

Property content is stored per-locale in Notion:

| Content | Notion fields |
|---------|--------------|
| Title | `title_en`, `title_th`, `title_ko`, ... (15 fields) |
| Description | `description_en`, `description_th`, ... (15 fields) |
| Highlights | `highlights` (EN), `highlights_th`, `highlights_ko`, ... |
| SEO description | `seo_description` (EN), `seo_description_th`, ... |
| FAQ | `faq_json` (EN), `faq_json_th`, ... |
| Persona descriptions | `persona_descriptions` (EN), `persona_descriptions_th`, ... |

## Testing locale switching

1. Visit `/ko/properties` — verify Korean titles, labels, descriptions
2. Check date formatting: availability dates should use the local format
3. Check RTL: `/ar/properties` should have `dir="rtl"` on `<main>`
4. Check missing keys: if a label shows raw like `property.highlights_title`, a translation key is missing
