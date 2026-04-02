# Premium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing one-page compensation claims site into a premium dark multi-page site with asymmetric layouts and word-by-word hero animation.

**Architecture:** Replace all HTML and CSS with a new dark theme (near-black + white + gold). Convert one-page index.html into a short homepage + dedicated subpages. Keep all existing JS modules (quiz, calculator, form-validation, analytics, cookie-consent) — only modify animations.js and navigation.js for new behaviors.

**Tech Stack:** HTML5, Tailwind CSS (CDN), Vanilla JS, Fraunces + Space Grotesk (Google Fonts), Lucide Icons (CDN)

**Spec:** `docs/superpowers/specs/2026-04-02-redesign-design.md`

---

## File Structure

```
szkody/
├── index.html                          # NEW: Short homepage (5 sections)
├── uslugi.html                         # NEW: All services listing
├── sukcesy.html                        # NEW: Case studies with filter
├── opinie.html                         # NEW: Testimonials page
├── kalkulator.html                     # REWRITE: Dark theme
├── kontakt.html                        # REWRITE: Dark theme
├── jak-dzialamy.html                   # REWRITE: Dark theme
├── polityka-prywatnosci.html           # REWRITE: Dark theme
├── 404.html                            # REWRITE: Dark theme
├── odszkodowania-komunikacyjne.html    # REWRITE: New subpage template
├── odszkodowania-wypadki-przy-pracy.html
├── odszkodowania-bledy-medyczne.html
├── odszkodowania-smierc-bliskiej-osoby.html
├── odszkodowania-wypadki-rolnicze.html
├── blog/
│   └── index.html                      # REWRITE: Dark theme
├── css/
│   └── styles.css                      # REWRITE: New animations, dark theme styles
├── js/
│   ├── quiz.js                         # NO CHANGE (logic stays)
│   ├── calculator.js                   # NO CHANGE
│   ├── form-validation.js              # NO CHANGE
│   ├── animations.js                   # MODIFY: Add text reveal, update scroll behavior
│   ├── navigation.js                   # MODIFY: Add transparent→solid, scroll-hide
│   ├── cookie-consent.js               # NO CHANGE
│   └── analytics.js                    # NO CHANGE
└── docs/...
```

---

### Task 1: New Tailwind Config + Fonts + CSS Foundation

**Files:**
- Create: `css/styles.css` (full rewrite)

This task establishes the visual foundation. Every subsequent task depends on this.

- [ ] **Step 1: Define the new Tailwind config block**

This replaces the existing inline `tailwind.config` in every HTML file. The new config:

```html
<script>
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    bg: '#0a0a0a',
                    surface: '#111111',
                    'surface-light': '#1a1a1a',
                    gold: '#C8A45E',
                    'gold-light': '#E0C878',
                    muted: '#888888',
                    error: '#E05252',
                },
                fontFamily: {
                    heading: ['Fraunces', 'serif'],
                    body: ['"Space Grotesk"', 'sans-serif'],
                },
            },
        },
    }
</script>
```

New Google Fonts link:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Rewrite `css/styles.css`**

```css
html {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
}

body {
    background: #0a0a0a;
    color: #ffffff;
}

/* Hero word-by-word reveal */
.word-reveal .word {
    display: inline-block;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.word-reveal .word.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Scroll fade (no translateY — anti AI-template) */
.fade-in {
    opacity: 0;
    transition: opacity 0.8s ease;
}

.fade-in.visible {
    opacity: 1;
}

/* Card hover with gold glow */
.card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    border: 1px solid transparent;
}

.card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(200, 164, 94, 0.12);
    border-color: rgba(200, 164, 94, 0.3);
}

/* Progress bar */
.progress-bar {
    transition: width 0.4s ease;
}

/* Quiz step animation */
.quiz-step {
    animation: fadeSlide 0.3s ease-out;
}

@keyframes fadeSlide {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

/* Range slider — dark theme */
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #1a1a1a;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #C8A45E;
    cursor: pointer;
    border: 3px solid #0a0a0a;
    box-shadow: 0 0 10px rgba(200, 164, 94, 0.3);
}

input[type="range"]::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #C8A45E;
    cursor: pointer;
    border: 3px solid #0a0a0a;
    box-shadow: 0 0 10px rgba(200, 164, 94, 0.3);
}

/* Accordion */
.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.faq-answer.open {
    max-height: 500px;
}

/* Nav transitions */
#main-nav {
    transition: background-color 0.3s ease, transform 0.3s ease;
}

#main-nav.nav-solid {
    background-color: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(200, 164, 94, 0.1);
}

#main-nav.nav-hidden {
    transform: translateY(-100%);
}

/* Sticky bar */
#sticky-bar.hidden-bar {
    transform: translateY(100%);
}

/* Scrollbar hide for carousel */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Count-up */
.count-up {
    opacity: 0;
    transition: opacity 0.6s ease;
}

.count-up.visible {
    opacity: 1;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    .word-reveal .word {
        opacity: 1 !important;
        transform: none !important;
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: new dark theme CSS foundation with gold accents"
```

