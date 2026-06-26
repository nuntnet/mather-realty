# Design System — Mather

> Source of truth for all visual, motion, and interaction decisions.
> Read this before touching any UI. Do not deviate without explicit user approval.
> Created via `/design-consultation` on 2026-06-21.

## Product Context
- **What this is:** Premium rental property platform for foreigners living in Thailand.
- **Who it's for:** Expats relocating to Bangkok, Chiang Mai, Phuket — looking for verified, trustworthy listings without a language barrier.
- **Space/industry:** Real estate / proptech. Peers: Airbnb Luxe, Hipflat, DDproperty (but those feel like databases — we don't).
- **Project type:** Multilingual marketing + listing platform (15 locales) with an internal admin.

## Aesthetic Direction
- **Direction:** Editorial / Luxury — Airbnb Luxe meets Wallpaper* Asia edition.
- **Decoration level:** Intentional — photography and typography do the work. No decorative blobs, no gradients-as-graphics.
- **Memorable feeling:** "โอ้โห สวยมาก อยากอยู่ที่นี่" — sell the dream first, the listing second.
- **Mood:** Calm, aspirational, trustworthy. Generous whitespace. Cream paper, not clinical white.

## Typography
- **Display / Hero / Section titles / Property names:** **Lora** (weights 400/500/600 + italic). Calm, warm, balanced-width serif. Chosen over Instrument Serif (too tall/narrow/condensed — read "strange") and Fraunces (too heavy/dramatic). Use **weight 500** at display sizes for presence.
- **Body / UI / Labels / Prices:** **Plus Jakarta Sans** (300–700). Warmer than Inter.
- **Thai locale:** **IBM Plex Sans Thai** (keep — pairs well; Thai headings stay sans, serif has no Thai glyphs).
- **Loading:** `next/font/google` — variables `--font-lora`, `--font-jakarta`, `--font-ibm-plex-thai`. Tailwind: `font-serif` (display = Lora), `font-sans` (body).
- **Scale (display = serif):**
  - Hero: 48–72px / line-height 1.05–1.1 / **tracking normal (0)**
  - Section H2: 32–40px / 1.15 / **tracking normal (0)**
  - Card name / H3: 17–22px / 1.35 / **tracking normal (0)**
  - Body: 15px / 1.7
  - Label/meta: 11–12px / weight 600 / uppercase / tracking 0.06–0.1em (sans only)

**Rule:** Serif is for display only. Never set body copy, buttons, or form inputs in Instrument Serif.
**Rule:** Keep `tracking-normal` (0) on Lora headings — no negative letter-spacing on the serif. Negative tracking is fine on Plus Jakarta Sans (e.g. prices).

## Color
- **Approach:** Restrained. Teal is the brand, amber adds warmth, cream replaces white. Color is rare and meaningful.

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| Teal (primary) | `#1E6B69` | `181 55% 27%` | Brand, primary buttons, links, focus ring |
| Teal dark | `#18605E` | `181 55% 23%` | Hover |
| Teal pale | `#E8F6F5` | `181 50% 94%` | Chips, tags, highlights |
| Amber (accent) | `#C9935A` | `31 51% 57%` | City labels, coming-soon, save, warm CTAs |
| Amber dark | `#B07840` | `30 47% 47%` | Amber hover |
| Cream (background) | `#F7F4EF` | `38 34% 95%` | Page background — replaces pure white |
| Surface | `#FFFFFF` | `0 0% 100%` | Cards on cream |
| Dark | `#0F1C1B` | `175 30% 8%` | Hero, nav, footer |
| Ink (text) | `#1A2624` | `181 18% 12%` | Primary text + serif headings |
| Muted | `#6B8280` | `175 10% 46%` | Secondary text |
| Faint | `#9BAEAC` | `176 12% 64%` | Tertiary, icon strokes, /mo suffix |
| Border | `#E2DDD7` | `34 16% 86%` | Hairlines on cream |

- **Semantic:** success `#1F6B1F`, warning `#E5A800`, error `#C0392B`, info = teal.
- **Retired:** the old Pantone Orange `#F4581A` as the H3 accent — replaced by amber. (Orange scale may remain for legacy status only.)
- **Dark mode:** redesign surfaces against `#0F1C1B`, reduce saturation ~15%.

## Icons
- **Library:** **Lucide** (`lucide-react`) — already a dependency, no new package.
- **Stroke width:** **1.5** (not the default 2.0). Set globally via `svg.lucide { stroke-width: 1.5 }`. Thin strokes read editorial, not utilitarian.
- **Never use emoji as functional icons** (🛏🚿📐) — reads as AI-generated.
- **Property icon map:** Bed → bedrooms · Bath → bathrooms · Maximize2 → size m² · MapPin → location · Heart → save · Share2 → share · Search → search · Check → verified · SlidersHorizontal → filters · ArrowRight → CTA links · Send → inquiry.

## Spacing
- **Base unit:** 4px.
- **Density:** Comfortable → spacious. Public sections `py-20`–`py-24`. Card grids `gap-5`/`gap-6`.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64) px.

