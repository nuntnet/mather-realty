# Design System — DoubleN Realty

## Product Context
- **What this is:** Premium rental property platform connecting expats and foreigners with landlords in Thailand
- **Who it's for:** Foreign nationals relocating to Bangkok and beyond; landlords listing quality properties
- **Space/industry:** PropTech / Expat Housing / Southeast Asia real estate
- **Project type:** Public marketing site + property search + landlord portal

## Aesthetic Direction
- **Direction:** Refined / Boutique — sophisticated without being cold; premium without being inaccessible
- **Decoration level:** Intentional — subtle teal tints as background washes; no decorative blobs or gradients
- **Mood:** The feel of a boutique concierge service: composed, trustworthy, with flashes of warmth from the orange accent
- **Palette source:** Pantone 19-4922 TCX "Teal Green" + Pantone Orange 021 U

## Color Hierarchy

### Primary — Teal Green (Pantone 19-4922 TCX)
Trust, stability, expertise. The colour of calm water and tropical foliage — perfect for a Thailand property platform.

| Token | Hex | Usage |
|---|---|---|
| teal-9 | `#1E6B69` | Primary buttons, active nav, icons, map pins |
| teal-10 | `#18605E` | Hover states |
| teal-11 | `#124E4C` | Dark text on light backgrounds |
| teal-12 | `#0C3837` | Hero gradients, footer dark sections |
| teal-3 | `#C2E8E7` | Available date highlight, light chip backgrounds |
| teal-1 | `#EEF9F9` | Page background tint, specs card bg |

### Accent — Orange 021 U (Pantone Orange 021 U)
Action, urgency, warmth. Used exclusively for high-value CTAs to create a visual hierarchy of intent.

| Token | Hex | Usage |
|---|---|---|
| orange-9 | `#F4581A` | Schedule Viewing, Discover CTA, List Property |
| orange-10 | `#D84C14` | Hover on orange CTAs |
| orange-11 | `#B43E10` | Orange text on light backgrounds |
| orange-1 | `#FEF1EC` | Light orange tint backgrounds |

### Wordmark
- "Double" → dark (`#1d211c`)
- **"N"** → orange (`#F4581A`) ← the signature mark
- " Realty" → dark

## Heading Colour System

| Level | Colour | Rationale |
|---|---|---|
| H1 | Teal `#1E6B69` | Authority, brand ownership |
| H2 | Teal `#1E6B69` | Section identity stays on-brand |
| H3 | Orange `#F4581A` | Subsection accent — draws the eye, creates hierarchy |

> On dark/image backgrounds, headings use `text-white` which overrides the base defaults.

## Typography
- **Display/Hero (Lexend):** `font-lexend` — geometric, confident, readable at large sizes. Used for H1 wordmarks, property titles.
- **Body (IBM Plex Thai + Inter):** multilingual-safe stack; IBM Plex Thai for Thai text, Inter fallback for Latin
- **UI Labels:** same as body
- **Data/Tables:** tabular-nums via `font-feature-settings`
- **Scale:** 11px (label) → 13px (small) → 14px (body sm) → 16px (body) → 18px (lg) → 24px (xl) → 32px (2xl) → 48px (3xl)

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — generous whitespace signals premium
- **Scale:** 2(2px) 4(4px) 8(8px) 12(12px) 16(16px) 24(24px) 32(32px) 40(40px) 48(48px) 64(64px)

## Layout
- **Approach:** Grid-disciplined for data/listings; editorial freedom for hero/marketing sections
- **Max content width:** 1280px (`max-w-7xl`)
- **Border radius:** sm(8px) md(12px) lg(16px) xl(20px) 2xl(24px) 3xl(32px) pill(9999px)
- **Property detail:** Full-bleed hero → sliding rounded card (`rounded-t-[2rem]`)

## Motion
- **Approach:** Intentional — animations aid comprehension, not decoration
- **Easing:** enter(ease-out) exit(ease-in) state-change(ease-in-out)
- **Duration:** micro(100ms) short(200ms) medium(300ms) long(500ms)
- **Hero carousel:** scale-100 on active, scale-105 on inactive (subtle zoom on enter)
- **Navbar:** translate-y hide/show on scroll direction (300ms)

## CTA Intent Hierarchy

| CTA | Colour | Reason |
|---|---|---|
| Schedule Viewing | Orange | Highest conversion action |
| Try Discover Mode | Orange | New feature — needs attention |
| List Your Property | Orange | Landlord acquisition — key business goal |
| Browse / Properties | Teal | Exploration, primary navigation |
| Back / Cancel | Ghost/outline | Low-stakes |
| LINE / WhatsApp | Brand colours | Cannot change — brand compliance |

## Dark Sections
Footer and hero overlays use `#0C1A1A` (deep teal-black) instead of pure black. This creates cohesion with the teal palette while retaining contrast.

## Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-06-06 | Pantone 19-4922 TCX as primary | Client direction — sophisticated alternative to eco-green |
| 2026-06-06 | Pantone Orange 021 U as CTA accent | Warm complement to teal; high visibility for conversion actions |
| 2026-06-06 | "N" in wordmark = orange | Signature mark — distinguishes from generic teal wordmark |
| 2026-06-06 | H3 = orange | Creates visual hierarchy using both brand colours |
| 2026-06-06 | Schedule Viewing = orange | Highest-value CTA gets the attention colour |