---

### Task 2: Updated navigation.js + animations.js

**Files:**
- Modify: `js/navigation.js`
- Modify: `js/animations.js`

- [ ] **Step 1: Rewrite `js/navigation.js`**

New behavior: transparent nav on load → solid after scroll past hero → hide on scroll down → show on scroll up. Mobile menu as full-screen overlay.

```js
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('main-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const stickyBar = document.getElementById('sticky-bar');
    const interactiveSections = ['quiz', 'kalkulator', 'kontakt'];

    if (!nav) return;

    // Scroll: transparent → solid, hide on scroll down, show on scroll up
    let lastScrollY = 0;
    let ticking = false;

    function updateNav() {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight * 0.5;

        // Solid after scrolling past half the viewport
        nav.classList.toggle('nav-solid', scrollY > heroHeight);

        // Hide/show on scroll direction (only after hero)
        if (scrollY > heroHeight) {
            nav.classList.toggle('nav-hidden', scrollY > lastScrollY && scrollY - lastScrollY > 10);
        } else {
            nav.classList.remove('nav-hidden');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });

    // Mobile menu
    if (menuBtn && mobileMenu) {
        const menuIcon = menuBtn.querySelector('[data-lucide]');

        function setMenuIcon(name) {
            if (menuIcon) {
                menuIcon.setAttribute('data-lucide', name);
                lucide.createIcons();
            }
        }

        menuBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('overflow-hidden');
            setMenuIcon(isOpen ? 'menu' : 'x');
        });

        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.classList.remove('active');
                document.body.classList.remove('overflow-hidden');
                setMenuIcon('menu');
            }
        });
    }

    // Sticky bar: hide when interactive sections are in viewport
    if (stickyBar) {
        const observer = new IntersectionObserver((entries) => {
            const anyVisible = entries.some(e => e.isIntersecting);
            stickyBar.classList.toggle('hidden-bar', anyVisible);
        }, { threshold: 0.3 });

        interactiveSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
    }
});
```

- [ ] **Step 2: Rewrite `js/animations.js`**

Add word-by-word reveal for hero, keep count-up, use opacity-only fade for sections, keep case filter.

```js
document.addEventListener('DOMContentLoaded', () => {
    // Word-by-word hero reveal
    document.querySelectorAll('.word-reveal').forEach(el => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

        const wordEls = el.querySelectorAll('.word');
        const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;

        wordEls.forEach((word, i) => {
            setTimeout(() => word.classList.add('visible'), delay + i * 100);
        });
    });

    // Count-up animation
    function animateCount(el) {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        const duration = 1500;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const countEl = entry.target.querySelector('[data-count]');
                if (countEl) animateCount(countEl);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.count-up').forEach(el => countObserver.observe(el));

    // Scroll fade (opacity only, no translateY)
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

    // Case study filter
    document.querySelectorAll('.case-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            document.querySelectorAll('.case-filter').forEach(b => {
                b.classList.remove('bg-gold', 'text-bg');
                b.classList.add('bg-surface-light', 'text-muted');
            });
            btn.classList.remove('bg-surface-light', 'text-muted');
            btn.classList.add('bg-gold', 'text-bg');
            document.querySelectorAll('.case-card').forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.type === filter) ? '' : 'none';
            });
        });
    });
});
```