## Layout
- **Approach:** Hybrid — creative-editorial for marketing surfaces (hero, about), grid-disciplined for listings/admin.
- **Grid:** Property grid 3 → 2 → 1 col (≥1024 / ≥640 / <640).
- **Max content width:** 1200–1280px.
- **Border radius:** sm 6px · md 10px · lg 16px · xl 20px · 2xl 28px · full 9999px. Cards use xl (20px).

## Motion
- **Approach:** Intentional. Calm and expensive — slow ease-out, never bouncy.
- **Easing:** entrances `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out) · movement `cubic-bezier(0.65, 0, 0.35, 1)` (in-out).
- **Duration:** micro 120ms (press/toggle) · short 200ms (hover/focus/save) · medium 350ms (card lift/modal) · long 500ms (image zoom/sheet) · reveal 650ms (scroll entrance, stagger 90ms).
- **Tokens (globals.css):** `--ease-out`, `--ease-move`, `--t-micro`, `--t-short`, `--t-medium`, `--t-long`, `--t-reveal`.
- **Patterns:**
  - Card: hover lift `-4px` + image `scale(1.05)`; scroll reveal fade-up `translateY(26px)→0`.
  - Save: heart `pop` keyframe (scale 1→1.35→1), fill amber.
  - Links: arrow nudges `translateX(3px)` on hover.
  - Toast: slide in from top-right, auto-dismiss ~2.6s.
- **Accessibility:** honor `prefers-reduced-motion: reduce` — collapse all durations to ~0.

## Gestures
- **Property gallery:** swipe horizontal, snap per photo, double-tap to zoom.
- **Discover feed:** swipe up/down = next/prev property; tap left/right edge = prev/next photo (already live).
- **Filters (mobile):** bottom sheet with drag handle; drag down to dismiss.

## UX States
- **Loading:** skeleton shimmer (never spinners for content).
- **Empty:** icon + serif headline + one-line guidance + clear-filters action.
- **Feedback:** toast top-right; buttons scale `0.96` on press.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-21 | Editorial/Luxury direction, Lora + Plus Jakarta Sans | Lifestyle aspiration over database feel; user picked "wow, I want to live here" |
| 2026-06-21 | Lora as display serif (final) | Instrument Serif looked too tall/narrow ("strange"); Fraunces too heavy. Lora is warm, balanced-width, calm — user picked it from a live 6-serif comparison |
| 2026-06-21 | Amber `#C9935A` replaces orange `#F4581A` as accent | Warm luxury contrast with teal; orange too loud |
| 2026-06-21 | Cream `#F7F4EF` background over pure white | Magazine-paper warmth; makes property photos vibrant |
| 2026-06-21 | Keep Lucide, set stroke 1.5 | No new dep; thin strokes read editorial; kills emoji-icon "AI" feel |
| 2026-06-21 | Card layout unchanged, refine spacing + type only | User chose refinement over a different card shape |
| 2026-06-21 | Card radius 32px → 20px, CTA pill → rounded-xl | User: card corners too round; align to 20px spec |
| 2026-06-21 | Site-wide rollout: all `blue-*`/`indigo-*` accents → teal, `#F4581A` orange → amber, dark heros slate-900 → `#0F1C1B`, logos → Lora serif + amber N | Remove off-brand blue/orange theme across about, how-it-works, contact, blog, properties, forms, components — one coherent teal/amber/cream system |
| 2026-06-21 | Fixed navbar overlap: `<main>` gets `pt-16`, full-bleed heros opt out with `-mt-16` | Fixed h-16 navbar was covering page content |
