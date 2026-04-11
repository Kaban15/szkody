# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static lead-generation website for a Polish compensation claims firm (branża odszkodowawcza). Polish language throughout. No build step, no framework — plain HTML/CSS/JS served as static files.

## Deployment

Hosted on **Vercel** at https://szkody.vercel.app/. Repo: `Kaban15/szkody` on GitHub, branch `master`.

```bash
# Deploy to production
git push origin master        # Vercel auto-deploys from master
npx vercel --prod --yes       # or manual deploy via CLI
```

## Running Locally

```bash
python3 -m http.server 1111
# Open http://localhost:1111
```

```bash
npm test                      # run vitest unit tests
npm run test:watch            # run vitest in watch mode
```

## Architecture

### Tech Stack
- **Tailwind CSS via CDN** (`cdn.tailwindcss.com`) with shared config in `js/tailwind-config.js` (loaded via script tag in all pages)
- **Vanilla JS** (no framework, no bundler, no modules — plain `<script>` tags)
- **Lucide Icons** via CDN (`unpkg.com/lucide@0.460.0`) — pinned version, call `lucide.createIcons()` after DOM load
- **Google Fonts**: Plus Jakarta Sans (headings + body, weights 400–800)
- **Lenis Smooth Scroll** via CDN (`unpkg.com/lenis@1.1.18`) — only loaded on `index.html`, guarded in `animations.js` with `typeof Lenis !== 'undefined'`

