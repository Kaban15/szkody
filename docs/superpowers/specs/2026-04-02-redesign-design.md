# Redesign — Premium Multi-Page Site

## Goal

Redesign the existing one-page compensation claims site into a premium multi-page site. Remove AI-template aesthetics. Keep existing JS logic (quiz, calculator, forms, analytics).

## Palette

- **Background**: `#0a0a0a` (near-black)
- **Surface**: `#111111` (cards, elevated elements)
- **Surface-light**: `#1a1a1a` (hover states, subtle elevation)
- **White**: `#ffffff` (primary text on dark)
- **Muted**: `#888888` (secondary text)
- **Gold**: `#C8A45E` (accent, CTA highlights, hover glow)
- **Gold-light**: `#E0C878` (hover state)
- **CTA**: `#C8A45E` (gold buttons — unified accent, not separate orange)
- **Error**: `#E05252` (form errors)

## Typography

- **Headings**: Fraunces (variable, optical size, "wonk" axis)
- **Body**: Space Grotesk (geometric sans)
- **Hero headline**: 5-8rem, Fraunces, white, word-by-word reveal animation
- **Section headings**: 2.5-3.5rem, Fraunces
- **Body text**: 1rem-1.125rem, Space Grotesk, muted on dark / dark on light

## Page Structure

### Strona główna (`index.html`) — 5 sekcji:

1. **Hero** — full-width, full-viewport height, black bg
   - Giant headline: "Miałeś wypadek? Sprawdź ile Ci się należy"
   - 1 sentence subtext (muted)
   - 1 CTA button (gold outline or filled) → scrolls to quiz
   - 3 trust badges inline: "Bezpłatna konsultacja · Płacisz za sukces · Cała Polska"
   - Word-by-word text reveal on load

2. **Quiz** — dark surface bg (#111), quiz card on dark
   - Same 5-step quiz logic, restyled for dark theme
   - White card replaced with dark card (#1a1a1a border, white text)
   - Gold progress bar, gold selected state on options
   - Floating/sticky on desktop (visible as user scrolls past hero)

3. **Social proof + case studies teaser** — combined section
   - Counters row (same count-up, gold numbers on black)
   - 3 featured case studies below — asymmetric layout (1 large + 2 smaller, not 3x grid)
   - "Zobacz wszystkie →" link to /sukcesy

4. **Dlaczego my** — 3-4 points, NOT in identical cards
   - Alternating layout: icon left + text right, then icon right + text left
   - Or: large number (01, 02, 03) + text, vertical list style
   - Gold accent lines/numbers

5. **CTA Footer** — "Miałeś wypadek? Porozmawiajmy."
   - Large Fraunces heading, gold CTA button, phone number
   - Below: standard footer links + social + dane firmy

### Podstrony:

- `/uslugi` — all services listed with descriptions, links to individual service pages
- `/sukcesy` — full case studies with filter
- `/opinie` — testimonials page
- `/kalkulator` — standalone calculator (restyled dark)
- `/kontakt` — contact form + map + info
- `/jak-dzialamy` — process timeline (restyled)
- `/blog` — article listing
- 5x service subpages (restyled with new template)
- `/polityka-prywatnosci`, `/404`

### Subpage template:
- Transparent nav → solid black on scroll
- Breadcrumb (muted text)
- Hero banner (shorter than homepage, black bg, large title)
- Content on #0a0a0a bg with readable contrast
- CTA block before footer
- CTA Footer

## Navigation

- **Desktop**: transparent on hero, becomes solid `#0a0a0a` with subtle bottom border after scroll. Hides on scroll-down, appears on scroll-up.
- Logo (gold "Odszkodowania") left, links center/right, CTA "Bezpłatna konsultacja" gold outlined button right.
- **Mobile**: hamburger → full-screen dark overlay menu. Sticky bottom bar stays (gold "Zadzwoń" + "Bezpłatna wycena").

## Animations (desktop only, reduced on mobile)

- **Hero text**: word-by-word reveal with staggered timing (0.1s per word)
- **Cards**: hover → subtle lift + gold border glow (box-shadow: 0 0 20px rgba(200,164,94,0.15))
- **Count-up**: stays (gold numbers)
- **Scroll sections**: opacity fade only (no translateY — less "AI")
- **Nav**: smooth transition transparent→solid, slide up/down on scroll
- **Mobile**: `prefers-reduced-motion` + no stagger animations, instant reveal

## Design Anti-Patterns to Avoid

- NO symmetric 3x card grids (use asymmetric layouts, 1+2, 2+1, full-width)
- NO identical card sizing (vary heights, widths)
- NO colored circle icon containers (use raw icons or bordered squares)
- NO gradient backgrounds (solid colors only)
- NO stock photos or AI images
- NO rounded-2xl cards everywhere (mix sharp and rounded)
- NO warm-gray backgrounds (pure black/near-black only)

## What Stays

- All JS files (quiz.js, calculator.js, form-validation.js, analytics.js, animations.js, navigation.js, cookie-consent.js)
- Quiz flow and logic
- Calculator algorithm and flow
- Form validation
- Analytics tracking
- Cookie consent
- SEO schema markup (updated for new URLs if needed)
- Content/copy (all Polish text stays the same)

## What Changes

- All HTML structure (new layouts, new sections)
- All CSS (new Tailwind config, new styles.css)
- Tailwind config (new color palette, new fonts)
- Navigation behavior (transparent→solid, scroll-hide)
- animations.js (add text reveal, modify scroll behavior, add nav scroll logic)
- Page structure (one-page → multi-page)