- [ ] **Step 3: Commit**

```bash
git add js/navigation.js js/animations.js
git commit -m "feat: add scroll-hide nav, word reveal, dark theme animations"
```

---

### Task 3: Homepage — New index.html

**Files:**
- Rewrite: `index.html`

This is the core task. Build the new short homepage with 5 sections + nav + footer.

- [ ] **Step 1: Read the full redesign spec** at `docs/superpowers/specs/2026-04-02-redesign-design.md`

- [ ] **Step 2: Read the current `index.html`** to understand existing quiz HTML structure (the quiz HTML must be preserved exactly — only restyle with dark theme classes)

- [ ] **Step 3: Create new `index.html`**

Structure (top to bottom):
1. `<head>` — new Tailwind config (from Task 1), Fraunces + Space Grotesk fonts, Lucide CDN, styles.css, SEO meta tags, schema.org JSON-LD (keep existing)
2. `<nav id="main-nav">` — starts transparent (no bg class), becomes solid via JS. Logo gold, links white/muted, CTA gold outline button. Mobile hamburger.
3. `<div id="mobile-menu">` — full-screen overlay (fixed inset-0, bg-bg/95, backdrop-blur), centered links, big text.
4. **Section 1: Hero** — `min-h-screen flex items-center`, bg-bg. `<h1 class="word-reveal font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white">Miałeś wypadek?<br>Sprawdź ile Ci się należy</h1>`. Subtext muted. CTA button gold. Trust badges.
5. **Section 2: Quiz** — bg-surface. Keep ALL existing quiz HTML from old index.html but restyle: quiz container gets `bg-surface-light border border-white/10 rounded-xl`. Option buttons: `border-surface-light hover:border-gold`. Selected state: `border-gold bg-gold/10`. Progress bar bg-gold. Form inputs: `bg-surface border-white/10 text-white`. Success screen adapted for dark.
6. **Section 3: Social proof + Case studies teaser** — bg-bg. Counters in gold. Below: asymmetric layout — 1 large case study card left (60% width) + 2 stacked smaller right (40%). NOT 3x grid. Cards: `bg-surface border border-white/5 rounded-lg card-hover`. "Zobacz wszystkie →" link gold.
7. **Section 4: Dlaczego my** — bg-surface. Numbered list style (01, 02, 03, 04 in large gold Fraunces) with text. NOT card grid. Alternating or vertical list.
8. **Section 5: CTA Footer** — bg-bg. Large heading Fraunces: "Miałeś wypadek? Porozmawiajmy." Gold CTA button + phone number. Below: footer links in columns, muted text, social icons, copyright.
9. Cookie banner — dark themed.
10. Mobile sticky bar — dark themed with gold.
11. Script tags in correct order.

Key styling rules:
- ALL text on dark bg: `text-white` (primary) or `text-muted` (secondary)
- Gold for accents: numbers, links, CTA borders, selected states, icons
- Cards: `bg-surface` with `border border-white/5`, `card-hover` class
- NO `bg-warm`, `bg-white`, `text-navy`, `text-txt` — old palette is dead
- Use `fade-in` class instead of old `reveal` class