### Color Palette (defined in `js/tailwind-config.js` — single source of truth)
- `bg` (#FDFBF7) — warm cream page background
- `surface` (#F5F0E8) — alternate section backgrounds
- `surface-light` (#FFFFFF) — cards, inputs, elevated elements
- `gold` (#D4AF37), `gold-light` (#E8C867) — accent, trust elements, secondary buttons
- `cta` (#E8652D), `cta-hover` (#D4561F) — primary call-to-action buttons (orange)
- `text` (#1A1008) — dark brown body text
- `muted` (#8A7D6F) — secondary text (warm gray)
- `line` (#EDE7DA) — borders and dividers
- `error` (#EF4444) — form validation errors

### Page Structure
- **`index.html`** — one-page main site containing: ticker, hero, trust bar, quiz, icon divider, "jak działamy" process, social proof + case studies (with timeline & quotes), icon divider, testimonials carousel, "dlaczego my", team/experts, insurance logos bar, FAQ accordion, CTA footer, floating WhatsApp/phone buttons. Loads Lenis smooth scroll CDN.
- **`uslugi.html`** — services overview page
- **`sukcesy.html`** — case studies / success stories
- **`opinie.html`** — client testimonials
- **5 service subpages** (`odszkodowania-*.html`) — each follows same template: nav, breadcrumb, hero, content, mini case study, FAQ, CTA, footer
- **Blog**: `blog/index.html` (listing with category filter), `blog/_szablon-artykul.html` (article template, not published), `blog/_szablon-case-study.html` (case study template, not published)
- **Utility pages**: `kalkulator.html`, `kontakt.html`, `jak-dzialamy.html`, `404.html`, `polityka-prywatnosci.html`, `robots.txt`, `sitemap.xml`

### Images (`images/`)
9 PNG zdjęć (generowane Gemini) zastępujących placeholdery FOTO na wszystkich stronach. Wdrożone 2026-04-11.

| Plik | Treść | Użyte na |
|------|-------|----------|
| `Gemini_Generated_Image_9moolc9moolc9moo.png` | Dwoje przy dokumentach w biurze | `index.html` hero bg, `jak-dzialamy.html`, `odszkodowania-wypadki-rolnicze.html` (sekcja 2) |
| `Gemini_Generated_Image_5g2h8z5g2h8z5g2h.png` | Prawnik + klientka przy biurku | `index.html` "Jak działamy", `uslugi.html` |
| `Gemini_Generated_Image_mcyjr7mcyjr7mcyj.png` | Wypadek samochodowy | `odszkodowania-komunikacyjne.html` |
| `Gemini_Generated_Image_q44jvkq44jvkq44j.png` | Robotnik budowlany | `odszkodowania-wypadki-przy-pracy.html` |
| `Gemini_Generated_Image_rvhv0frvhv0frvhv.png` | Przegląd dokumentacji | `odszkodowania-bledy-medyczne.html` |
| `Gemini_Generated_Image_v6j33av6j33av6j3.png` | Ciepłe wsparcie przy stole | `odszkodowania-smierc-bliskiej-osoby.html` hero, `sukcesy.html` |
| `Gemini_Generated_Image_nnl0c7nnl0c7nnl0.png` | Kobieta z telefonem | `odszkodowania-smierc-bliskiej-osoby.html` sekcja 2, `opinie.html` |
| `Gemini_Generated_Image_ivbp9wivbp9wivbp.png` | Biuro, dokumenty na biurku | `odszkodowania-smierc-bliskiej-osoby.html` sekcja 3, `kalkulator.html` |
| `Gemini_Generated_Image_ib7zhnib7zhnib7z.png` | Rolnik w polu zbóż | `odszkodowania-wypadki-rolnicze.html` hero |

**Implementacja hero (`index.html`):** `background-image` inline style na `.v2-scroll-expand`.
**Implementacja pozostałe:** `<img class="w-full h-full object-cover">` w kontenerze `rounded-xl aspect-[4/3] overflow-hidden`.

### Internacjonalizacja (i18n)

Obsługiwane języki: **PL** (domyślny), **EN**, **UA**.

- **`js/i18n.js`** — ładuje `/lang/{lang}.json` przez XHR, podmienia `innerHTML` elementów z `data-i18n="key"`, `placeholder` z `data-i18n-placeholder="key"`, `aria-label` z `data-i18n-aria="key"`. Wybór języka zapisywany w `localStorage('lang')`.
- **`lang/en.json`** / **`lang/ua.json`** — pliki tłumaczeń. PL jest domyślny (hardcode w HTML).
- **`lang-switcher-mount`** — div w nav (desktop + mobile) — `i18n.js` wstrzykuje tam flagi PL/EN/UA.

#### Przestrzenie nazw kluczy tłumaczeń

| Prefix | Strona |
|--------|--------|
| `nav.*`, `sticky.*`, `footer.*`, `cookie.*` | Współdzielone — wszystkie strony |
| `hero.*`, `trust.*`, `quiz.*`, `cards.*`, `steps.*`, `contact.*`, `faq.*`, `cta.*` | `index.html` |
| `kom.*` | `odszkodowania-komunikacyjne.html` |
| `praca.*` | `odszkodowania-wypadki-przy-pracy.html` |
| `med.*` | `odszkodowania-bledy-medyczne.html` |
| `smierc.*` | `odszkodowania-smierc-bliskiej-osoby.html` |
| `rol.*` | `odszkodowania-wypadki-rolnicze.html` |

**Zasada:** każdy element z polskim tekstem musi mieć `data-i18n`. Przy dodawaniu nowej treści dodaj od razu klucz do `lang/en.json` i `lang/ua.json`.

### JavaScript Files (all in `js/`)
Scripts must load in dependency order. `form-validation.js` must load before any file that calls `window.formValidation`. `cookie-consent.js` must load before `analytics.js`.

| File | Exports/Globals | Purpose |
|------|----------------|---------|
| `form-validation.js` | `window.formValidation` | Phone/email/name validators, inline error show/hide, `submitForm()` handler, `attachLiveValidation()` for blur/input events |
| `quiz.js` | — | 5-step diagnostic quiz (selection, navigation, submission, business hours) |
| `calculator.js` | — | Compensation calculator (injury data in Map, cached DOM, live result) |
| `animations.js` | — | Lenis smooth scroll init (guarded), parallax on scroll, IntersectionObserver: count-up numbers, scroll reveal, clip-path reveals, case study filter, comparison bars, staggered reveal |
| `navigation.js` | — | Mobile hamburger menu, sticky bottom bar hide, testimonial carousel scroll, scroll-to-top button |
| `cookie-consent.js` | — | Cookie banner, localStorage consent, dynamic GA4 script injection |
| `analytics.js` | `window.trackEvent` | GA4 event wrapper, phone click tracking, FAQ accordion, contact form |

### CSS (`css/styles.css`)
Custom animations and transitions beyond Tailwind utilities:
- **`.word-reveal`** — hero word-by-word fade-in
- **`.fade-in`** — scroll-triggered opacity reveal (IntersectionObserver)
- **`.fade-in-up`** — scroll-triggered opacity + translateY(40px) + scale(0.97) reveal with spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`), used with `data-stagger` for cascading delays
- **`.comparison-bar`** — animated width bar for case study before/after comparisons (`.comparison-bars` container triggers observer)
- **`.count-up`** — counter animation (separate observer from fade-in)
- **`.card-hover`** — gold glow on hover
- **`.animate-ticker`** — infinite horizontal scroll for top success ticker
- **`.testimonial-track` / `.testimonial-card`** — scroll-snap for carousel
- **`.pulse-ring`** — pulsing ring on floating WhatsApp button
- **`#scroll-to-top`** — fade-in/out scroll-to-top button (created dynamically by `navigation.js`, appears after 400px scroll)
- **`.reveal-clip`** — clip-path inset reveal from left (`inset(0 100% 0 0)` → `inset(0 0 0 0)`), used on hero checkmarks
- **`[data-parallax]`** — scroll-driven translateY parallax via Lenis `onScroll`, factor set per element (hero 0.3, process icons 0.1, team avatars 0.15, CTA 0.2). Mobile: factor halved. Disabled on `prefers-reduced-motion`.
- **`.faq-answer`** — max-height accordion transition

### Shared Elements Across Subpages
Every subpage duplicates: nav (with `#mobile-menu`), footer (4-column), sticky bottom bar, cookie consent banner, and Tailwind config in `<head>`. When modifying shared elements, update ALL HTML files.

### Key Design Patterns
- **Light warm-cream theme**: cream backgrounds (#FDFBF7) with gold accents and orange CTAs — warm, professional, modern
- **Trust bar**: social proof strip between hero and quiz (Google rating, badge, stats)
- **Ticker**: auto-scrolling marquee at top with recent successes (content duplicated for seamless CSS loop — update both copies when changing text)
- **Testimonial carousel**: horizontal scroll with snap, navigation via prev/next buttons in `navigation.js`
- **FAQ accordion**: `aria-controls` + `role="region"` for accessibility, toggle logic in `analytics.js`
- **Floating contact buttons**: WhatsApp + phone, desktop only (mobile uses sticky bottom bar)
- **Live form validation**: `attachLiveValidation()` adds blur (validate + show error/success border) and input (clear error on correction) events. Green border (`border-green-500`) on valid fields. Applied to quiz, contact, and calculator forms.
- **Quiz/Calculator forms**: simulated submission via shared `window.formValidation.submitForm()` with `<template>` elements for success messages — backend integration placeholder. Replace the `setTimeout` blocks with real fetch calls.
- **Comparison bars**: animated width bars in case study cards showing insurer offer vs final result. Container `.comparison-bars` triggers IntersectionObserver, bars grow from 0 to `data-width`.
- **Staggered scroll reveal**: containers with `data-stagger="150"` attribute animate `.fade-in-up` children with cascading delay. Applied to "dlaczego my", team experts, FAQ items.
- **Business hours logic** in `quiz.js`: constants in `BUSINESS_HOURS` (Mon-Fri 8-18, Sat 9-14) — affects "oddzwonimy w 30 minut" vs "następny dzień roboczy" messaging.
- **Calculator algorithm**: injury base amounts stored in a `Map` at click time (not re-queried from DOM). Multipliers defined in `CALC_CONSTANTS` at top of file. Result shown as RANGE_LOW–RANGE_HIGH range.
- **Cookie consent gates GA4**: analytics scripts only load after user accepts cookies via localStorage check. `cookie-consent.js` guards against missing `#cookie-banner` element.
- **Delegated event handling**: `navigation.js` uses delegated click on mobile menu; `analytics.js` uses delegated click with early-exit for phone/sticky/case tracking.
- **DOM caching**: `calculator.js` caches all label/result elements at init — `recalculate()` runs on every slider input event and must avoid DOM queries in the hot path.

## Blog System

### Structure
- **Templates** (not published, `_` prefix): `blog/_szablon-artykul.html`, `blog/_szablon-case-study.html`
- **20 articles** in `blog/` — 17 guides/law + 3 case studies
- **Listing page**: `blog/index.html` with JS category filter (Wszystko/Poradniki/Prawo/Case studies/KRUS)
- **SEO files**: `robots.txt`, `sitemap.xml` (manually updated when adding articles)
- **Publication plan**: `docs/blog-publication-plan.md` — tracks which articles are published and when

### Blog Script Load Order (no form-validation or quiz needed)
```
cookie-consent.js → i18n.js → animations.js → analytics.js → navigation.js
```
Note: `analytics.js` calls `window.formValidation` only inside `if (contactForm)` guard — blog pages have no `#contact-form`, so this code path is never reached. Safe without `form-validation.js`.

### Adding a New Blog Article
1. Copy `blog/_szablon-artykul.html` (or `_szablon-case-study.html`)
2. Replace all `{placeholders}` with real content
3. Add entry to `sitemap.xml`
4. Add card to `blog/index.html` (with `data-category` attribute)
5. Update `docs/blog-publication-plan.md`
6. Commit — do NOT push without user approval

### SEO Per Article
- Schema.org: Article + BreadcrumbList + FAQPage (guides) or Article + BreadcrumbList (case studies)
- Each article links to its pillar page (service subpage) in-text
- "Powiązane artykuły" section at bottom links to 2-3 related articles
- Content strategy spec: `docs/superpowers/specs/2026-04-07-content-seo-strategy-design.md`

## Specs and Plans

- Design spec: `docs/superpowers/specs/2026-04-02-strona-odszkodowania-design.md`
- Implementation plan: `docs/superpowers/plans/2026-04-02-strona-odszkodowania-plan.md`
- Blog system spec: `docs/superpowers/specs/2026-04-07-blog-system-seo-design.md`
- Blog implementation plan: `docs/superpowers/plans/2026-04-07-blog-system-seo-plan.md`
- Content SEO strategy: `docs/superpowers/specs/2026-04-07-content-seo-strategy-design.md`
- Blog publication plan: `docs/blog-publication-plan.md`
- Animations spec: `docs/superpowers/specs/2026-04-09-aramco-animations-design.md`
- Animations plan: `docs/superpowers/plans/2026-04-09-aramco-animations-plan.md`

## Script Load Order (critical)

Correct order on pages that use all scripts:
```
form-validation.js → cookie-consent.js → animations.js → analytics.js → navigation.js → quiz.js → calculator.js
```
- `form-validation.js` MUST be first — exports `window.formValidation` used by quiz, calculator, and analytics
- `cookie-consent.js` MUST be before `analytics.js` — gates GA4 loading
- `analytics.js` contains FAQ accordion toggle and contact form handler (not just tracking)
- `navigation.js` contains testimonial carousel logic (needs DOM ready)

## Security

- **Security headers** configured in `vercel.json`: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **CDN versions pinned**: Lucide at `0.460.0`, Lenis at `1.1.18` (never use `@latest` in production)
- **No innerHTML with user input**: form success messages use `<template>` elements cloned via DOM API. i18n uses innerHTML intentionally for first-party static JSON translations (documented in code).
- **All JS files use `'use strict'`**
- **`node_modules/` in `.gitignore`** — never commit dependencies

## Testing

Unit tests with **vitest** + **jsdom** (`npm test`):
- `tests/form-validation.test.js` — validateName, validatePhone, validateEmail (12 tests)
- `tests/calculator.test.js` — multiplier logic, range calculation, rounding (9 tests)
- `tests/business-hours.test.js` — isBusinessHours weekday/Saturday/Sunday (5 tests)

When modifying calculator multipliers or validation logic, update corresponding tests.

## Placeholders to Replace
- Phone: `+48XXXXXXXXX` and `+48 XXX XXX XXX`
- WhatsApp link: `48XXXXXXXXX` in `wa.me` URL
- Email: `kontakt@example.pl`
- GA4 ID: `G-XXXXXXXXXX` in `cookie-consent.js`
- Google Maps embed URL in contact sections
- Company name/branding (currently "Odszkodowania")
- Team member names/bios (currently placeholder experts)
- Testimonial data (currently placeholder reviews)
- Case study data (currently placeholder examples)
- Insurance company logos (currently text placeholders — replace with SVG/PNG)
- Schema.org URLs (`https://example.pl`)
