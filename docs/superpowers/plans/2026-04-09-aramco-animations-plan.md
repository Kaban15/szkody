# Aramco-style Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add premium scroll-driven animations (Lenis smooth scroll, parallax, clip-path reveals, horizontal scroll text dividers, enhanced scroll reveals) to `index.html`.

**Architecture:** Lenis library handles smooth scrolling and provides scroll position for parallax + horizontal text. All animation logic stays in `js/animations.js`. CSS classes added to `css/styles.css`. HTML gets `data-*` attributes and 2 new divider sections. No new JS files.

**Tech Stack:** Lenis 1.1.18 (CDN), vanilla JS, CSS transitions/transforms, IntersectionObserver

**Spec:** `docs/superpowers/specs/2026-04-09-aramco-animations-design.md`

---

### Task 1: Add Lenis smooth scroll library

**Files:**
- Modify: `index.html:12-14` (add Lenis CDN script in `<head>`)
- Modify: `css/styles.css:1-4` (replace `scroll-behavior: smooth` with Lenis styles)
- Modify: `js/animations.js:1-3` (init Lenis at top of DOMContentLoaded)

- [ ] **Step 1: Add Lenis CDN script to `<head>` in `index.html`**

Add after the Tailwind CDN script (line 13), before Google Fonts:

```html
<!-- Lenis Smooth Scroll -->
<link rel="stylesheet" href="https://unpkg.com/lenis@1.1.18/dist/lenis.css">
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js" defer></script>
```

- [ ] **Step 2: Replace native smooth scroll in `css/styles.css`**

Replace lines 1-4:
```css
html {
    scroll-behavior: smooth;
    scroll-padding-top: 7.5rem;
}
```

With:
```css
html.lenis, html.lenis body {
    height: auto;
}

html {
    scroll-padding-top: 7.5rem;
}
```

- [ ] **Step 3: Init Lenis in `js/animations.js`**

Add at the very top of the `DOMContentLoaded` callback (after `'use strict';` and `document.addEventListener`), before existing word-reveal code:

```javascript
// Lenis smooth scroll init
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
});

// Store lenis globally for other scripts (anchor scrolls)
window.lenis = lenis;

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

- [ ] **Step 4: Fix anchor scroll links to use Lenis**

In `js/navigation.js`, find any `scrollIntoView` or `window.scrollTo` calls. Lenis intercepts native scroll behavior on anchor `<a href="#section">` clicks automatically. Verify by checking that `#quiz`, `#hero` etc. anchor links still work. No code change expected — just verify.

- [ ] **Step 5: Test locally**

Run: `python3 -m http.server 1111`
Open `http://localhost:1111` — verify smooth scroll works, anchor links work, no console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css js/animations.js
git commit -m "feat: add Lenis smooth scroll library"
```

---

### Task 2: Add parallax effect to visual sections

**Files:**
- Modify: `index.html` (add `data-parallax` attributes to 5 section elements)
- Modify: `js/animations.js` (add parallax logic using Lenis `onScroll`)
- Modify: `css/styles.css` (add `will-change` for parallax elements)

- [ ] **Step 1: Add `data-parallax` attributes in `index.html`**

Hero section (line ~251):
```html
<section id="hero" class="min-h-[85vh] flex items-center bg-bg">
```
Change the inner content div (line ~252-253) — wrap the hero text container. Find the div inside hero that has the heading and add:
```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32" data-parallax="0.3">
```

"Jak działamy" step icons (line ~492) — add to each step card's icon container:
```html
<div class="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4" data-parallax="0.1">
```
Apply to all 4 step icon divs (lines ~495, ~509, ~522, ~535).

Case study cards (line ~582, ~643, ~671) — add to each card:
```html
data-parallax="0.15"
```
Add this attribute to the 3 case study card divs.

Team expert cards (lines ~899, ~912, ~925, ~938) — add to each card container's avatar div:
```html
data-parallax="0.15"
```
Add to the 4 avatar/icon divs (the `w-20 h-20 rounded-full` elements).

CTA footer section (line ~1052):
```html
<section class="bg-bg py-12 lg:py-16 text-center" data-parallax="0.2">
```

- [ ] **Step 2: Add parallax CSS in `css/styles.css`**

Add before the `/* Reduced motion */` section:

```css
/* Parallax elements */
[data-parallax] {
    will-change: transform;
}
```

- [ ] **Step 3: Add parallax logic in `js/animations.js`**

Add after the Lenis init block (after `requestAnimationFrame(raf);`), before the word-reveal code:

```javascript
// Parallax on scroll
const parallaxEls = document.querySelectorAll('[data-parallax]');
const isMobile = window.innerWidth < 768;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced && parallaxEls.length) {
    lenis.on('scroll', ({ scroll }) => {
        parallaxEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;

            const factor = parseFloat(el.dataset.parallax) * (isMobile ? 0.5 : 1);
            const offset = (rect.top - window.innerHeight / 2) * factor;
            el.style.transform = `translateY(${offset}px)`;
        });
    });
}
```

- [ ] **Step 4: Test locally**

Open `http://localhost:1111` — scroll through page, verify parallax on hero, process icons, case studies, team avatars, CTA footer. Check mobile viewport (DevTools responsive mode). No jank or layout shift.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/animations.js
git commit -m "feat: add scroll parallax to hero, process, cases, team, CTA"
```

---

### Task 3: Add clip-path image reveals on hero and case studies

**Files:**
- Modify: `css/styles.css` (add `.reveal-clip` class)
- Modify: `js/animations.js` (add IntersectionObserver for `.reveal-clip`)
- Modify: `index.html` (add `reveal-clip` class to hero CTA area and case study cards)

- [ ] **Step 1: Add `.reveal-clip` CSS in `css/styles.css`**

Add before `/* Parallax elements */`:

```css
/* Clip-path image reveal */
.reveal-clip {
    clip-path: inset(0 100% 0 0);
    transition: clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1);
}