- [ ] **Step 4: Verify in browser** — open http://localhost:1111, check:
- Dark background renders
- Hero text animates word-by-word
- Nav is transparent, becomes solid on scroll, hides on scroll down
- Quiz works (all 5 steps, form validation, success screen)
- Count-up animates
- Case studies render asymmetrically
- Mobile: sticky bar visible, hamburger opens overlay

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: redesign homepage — dark theme, word reveal, asymmetric layout"
```

---

### Task 4: Subpage Template + uslugi.html + sukcesy.html + opinie.html

**Files:**
- Create: `uslugi.html`
- Create: `sukcesy.html`
- Create: `opinie.html`

These are NEW pages that didn't exist before (content was on index.html).

- [ ] **Step 1: Read the redesign spec** for subpage template structure

- [ ] **Step 2: Create subpage HTML template pattern**

Every subpage shares:
- Same `<head>` as index.html (Tailwind config, fonts, Lucide, styles.css)
- Same `<nav>` (with links to all pages — uslugi.html, sukcesy.html, kalkulator.html, blog/, kontakt.html)
- Same mobile menu overlay
- Breadcrumb: `<nav class="text-sm text-muted py-4">` with gold links
- Page hero: shorter than homepage — `py-24 lg:py-32 bg-bg`, large Fraunces title, muted subtext
- Content area
- CTA block: `bg-surface py-16`, large heading + gold button
- CTA Footer (same as homepage)
- Cookie banner + sticky bar
- Scripts

- [ ] **Step 3: Create `uslugi.html`**

Services listing page. NOT a card grid — use a list/stack layout:
- Each service: full-width row with Lucide icon (raw, no circle container) + title (Fraunces) + description + "Dowiedz się więcej →" gold link
- Subtle `border-b border-white/5` dividers between services
- 6 services: komunikacyjne, przy pracy, błędy medyczne, śmierć bliskiej, rolnictwo, inne
- Each links to its service subpage

- [ ] **Step 4: Create `sukcesy.html`**

Case studies page with filter. Preserve case filter JS logic (already in animations.js).
- Filter buttons: gold active state (bg-gold text-bg), surface-light inactive
- Cards: asymmetric — alternate between full-width featured cards and 2-column pairs
- Same 3 case studies data as before + space for more
- Each card: bg-surface, border white/5, before→after amounts, multiplier badge in gold

- [ ] **Step 5: Create `opinie.html`**

Testimonials page. NOT a carousel — full page layout:
- Large featured testimonial at top (big italic quote, gold quotation marks)
- Below: 2-column grid of remaining testimonials
- Each: bg-surface card, gold stars, italic quote, avatar initials in gold circle on black

- [ ] **Step 6: Verify all 3 pages in browser**

- [ ] **Step 7: Commit**

```bash
git add uslugi.html sukcesy.html opinie.html
git commit -m "feat: add services, case studies, and testimonials pages"
```

---

### Task 5: Rewrite kalkulator.html + kontakt.html + jak-dzialamy.html

**Files:**
- Rewrite: `kalkulator.html`
- Rewrite: `kontakt.html`
- Rewrite: `jak-dzialamy.html`

- [ ] **Step 1: Read existing files** to understand current content and script dependencies

- [ ] **Step 2: Rewrite `kalkulator.html`**

Dark theme version. Same calculator HTML logic (data-min/data-max on buttons, sliders, result display) but restyled:
- bg-bg body, bg-surface calculator container
- Option buttons: border-surface-light, selected: border-gold bg-gold/10
- Sliders: already styled by new CSS
- Result: bg-surface (not bg-navy), gold text for amounts
- CTA form: dark inputs
- Scripts: form-validation.js, cookie-consent.js, animations.js, analytics.js, navigation.js, calculator.js

- [ ] **Step 3: Rewrite `kontakt.html`**

Dark theme contact page:
- Left: contact info (gold icons, white text, muted labels) + Google Maps iframe
- Right: form with dark inputs (bg-surface, border-white/10, text-white, placeholder-muted)
- Error messages: text-error
- RODO checkboxes
- Scripts: form-validation.js, cookie-consent.js, analytics.js, navigation.js

- [ ] **Step 4: Rewrite `jak-dzialamy.html`**

Dark theme process page. NOT card grid — use a vertical timeline:
- Large gold step numbers (01, 02, 03, 04) with connecting gold line
- Each step: Fraunces title + Space Grotesk description + estimated time in muted
- Below timeline: "Dlaczego warto" section

- [ ] **Step 5: Verify all 3 pages, test calculator and contact form**

- [ ] **Step 6: Commit**

```bash
git add kalkulator.html kontakt.html jak-dzialamy.html
git commit -m "feat: redesign kalkulator, kontakt, jak-dzialamy pages"
```

---

### Task 6: Rewrite 5 Service Subpages

**Files:**
- Rewrite: `odszkodowania-komunikacyjne.html`
- Rewrite: `odszkodowania-wypadki-przy-pracy.html`
- Rewrite: `odszkodowania-bledy-medyczne.html`
- Rewrite: `odszkodowania-smierc-bliskiej-osoby.html`
- Rewrite: `odszkodowania-wypadki-rolnicze.html`

- [ ] **Step 1: Read one existing service subpage** to understand content structure (keep all content/copy)

- [ ] **Step 2: Create new service subpage template** with dark theme

Template structure:
- Shared head, nav, mobile menu (same as other pages)
- Breadcrumb (muted)
- Hero banner: bg-bg, py-20, large Fraunces H1, muted description, gold CTA button
- Content section: bg-bg, Fraunces H2s, white body text, gold checkmarks for lists
- Mini case study: bg-surface card with border-white/5, before→after amounts, gold multiplier
- FAQ: bg-surface accordion items, gold chevrons
- CTA block: large heading + gold button
- CTA Footer
- Scripts (analytics.js, animations.js, navigation.js)

- [ ] **Step 3: Apply template to all 5 service pages** keeping existing content (titles, descriptions, case study data, FAQ questions)

- [ ] **Step 4: Verify pages render correctly, FAQ accordion works**

- [ ] **Step 5: Commit**

```bash
git add odszkodowania-*.html
git commit -m "feat: redesign all 5 service subpages with dark theme"
```

---

### Task 7: Rewrite 404 + Polityka prywatności + Blog

**Files:**
- Rewrite: `404.html`
- Rewrite: `polityka-prywatnosci.html`
- Rewrite: `blog/index.html`

- [ ] **Step 1: Rewrite `404.html`**

Minimal dark page: large "404" in Fraunces (gold, semi-transparent), message in white, 2 buttons (gold outline).

- [ ] **Step 2: Rewrite `polityka-prywatnosci.html`**

Dark theme with readable contrast: white headings (Fraunces), muted body text, bg-bg. Keep all existing privacy policy content.

- [ ] **Step 3: Rewrite `blog/index.html`**

Dark theme blog listing: bg-surface cards with border-white/5, gold category tags, white titles, muted descriptions. Remember `../` prefix for assets.

- [ ] **Step 4: Verify all pages**

- [ ] **Step 5: Commit**

```bash
git add 404.html polityka-prywatnosci.html blog/index.html
git commit -m "feat: redesign 404, privacy policy, and blog pages"
```

---

### Task 8: Final QA + Deploy

**Files:**
- Possibly modify: any file for fixes

- [ ] **Step 1: Check all internal links** across all pages (nav, footer, CTAs, service cards)

- [ ] **Step 2: Test quiz flow** on homepage (all 5 steps + validation + success)

- [ ] **Step 3: Test calculator** on kalkulator.html (event select, injury multi-select, sliders, result, CTA form)

- [ ] **Step 4: Test contact form** on kontakt.html (validation, submit, success)

- [ ] **Step 5: Test FAQ accordion** on homepage and service subpages

- [ ] **Step 6: Test case study filter** on sukcesy.html

- [ ] **Step 7: Test mobile** — sticky bar, hamburger overlay, quiz on mobile, nav behavior

- [ ] **Step 8: Test nav scroll behavior** — transparent→solid→hide→show

- [ ] **Step 9: Test cookie consent** — banner shows, accept loads GA4, reject hides

- [ ] **Step 10: Test word-by-word hero animation** — loads on first visit

- [ ] **Step 11: Verify no old theme classes remain** — search for: `bg-warm`, `bg-navy`, `text-navy`, `text-txt`, `border-warm`, `bg-white`

```bash
grep -r "bg-warm\|bg-navy\|text-navy\|text-txt\|border-warm" --include="*.html" --include="*.js" --include="*.css" -l
```
Should return NO files (except possibly docs/).

- [ ] **Step 12: Fix any issues found**

- [ ] **Step 13: Commit and deploy**

```bash
git add -A
git commit -m "fix: final QA fixes for redesign"
vercel --prod --yes
```
