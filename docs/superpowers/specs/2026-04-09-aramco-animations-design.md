# Aramco-style Animations Design Spec

**Date:** 2026-04-09
**Status:** Approved
**Scope:** index.html — full-page animation upgrade inspired by Aramco basketball court site

## Summary

Add premium scroll-driven animations to the main page: Lenis smooth scroll, parallax on all visual sections, clip-path image reveals on hero + case studies, horizontal scroll text dividers, and enhanced scroll reveals. Current color palette unchanged. Quiz/calculator/form interactions untouched.

## 1. Lenis Smooth Scroll

- **Library:** Lenis via CDN (~4KB gzipped)
- **Replace:** native `scroll-behavior: smooth` in `css/styles.css`
- **Config:** `duration: 1.2`, `easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`, `orientation: 'vertical'`, `smoothWheel: true`
- **Integration:** Lenis `onScroll` callback drives parallax and horizontal text

## 2. Parallax

Elements with `data-parallax="<factor>"` attribute get `transform: translateY()` proportional to scroll offset.

| Section | Element | Factor |
|---------|---------|--------|
| Hero | Background/graphic | 0.3 |
| Case studies | Images | 0.15 |
| "Jak działamy" | Step icons | 0.1 |
| Team/experts | Photos | 0.15 |
| CTA footer | Background | 0.2 |

- **Mobile:** factor halved (`factor / 2`) on `window.innerWidth < 768`
- **Performance:** `will-change: transform` on parallax elements, `requestAnimationFrame` throttle
- **`prefers-reduced-motion`:** parallax disabled entirely

## 3. Clip-path Image Reveals

- **Targets:** Hero image/graphic, case study images (class `.reveal-clip`)
- **Initial state:** `clip-path: inset(0 100% 0 0)` (hidden from right)
- **Revealed state:** `clip-path: inset(0 0 0 0)` (fully visible)
- **Trigger:** IntersectionObserver at `threshold: 0.2`
- **Transition:** `clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1)`
- **`prefers-reduced-motion`:** instant reveal (no transition)

## 4. Horizontal Scroll Text Dividers

- **Count:** 2 dividers
  - Between quiz and "jak działamy" section
  - Between case studies and testimonials section
- **Content:** e.g. "PROFESJONALNE ODSZKODOWANIA", "WALCZYMY O TWOJE PRAWA"
- **Style:** Plus Jakarta Sans 800, `clamp(3rem, 8vw, 8rem)`, color `muted` at 15% opacity
- **Animation:** `translateX()` driven by scroll position via Lenis `onScroll`
  - Speed: `scrollY * -0.15` (moves left as user scrolls down)
  - Text duplicated 2x for seamless coverage
- **Container:** `overflow: hidden`, full-width, `py-12`
- **`prefers-reduced-motion`:** static, centered, no scroll effect

## 5. Enhanced Scroll Reveals

Replace current `fade-in-up` animation values:

| Property | Current | New |
|----------|---------|-----|
| `translateY` | 24px | 40px |
| `scale` | none | 0.97 → 1 |
| `duration` | 0.6s | 0.9s |
| `easing` | `ease` | `cubic-bezier(0.16, 1, 0.3, 1)` |

- Staggered delay logic unchanged
- `fade-in` (opacity-only) stays as-is

## 6. Unchanged Elements

- Color palette (all Tailwind config values)
- Quiz flow and animations
- Calculator
- Form validation and submission
- Ticker marquee
- Testimonial carousel
- FAQ accordion
- Cookie consent
- Navigation (mobile menu, sticky bar)

## Files Modified

| File | Changes |
|------|---------|
| `index.html` | Add Lenis CDN script, `data-parallax` attributes, 2 divider sections, `.reveal-clip` classes |
| `css/styles.css` | Remove `scroll-behavior: smooth`, add `.reveal-clip`, `.scroll-text-divider`, update `.fade-in-up` values, add Lenis base styles |
| `js/animations.js` | Init Lenis, parallax logic in `onScroll`, clip-path observer, horizontal text scroll logic |

## New Dependencies

- **Lenis** via CDN: `https://unpkg.com/lenis@1.1.18/dist/lenis.min.js` (pinned version)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Lenis conflicts with native smooth scroll | Remove `scroll-behavior: smooth` from CSS |
| Parallax jank on mobile | Halve factors on mobile, disable on `prefers-reduced-motion` |
| Clip-path not supported on old browsers | Graceful fallback: no clip-path = images visible by default |
| Lenis breaks anchor scroll (#hash links) | Lenis handles `scrollTo` natively — test all internal anchors |