.reveal-clip.visible {
    clip-path: inset(0 0 0 0);
}
```

- [ ] **Step 2: Add observer in `js/animations.js`**

Add after the existing `fadeObserver` block (around line ~58), before comparison bars:

```javascript
// Clip-path reveal observer
const clipObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            clipObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal-clip').forEach(el => clipObserver.observe(el));
```

- [ ] **Step 3: Add `reveal-clip` class in `index.html`**

Hero checkmarks row (line ~263) — add `reveal-clip` to the flex container:
```html
<div class="flex flex-wrap gap-6 text-sm text-muted reveal-clip">
```

Case study card 1 (line ~582) — add `reveal-clip` to the card div:
```html
<div class="fade-in reveal-clip bg-surface rounded-xl shadow-sm p-6 lg:p-8 card-hover lg:col-span-3 mb-6 lg:mb-0">
```

Case study card 2 (line ~643):
```html
<div class="fade-in reveal-clip bg-surface rounded-xl shadow-sm p-6 card-hover">
```

Case study card 3 (line ~671):
```html
<div class="fade-in reveal-clip bg-surface rounded-xl shadow-sm p-6 card-hover">
```

- [ ] **Step 4: Test locally**

Scroll to hero — checkmarks should reveal from left. Scroll to case studies — cards should reveal with clip-path. Verify `prefers-reduced-motion` works (add media query override already in existing reduced motion block).

- [ ] **Step 5: Add reduced motion override in `css/styles.css`**

Inside the existing `@media (prefers-reduced-motion: reduce)` block, add:

```css
.reveal-clip {
    clip-path: none !important;
}
```

- [ ] **Step 6: Commit**

```bash
git add index.html css/styles.css js/animations.js
git commit -m "feat: add clip-path reveal animation on hero and case studies"
```

---

### Task 4: Add horizontal scroll text dividers

**Files:**
- Modify: `index.html` (add 2 divider sections between existing sections)
- Modify: `css/styles.css` (add `.scroll-text-divider` styles)
- Modify: `js/animations.js` (add horizontal scroll logic in Lenis `onScroll`)

- [ ] **Step 1: Add divider CSS in `css/styles.css`**

Add before `/* Parallax elements */`:

```css
/* Horizontal scroll text divider */
.scroll-text-divider {
    overflow: hidden;
    padding: 3rem 0;
}

.scroll-text-divider .scroll-text-inner {
    display: flex;
    white-space: nowrap;
    will-change: transform;
}

.scroll-text-divider .scroll-text-inner span {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: clamp(3rem, 8vw, 8rem);
    color: rgba(138, 125, 111, 0.15);
    padding: 0 2rem;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: -0.03em;
}
```

- [ ] **Step 2: Add first divider in `index.html` — between quiz (line ~482) and "jak działamy" (line ~484)**

Insert between `</section>` (line 482) and `<!-- SECTION: JAK DZIAŁAMY -->` (line 484):

```html
        <!-- SCROLL TEXT DIVIDER 1 -->
        <div class="scroll-text-divider" data-scroll-text>
            <div class="scroll-text-inner">
                <span>PROFESJONALNE ODSZKODOWANIA</span>
                <span>PROFESJONALNE ODSZKODOWANIA</span>
                <span>PROFESJONALNE ODSZKODOWANIA</span>
            </div>
        </div>
