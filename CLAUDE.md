# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static lead-generation website for a Polish compensation claims firm (branża odszkodowawcza). Polish language throughout. No build step, no framework — plain HTML/CSS/JS served as static files.

## Running Locally

```bash
python3 -m http.server 1111
# Open http://localhost:1111
```

No build, lint, or test commands — this is a static site with CDN dependencies (Tailwind, Google Fonts, Lucide Icons).

## Architecture

### Tech Stack
- **Tailwind CSS via CDN** (`cdn.tailwindcss.com`) with inline config in each HTML file's `<head>`
- **Vanilla JS** (no framework, no bundler, no modules — plain `<script>` tags)
- **Lucide Icons** via CDN (`unpkg.com/lucide@latest`) — call `lucide.createIcons()` after DOM load
- **Google Fonts**: Playfair Display (headings) + Inter (body)

### Color Palette (defined in Tailwind config)
- `navy` (#1A1F36), `navy-dark` (#121526) — primary/dark backgrounds
- `gold` (#D4A843), `gold-light` (#E8C76A) — accent, success
- `cta` (#E8652D), `cta-hover` (#D4561F) — call-to-action buttons
- `warm` (#F7F5F2), `warm-dark` (#EDE9E4) — light backgrounds
- `txt` (#2D2D2D) — text color

### Page Structure
- **`index.html`** — one-page main site (~83KB) containing: hero+quiz, social proof, timeline, calculator, services, case studies, testimonials, blog preview, FAQ, contact, footer
- **5 service subpages** (`odszkodowania-*.html`) — each follows same template: nav, breadcrumb, hero, content, mini case study, FAQ, CTA, footer
- **Utility pages**: `kalkulator.html`, `kontakt.html`, `jak-dzialamy.html`, `404.html`, `polityka-prywatnosci.html`, `blog/index.html`

### JavaScript Files (all in `js/`)
Scripts must load in dependency order. `form-validation.js` must load before any file that calls `window.formValidation`. `cookie-consent.js` must load before `analytics.js`.

| File | Exports/Globals | Purpose |
|------|----------------|---------|
| `form-validation.js` | `window.formValidation` | Phone/email/name validators, inline error show/hide |
| `quiz.js` | — | 5-step diagnostic quiz (selection, navigation, submission, business hours) |
| `calculator.js` | — | Compensation calculator (injury data in Map, cached DOM, live result) |
| `animations.js` | — | IntersectionObserver: count-up numbers, scroll reveal, case study filter |
| `navigation.js` | — | Mobile hamburger menu, sticky bottom bar hide via IntersectionObserver |
| `cookie-consent.js` | — | Cookie banner, localStorage consent, dynamic GA4 script injection |
| `analytics.js` | `window.trackEvent` | GA4 event wrapper, phone click tracking, FAQ accordion, contact form |

### Shared Elements Across Subpages
Every subpage duplicates: nav (with `#mobile-menu`), footer (4-column), sticky bottom bar, cookie consent banner, and Tailwind config in `<head>`. When modifying shared elements, update ALL HTML files.

### Key Design Patterns
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

## Placeholders to Replace
- Phone: `+48XXXXXXXXX` and `+48 XXX XXX XXX`
- Email: `kontakt@example.pl`
- GA4 ID: `G-XXXXXXXXXX` in `cookie-consent.js`
- Google Maps embed URL in contact sections
- Company name/branding (currently "Odszkodowania")
- Case study data (currently placeholder examples)
- Schema.org URLs (`https://example.pl`)
