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

No build, lint, or test commands — this is a static site with CDN dependencies (Tailwind, Google Fonts, Lucide Icons).

## Architecture

### Tech Stack
- **Tailwind CSS via CDN** (`cdn.tailwindcss.com`) with shared config in `js/tailwind-config.js` (loaded via script tag in all pages)
- **Vanilla JS** (no framework, no bundler, no modules — plain `<script>` tags)
- **Lucide Icons** via CDN (`unpkg.com/lucide@latest`) — call `lucide.createIcons()` after DOM load
- **Google Fonts**: Fraunces (headings) + Space Grotesk (body)

### Color Palette (defined in `js/tailwind-config.js` — single source of truth)
- `bg` (#08080F) — page background (dark navy tint)
- `surface` (#12121E), `surface-light` (#1C1C2E) — card/section backgrounds
- `gold` (#D4AF37), `gold-light` (#E8C867) — accent, trust elements, secondary buttons
- `cta` (#E8652D), `cta-hover` (#D4561F) — primary call-to-action buttons (orange)
- `text` (#E8E2D6) — warm white body text
- `muted` (#9A9590) — secondary text (warm gray)
- `error` (#EF4444) — form validation errors

### Page Structure
- **`index.html`** — one-page main site containing: ticker, hero, trust bar, quiz, "jak działamy" process, social proof + case studies (with timeline & quotes), testimonials carousel, "dlaczego my", team/experts, insurance logos bar, FAQ accordion, CTA footer, floating WhatsApp/phone buttons
- **`uslugi.html`** — services overview page
- **`sukcesy.html`** — case studies / success stories
- **`opinie.html`** — client testimonials
- **5 service subpages** (`odszkodowania-*.html`) — each follows same template: nav, breadcrumb, hero, content, mini case study, FAQ, CTA, footer
- **Blog**: `blog/index.html` (listing with category filter), `blog/_szablon-artykul.html` (article template, not published), `blog/_szablon-case-study.html` (case study template, not published)
- **Utility pages**: `kalkulator.html`, `kontakt.html`, `jak-dzialamy.html`, `404.html`, `polityka-prywatnosci.html`, `robots.txt`, `sitemap.xml`

### JavaScript Files (all in `js/`)
Scripts must load in dependency order. `form-validation.js` must load before any file that calls `window.formValidation`. `cookie-consent.js` must load before `analytics.js`.

| File | Exports/Globals | Purpose |
|------|----------------|---------|
| `form-validation.js` | `window.formValidation` | Phone/email/name validators, inline error show/hide |
| `quiz.js` | — | 5-step diagnostic quiz (selection, navigation, submission, business hours) |
| `calculator.js` | — | Compensation calculator (injury data in Map, cached DOM, live result) |
| `animations.js` | — | IntersectionObserver: count-up numbers, scroll reveal, case study filter |
| `navigation.js` | — | Mobile hamburger menu, sticky bottom bar hide, testimonial carousel scroll |
| `cookie-consent.js` | — | Cookie banner, localStorage consent, dynamic GA4 script injection |
| `analytics.js` | `window.trackEvent` | GA4 event wrapper, phone click tracking, FAQ accordion, contact form |

### CSS (`css/styles.css`)
Custom animations and transitions beyond Tailwind utilities:
- **`.word-reveal`** — hero word-by-word fade-in
- **`.fade-in`** — scroll-triggered opacity reveal (IntersectionObserver)
- **`.count-up`** — counter animation (separate observer from fade-in)
- **`.card-hover`** — gold glow on hover
- **`.animate-ticker`** — infinite horizontal scroll for top success ticker
- **`.testimonial-track` / `.testimonial-card`** — scroll-snap for carousel
- **`.pulse-ring`** — pulsing ring on floating WhatsApp button
- **`.faq-answer`** — max-height accordion transition

### Shared Elements Across Subpages
Every subpage duplicates: nav (with `#mobile-menu`), footer (4-column), sticky bottom bar, cookie consent banner, and Tailwind config in `<head>`. When modifying shared elements, update ALL HTML files.

### Key Design Patterns
- **Dark premium theme**: near-black backgrounds with gold accents — deliberately different from competitor blue/white sites
- **Trust bar**: social proof strip between hero and quiz (Google rating, badge, stats)
- **Ticker**: auto-scrolling marquee at top with recent successes (content duplicated for seamless CSS loop — update both copies when changing text)
- **Testimonial carousel**: horizontal scroll with snap, navigation via prev/next buttons in `navigation.js`
- **FAQ accordion**: `aria-controls` + `role="region"` for accessibility, toggle logic in `analytics.js`
- **Floating contact buttons**: WhatsApp + phone, desktop only (mobile uses sticky bottom bar)
- **Quiz/Calculator forms**: simulated submission with `setTimeout` — backend integration placeholder. Replace the `setTimeout` blocks with real fetch calls.
- **Business hours logic** in `quiz.js`: Mon-Fri 8-18, Sat 9-14 — affects "oddzwonimy w 30 minut" vs "następny dzień roboczy" messaging.
- **Calculator algorithm**: injury base amounts stored in a `Map` at click time (not re-queried from DOM). Multipliers applied to the sum, result shown as 0.7x–1.3x range.
- **Cookie consent gates GA4**: analytics scripts only load after user accepts cookies via localStorage check. `cookie-consent.js` guards against missing `#cookie-banner` element.
- **Delegated event handling**: `navigation.js` uses delegated click on mobile menu; `analytics.js` uses delegated click with early-exit for phone/sticky/case tracking.
- **DOM caching**: `calculator.js` caches all label/result elements at init — `recalculate()` runs on every slider input event and must avoid DOM queries in the hot path.

## Specs and Plans

- Design spec: `docs/superpowers/specs/2026-04-02-strona-odszkodowania-design.md`
- Implementation plan: `docs/superpowers/plans/2026-04-02-strona-odszkodowania-plan.md`

## Script Load Order (critical)

Correct order on pages that use all scripts:
```
form-validation.js → cookie-consent.js → animations.js → analytics.js → navigation.js → quiz.js → calculator.js
```
- `form-validation.js` MUST be first — exports `window.formValidation` used by quiz, calculator, and analytics
- `cookie-consent.js` MUST be before `analytics.js` — gates GA4 loading
- `analytics.js` contains FAQ accordion toggle and contact form handler (not just tracking)
- `navigation.js` contains testimonial carousel logic (needs DOM ready)

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