```

- [ ] **Step 3: Add second divider in `index.html` — between case studies (line ~704) and testimonials (line ~706)**

Insert between `</section>` (line 704) and `<!-- SECTION: OPINIE KLIENTÓW -->` (line 706):

```html
        <!-- SCROLL TEXT DIVIDER 2 -->
        <div class="scroll-text-divider" data-scroll-text>
            <div class="scroll-text-inner">
                <span>WALCZYMY O TWOJE PRAWA</span>
                <span>WALCZYMY O TWOJE PRAWA</span>
                <span>WALCZYMY O TWOJE PRAWA</span>
            </div>
        </div>
```

- [ ] **Step 4: Add horizontal scroll logic in `js/animations.js`**

Add inside the existing Lenis `onScroll` callback (or create a new one if parallax is separate). Add after the parallax logic:

```javascript
// Horizontal scroll text dividers
const scrollTextDividers = document.querySelectorAll('[data-scroll-text]');

if (!prefersReduced && scrollTextDividers.length) {
    lenis.on('scroll', ({ scroll }) => {
        scrollTextDividers.forEach(el => {
            const inner = el.querySelector('.scroll-text-inner');
            if (!inner) return;
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;

            inner.style.transform = `translateX(${scroll * -0.15}px)`;
        });
    });
}
```

Note: If parallax already has a `lenis.on('scroll')`, merge both into one callback to avoid duplicate listeners.

- [ ] **Step 5: Add reduced motion override**

Inside `@media (prefers-reduced-motion: reduce)`:

```css
.scroll-text-divider .scroll-text-inner {
    transform: none !important;
    justify-content: center;
}
```

- [ ] **Step 6: Test locally**

Scroll through page — dividers should slide horizontally. Text should be subtle (15% opacity). No horizontal overflow on page.

- [ ] **Step 7: Commit**

```bash
git add index.html css/styles.css js/animations.js
git commit -m "feat: add horizontal scroll text dividers between sections"
```

---

### Task 5: Enhance existing scroll reveal animations

**Files:**
- Modify: `css/styles.css` (update `.fade-in-up` values)

- [ ] **Step 1: Update `.fade-in-up` in `css/styles.css`**

Replace existing `.fade-in-up` block (lines ~204-213):

```css
/* Fade-in with upward movement — enhanced */
.fade-in-up {
    opacity: 0;
    transform: translateY(40px) scale(0.97);
    transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-in-up.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
}
```

- [ ] **Step 2: Test locally**

Scroll to "Dlaczego my" section (uses `fade-in-up` with stagger) — elements should appear with more dramatic spring-like motion. Check team section too.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: enhance scroll reveal animations with spring easing"
```

---

### Task 6: Consolidate Lenis scroll listeners and final QA

**Files:**
- Modify: `js/animations.js` (merge duplicate `lenis.on('scroll')` calls into one)

- [ ] **Step 1: Consolidate scroll listeners**

If Tasks 2 and 4 created separate `lenis.on('scroll')` listeners, merge them into a single callback:

```javascript
lenis.on('scroll', ({ scroll }) => {
    // Parallax
    if (!prefersReduced && parallaxEls.length) {
        parallaxEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;
            const factor = parseFloat(el.dataset.parallax) * (isMobile ? 0.5 : 1);
            const offset = (rect.top - window.innerHeight / 2) * factor;
            el.style.transform = `translateY(${offset}px)`;
        });
    }

    // Horizontal scroll text
    if (!prefersReduced && scrollTextDividers.length) {
        scrollTextDividers.forEach(el => {
            const inner = el.querySelector('.scroll-text-inner');
            if (!inner) return;
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView) return;
            inner.style.transform = `translateX(${scroll * -0.15}px)`;
        });
    }
});
```

- [ ] **Step 2: Full page QA**

Test checklist:
- [ ] Lenis smooth scroll works on desktop
- [ ] All anchor links (`#quiz`, `#hero`) still work
- [ ] Parallax visible on hero, process icons, case studies, team, CTA
- [ ] Clip-path reveal on hero checkmarks and case study cards
- [ ] Horizontal text dividers scroll horizontally
- [ ] Enhanced `fade-in-up` spring animation on "Dlaczego my" and team
- [ ] Mobile viewport: parallax reduced, no jank
- [ ] `prefers-reduced-motion`: all new animations disabled
- [ ] No horizontal scrollbar on page
- [ ] No console errors
- [ ] Quiz still works (not affected)
- [ ] Testimonial carousel still works
- [ ] FAQ accordion still works
- [ ] Cookie consent still works

- [ ] **Step 3: Commit**

```bash
git add js/animations.js
git commit -m "refactor: consolidate Lenis scroll listeners into single callback"
```
