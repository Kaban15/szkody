# Light Theme Redesign — Design Spec

**Date:** 2026-04-09
**Status:** Approved
**Approach:** Big Bang — single cohesive diff

## Summary

Convert the dark premium theme to a light warm-cream theme while preserving gold + orange CTA brand identity. Replace serif headings with a single sans-serif font, tighten spacing, and unify component styles (mixed: soft cards + sharp buttons).

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Brand identity | Gold (#D4AF37) + orange CTA (#E8652D) preserved | Maintains existing brand recognition on light background |
| Font | Plus Jakarta Sans (400–800), single font | Modern, characterful, strong bold weights |
| Background | Warm cream (#FDFBF7 bg, #F5F0E8 sections) | Harmonizes with gold accents, avoids cold/sterile white |
| Spacing | Moderate compression (py-12/16, gap-4, mb-4) | Tighter than current but still breathable |
| Components | Mixed — cards rounded-xl + shadow, buttons rounded-lg + strong hover | Visual contrast between soft containers and sharp actions |
| Implementation | Big Bang — single diff | Avoids half-dark/half-light intermediate states |

## 1. Color Palette

### New `tailwind-config.js` colors

```js
colors: {
  bg: '#FDFBF7',            // warm cream page background (was: #08080F)
  surface: '#F5F0E8',        // alternate section background (was: #12121E)
  'surface-light': '#FFFFFF', // cards, inputs, elevated elements (was: #1C1C2E)
  gold: '#D4AF37',           // unchanged — accent, trust elements
  'gold-light': '#E8C867',   // unchanged
  muted: '#8A7D6F',          // warm gray secondary text (was: #9A9590)
  error: '#EF4444',          // unchanged
  cta: '#E8652D',            // unchanged — primary CTA orange
  'cta-hover': '#D4561F',    // unchanged
  text: '#1A1008',           // dark brown body text (was: #E8E2D6)
  line: '#EDE7DA',            // NEW — warm border/divider color
}
```

### Color mapping (dark → light)

| Usage | Dark value | Light value |
|-------|-----------|-------------|
| Page background | #08080F | #FDFBF7 |
| Section background | #12121E | #F5F0E8 |
| Card/input background | #1C1C2E | #FFFFFF |
| Body text | #E8E2D6 | #1A1008 |
| Secondary text | #9A9590 | #8A7D6F |
| Borders | white/10, white/5 | #EDE7DA (border token) |
| Nav links | white/60 | text/60 |

## 2. Typography

### Google Fonts

**Remove:** Fraunces + Space Grotesk
**Add:** Plus Jakarta Sans (weights: 400, 500, 600, 700, 800)

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Tailwind config

```js
fontFamily: {
  heading: ['"Plus Jakarta Sans"', 'sans-serif'],
  body: ['"Plus Jakarta Sans"', 'sans-serif'],
}
```

Both aliases point to the same font — avoids changing `font-heading`/`font-body` classes across HTML files.

### Scale

- Hero h1: `text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold` (upgrade from font-bold for sans-serif impact)
- Section h2: `text-3xl lg:text-4xl font-bold` — unchanged
- Card h3, quiz h2: unchanged

## 3. Spacing — Moderate Compression

### Section padding

| Element | Current | New |
|---------|---------|-----|
| All sections (except hero) | `py-16 lg:py-24` | `py-12 lg:py-16` |
| Hero section | `py-24` | `py-20` |
| Hero min-height | `min-h-screen` | `min-h-[85vh]` |

### Element spacing

| Element | Current | New |
|---------|---------|-----|
| Card grids, trust bar gaps | `gap-6` | `gap-4` |
| Paragraphs below headings | `mb-6` / `mb-8` | `mb-4` |
| Section heading → content | `mb-10` / `mb-12` | `mb-8` |
| Mobile menu, quiz options | `space-y-6` | `space-y-4` |

### Unchanged

- Card internal padding (`p-4`, `p-6`)
- Quiz container padding
- Footer padding

## 4. Components

### Cards (service cards, case studies, quiz container)

- Border radius: `rounded-lg` → `rounded-xl`
- Background: `bg-surface-light` (#FFFFFF)
- Border: remove `border border-white/10`
- Shadow: add `shadow-sm`
- Hover: `shadow-md` + `translateY(-1px)` (update `.card-hover` in CSS). The existing gold glow `box-shadow` in `.card-hover` CSS stays — it's brand identity. Tailwind `shadow-sm` is for cards without `.card-hover`.

### Buttons

- CTA primary (orange): `rounded` → `rounded-lg`, add `hover:shadow-lg hover:shadow-cta/30`
- CTA secondary (gold border): `rounded` → `rounded-lg`
- Ghost buttons: `rounded-lg`, `bg-surface` background

### Quiz options

- `rounded-lg` → `rounded-xl`
- `border border-white/10 bg-surface` → `shadow-sm bg-surface-light`
- Selected state: `border-gold` → `ring-2 ring-gold shadow-md`

### Form inputs

- `rounded-lg` → `rounded-xl`
- `bg-surface border border-white/10 text-white placeholder-muted` → `bg-surface-light border border-line text-text placeholder-muted`
- Focus: `focus:border-gold focus:ring-2 focus:ring-gold/20`

### Navigation

- `.nav-solid` backdrop: `rgba(253,251,247,0.95)` with `backdrop-blur(12px)`
- `.nav-solid` border: `rgba(237,231,218,0.5)`
- Links: `text-white/60` → `text-text/60`, hover `text-gold` unchanged
- Mobile menu overlay: `bg-bg/95 backdrop-blur-lg`
- Hamburger/close icon: `text-white` → `text-text`

### Sticky bottom bar

- `bg-bg border-white/10` → `bg-bg border-line`

### FAQ accordion

- Borders: `white/10` → `line` token
- Text: `text-white` → `text-text`

### Ticker

- Background: `bg-bg/95` → unchanged (uses bg token)
- Border: `gold/20` → unchanged
- Text: `text-muted` → unchanged (uses muted token)

## 5. CSS Changes (`styles.css`)

### Hardcoded color replacements

```css
/* body */
background: #08080F → #FDFBF7
color: #E8E2D6 → #1A1008

/* range slider track */
input[type="range"] background: #1C1C2E → #F5F0E8

/* range slider thumb — BOTH selectors */
::-webkit-slider-thumb border: #08080F → #FDFBF7
::-moz-range-thumb border: #08080F → #FDFBF7

/* nav solid */
background-color: rgba(8,8,15,0.95) → rgba(253,251,247,0.95)
border-bottom: rgba(212,175,55,0.1) → rgba(237,231,218,0.5)

/* card hover — update lift */
transform: translateY(-2px) → translateY(-1px)
```

### Unchanged CSS

- All animations (fade-in, fade-in-up, word-reveal, ticker, comparison-bar, pulse-ring)
- Accordion max-height transition
- Reduced motion media query
- Scrollbar hide
- CTA glow (orange glow works on light bg)
- Quiz step fadeSlide animation

## 6. File Scope

### Modified files (~25)

- `js/tailwind-config.js` — new palette + font family
- `css/styles.css` — ~6 hardcoded color values
- `index.html` — Google Fonts link, spacing classes, border/text color classes, hero font-extrabold
- 8 main pages: `uslugi.html`, `sukcesy.html`, `opinie.html`, `kontakt.html`, `kalkulator.html`, `jak-dzialamy.html`, `404.html`, `polityka-prywatnosci.html`
- 5 service subpages: `odszkodowania-*.html`
- `blog/index.html` + ~20 blog articles
- 2 blog templates: `blog/_szablon-artykul.html`, `blog/_szablon-case-study.html`

### Untouched

- **All JavaScript files** — zero logic changes
- **Tests** — test logic not colors
- **SEO** — schema.org, meta tags, sitemap, robots.txt
- **HTML structure** — same sections, IDs, data attributes
- **vercel.json** — security headers unchanged
- **Animation behavior** — IntersectionObserver, classList toggle works identically

## 7. Class Replacement Patterns (mechanical)

These are the repeating Tailwind class substitutions across all HTML files:

| Find | Replace |
|------|---------|
| `text-white` (on headings, labels) | `text-text` |
| `text-white/60` | `text-text/60` |
| `border-white/10` | `border-line` |
| `border-white/5` | `border-line/50` |
| `border-white/20` | `border-line` |
| `bg-surface` (on cards/options) | `bg-surface-light shadow-sm` |
| `hover:bg-white/5` | `hover:bg-surface` |
| `rounded` (on buttons) | `rounded-lg` |
| `rounded-lg` (on cards/inputs) | `rounded-xl` |
| `py-16 lg:py-24` | `py-12 lg:py-16` |
| `gap-6` (section grids) | `gap-4` |
| `mb-10` / `mb-12` (section headers) | `mb-8` |
| `space-y-6` | `space-y-4` |

**Note:** These are patterns, not blind find-replace. Each instance needs context check — e.g. `rounded` on a progress bar should stay, `text-white` on CTA button text should stay.

## 8. Risk Assessment

- **Low risk:** All changes are visual (CSS classes, config). No JS logic changes.
- **Blog articles:** 20+ files but all follow same template pattern — mechanical changes.
- **Regression check:** Run `npm test` — tests check logic, not styling. Manual visual QA needed.
- **Rollback:** Single git revert reverts everything (Big Bang advantage).
