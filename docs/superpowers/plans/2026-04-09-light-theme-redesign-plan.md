# Light Theme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the dark theme to a light warm-cream theme while preserving gold + orange CTA brand identity, replacing serif with Plus Jakarta Sans, tightening spacing, and unifying component styles.

**Architecture:** Primarily visual change — modify Tailwind config (palette + font), CSS (hardcoded colors), and Tailwind classes across 37 HTML files. One JS exception: `quiz.js` selected-state class toggles need updating. Big Bang approach — single cohesive diff.

**Tech Stack:** Tailwind CSS via CDN, vanilla HTML/CSS, Plus Jakarta Sans via Google Fonts

**Spec:** `docs/superpowers/specs/2026-04-09-light-theme-redesign-design.md`

---

### Task 1: Update Tailwind Config + CSS Foundation

**Files:**
- Modify: `js/tailwind-config.js`
- Modify: `css/styles.css`

These two files are the foundation — once changed, Tailwind token classes (`bg-bg`, `text-text`, `bg-surface`, etc.) will automatically resolve to light values across all pages. Hardcoded CSS values need manual update.

- [ ] **Step 1: Update `js/tailwind-config.js` — new palette + font**

Replace the entire config:

```js
tailwind.config = {
    theme: {
        extend: {
            colors: {
                bg: '#FDFBF7',
                surface: '#F5F0E8',
                'surface-light': '#FFFFFF',
                gold: '#D4AF37',
                'gold-light': '#E8C867',
                muted: '#8A7D6F',
                error: '#EF4444',
                cta: '#E8652D',
                'cta-hover': '#D4561F',
                text: '#1A1008',
                line: '#EDE7DA',
            },
            fontFamily: {
                heading: ['"Plus Jakarta Sans"', 'sans-serif'],
                body: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
        },
    },
}
```

- [ ] **Step 2: Update `css/styles.css` — hardcoded colors**

Replace these values (line numbers from current file):

| Line | Current | New |
|------|---------|-----|
| 6 | `background: #08080F;` | `background: #FDFBF7;` |
| 7 | `color: #E8E2D6;` | `color: #1A1008;` |
| 68 | `background: #1C1C2E;` (range track) | `background: #F5F0E8;` |
| 80 | `border: 3px solid #08080F;` (webkit thumb) | `border: 3px solid #FDFBF7;` |
| 90 | `border: 3px solid #08080F;` (moz thumb) | `border: 3px solid #FDFBF7;` |
| 111 | `background-color: rgba(8, 8, 15, 0.95);` (nav-solid) | `background-color: rgba(253, 251, 247, 0.95);` |
| 113 | `border-bottom: 1px solid rgba(212, 175, 55, 0.1);` | `border-bottom: 1px solid rgba(237, 231, 218, 0.5);` |
| 43 | `transform: translateY(-2px);` (card-hover) | `transform: translateY(-1px);` |

- [ ] **Step 3: Verify config loads correctly**

Run: `python3 -m http.server 1111` and open http://localhost:1111
Expected: Page background is warm cream (#FDFBF7), body text is dark brown. Fonts may still look wrong (HTML still loads Fraunces) but Tailwind tokens should resolve correctly.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: All 26 tests pass (tests don't check colors)

- [ ] **Step 5: Commit**

```bash
git add js/tailwind-config.js css/styles.css
git commit -m "refactor: update Tailwind config and CSS to light warm-cream theme"
```

---

### Task 2: Update `index.html` + Quiz JS — Full Theme Conversion

**Files:**
- Modify: `index.html`
- Modify: `js/quiz.js` (selected-state class toggles only)

This is the main page and the most complex — it has every component type (ticker, nav, hero, trust bar, quiz, process, case studies, testimonials, FAQ, CTA, footer, floating buttons). Use it as the reference for all other pages.

- [ ] **Step 1: Replace Google Fonts link**

Find the two `<link>` tags loading Fraunces and Space Grotesk:

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Replace with:

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update hero section**

In the hero `<section>`:
- `min-h-screen` → `min-h-[85vh]`
- `py-24` → `py-20`
- h1: `font-bold` → `font-extrabold`

- [ ] **Step 3: Apply color class replacements throughout the file**

Systematic replacements (context-aware, NOT blind find-replace):

**Text colors:**
- `text-white` on headings, labels, nav links → `text-text`
- `text-white/60` → `text-text/60`
- `text-white` on CTA button text (e.g. `bg-cta ... text-white`) → **KEEP as `text-white`** (white text on orange button stays)

**Borders:**
- `border-white/10` → `border-line`
- `border-white/5` → `border-line/50`
- `border-white/20` → `border-line`

**Backgrounds:**
- `hover:bg-white/5` → `hover:bg-surface`

**Nav hamburger:**
- `text-white p-2` on hamburger button → `text-text p-2`
- Mobile menu close button: `text-white` → `text-text`

- [ ] **Step 4: Update quiz options + form inputs**

**Quiz options** (all `<button class="quiz-option ...">` elements):
- `rounded-lg border border-white/10 ... bg-surface` → `rounded-xl shadow-sm bg-surface-light`
- `hover:border-gold` → `hover:ring-2 hover:ring-gold`

**Quiz selected state — requires `js/quiz.js` update (exception to "zero JS changes"):**
The quiz selection logic in `js/quiz.js:77-83` toggles `border-gold`, `bg-gold/10`, and `border-white/10` classes. Update to match new design:
- Line 77: `o.classList.remove('border-gold', 'bg-gold/10')` → `o.classList.remove('ring-2', 'ring-gold', 'shadow-md')`
- Line 78: `o.classList.add('border-white/10')` → remove this line (no border on deselect — shadow-sm is in HTML)
- Line 82: `btn.classList.remove('border-white/10')` → remove this line
- Line 83: `btn.classList.add('border-gold', 'bg-gold/10')` → `btn.classList.add('ring-2', 'ring-gold', 'shadow-md')`

**Quiz form inputs** (step 5 contact form):
- `rounded-lg bg-surface border border-white/10 text-white placeholder-muted` → `rounded-xl bg-surface-light border border-line text-text placeholder-muted`
- Add `focus:ring-2 focus:ring-gold/20` alongside existing `focus:border-gold`

**Quiz next/back buttons:**
- `rounded` → `rounded-lg`
- Back button: `border-white/20` → `border-line`

- [ ] **Step 5: Update spacing throughout**

- Section `py-16 lg:py-24` → `py-12 lg:py-16` (trust bar, quiz, process, social proof, testimonials, FAQ, CTA sections)
- `gap-6` → `gap-4` (trust bar items, hero checks, card grids)
- `mb-10` / `mb-12` → `mb-8` (section heading margins)
- `space-y-6` → `space-y-4` (mobile menu links, quiz step 2-4 options)

- [ ] **Step 6: Update component styles**

**Cards with `.card-hover`:**
- Add `rounded-xl shadow-sm` alongside `card-hover`
- Remove `border border-white/10` if present

**CTA buttons:**
- Primary (orange): `rounded` → `rounded-lg`, add `hover:shadow-lg hover:shadow-cta/30`
- Secondary (gold border): `rounded` → `rounded-lg`

**Sticky bottom bar:**
- `border-white/10` → `border-line`

- [ ] **Step 7: Visual verification**

Open http://localhost:1111 and check:
- [ ] Nav renders with cream backdrop on scroll
- [ ] Hero text is dark brown on cream bg
- [ ] Trust bar shows gold accents correctly
- [ ] Quiz options have rounded-xl with subtle shadow
- [ ] CTA buttons are orange with rounded-lg
- [ ] FAQ accordion text is readable (dark on light)
- [ ] Floating WhatsApp/phone buttons visible
- [ ] Mobile menu opens with cream overlay

- [ ] **Step 8: Run tests**

Run: `npm test`
Expected: All 26 tests pass

- [ ] **Step 9: Commit**

```bash
git add index.html js/quiz.js
git commit -m "refactor: convert index.html to light theme with new typography and spacing"
```

---

### Task 3: Update Main Pages (8 files)

**Files:**
- Modify: `uslugi.html`, `sukcesy.html`, `opinie.html`, `kontakt.html`, `kalkulator.html`, `jak-dzialamy.html`, `404.html`, `polityka-prywatnosci.html`

These pages share the same nav, footer, and sticky bar as index.html. Apply the same patterns established in Task 2.

- [ ] **Step 1: Replace Google Fonts link in all 8 files**

Same replacement as Task 2 Step 1 — swap Fraunces+Space Grotesk for Plus Jakarta Sans.

- [ ] **Step 2: Apply color class replacements in all 8 files**

Same patterns as Task 2 Step 3:
- `text-white` (headings/labels) → `text-text` (keep `text-white` on CTA button text)
- `text-white/60` → `text-text/60`
- `border-white/10` → `border-line`
- `border-white/5` → `border-line/50`
- `border-white/20` → `border-line`
- `hover:bg-white/5` → `hover:bg-surface`
- `bg-surface` on cards/containers → `bg-surface-light shadow-sm` (where cards need elevation)
- Nav hamburger `text-white` → `text-text`
- CTA primary buttons: `rounded` → `rounded-lg`, add `hover:shadow-lg hover:shadow-cta/30`

- [ ] **Step 3: Update spacing in all 8 files**

- `py-16 lg:py-24` → `py-12 lg:py-16`
- `gap-6` → `gap-4` (where used in section grids)
- `mb-10` / `mb-12` → `mb-8` (section heading margins)
- `space-y-6` → `space-y-4` (where applicable)

- [ ] **Step 4: Update component styles**

Per-file specifics:
- **`kalkulator.html`:** Range slider uses Tailwind config colors (auto-updated), but check `bg-surface` on calculator container → may need `bg-surface-light shadow-sm` for the card. Form inputs: same pattern as quiz inputs.
- **`kontakt.html`:** Contact form inputs → `rounded-xl bg-surface-light border border-line text-text placeholder-muted focus:ring-2 focus:ring-gold/20`
- **`sukcesy.html`:** Case study cards → `rounded-xl shadow-sm`, remove `border-white/10`
- **`opinie.html`:** Testimonial cards → `rounded-xl shadow-sm`
- **`404.html`:** Minimal — just nav/footer + centered message. Color replacements only.
- **`polityka-prywatnosci.html`:** Text-heavy page — color replacements + spacing.

- [ ] **Step 5: Visual spot-check**

Open each page in browser and verify:
- Nav + footer consistent with index.html
- Page-specific content (calculator, contact form, cards) looks correct
- No `text-white` remnants making text invisible on light bg

- [ ] **Step 6: Commit**

```bash
git add uslugi.html sukcesy.html opinie.html kontakt.html kalkulator.html jak-dzialamy.html 404.html polityka-prywatnosci.html
git commit -m "refactor: convert 8 main pages to light theme"
```

---

### Task 4: Update Service Subpages (5 files)

**Files:**
- Modify: `odszkodowania-bledy-medyczne.html`, `odszkodowania-komunikacyjne.html`, `odszkodowania-smierc-bliskiej-osoby.html`, `odszkodowania-wypadki-przy-pracy.html`, `odszkodowania-wypadki-rolnicze.html`

All 5 follow the same template: nav, breadcrumb, hero, content, mini case study, FAQ, CTA, footer. Same patterns as Task 3.

- [ ] **Step 1: Replace Google Fonts link in all 5 files**

- [ ] **Step 2: Apply color class replacements in all 5 files**

Same patterns. Pay attention to:
- Breadcrumb links (likely `text-white/60` → `text-text/60`)
- Mini case study cards → `rounded-xl shadow-sm` (use `bg-surface-light` where cards had `bg-surface`)
- FAQ items → `border-line` instead of `border-white/10`
- Content section text colors
- CTA primary buttons: `rounded` → `rounded-lg`, add `hover:shadow-lg hover:shadow-cta/30`

- [ ] **Step 3: Update spacing in all 5 files**

- Section padding: `py-16 lg:py-24` → `py-12 lg:py-16`
- Content spacing: `mb-6`/`mb-8` → `mb-4`

- [ ] **Step 4: Visual spot-check**

Open one service page (e.g., `odszkodowania-komunikacyjne.html`) and verify the breadcrumb, hero, content, mini case study, FAQ, CTA, and footer all render correctly on light theme.

- [ ] **Step 5: Commit**

```bash
git add odszkodowania-*.html
git commit -m "refactor: convert 5 service subpages to light theme"
```

---

### Task 5: Update Blog Pages (23 files)

**Files:**
- Modify: `blog/index.html` (listing page)
- Modify: `blog/_szablon-artykul.html`, `blog/_szablon-case-study.html` (templates)
- Modify: 20 blog articles in `blog/`

Blog pages have simpler structure (no quiz/calculator) but they share nav + footer. The blog listing has category filter cards.

- [ ] **Step 1: Update `blog/index.html` first**

- Replace Google Fonts link
- Color replacements (same patterns)
- Category filter buttons: `rounded-lg bg-surface` (ghost button pattern), update border/bg colors
- Article cards: `rounded-xl shadow-sm bg-surface-light`, remove dark borders
- CTA primary buttons: `rounded` → `rounded-lg`, add `hover:shadow-lg hover:shadow-cta/30`
- Spacing compression

- [ ] **Step 2: Update both templates**

- `blog/_szablon-artykul.html`: Google Fonts, color replacements, spacing
- `blog/_szablon-case-study.html`: same treatment

These templates have `{placeholders}` — change only Tailwind classes, don't touch placeholder text.

- [ ] **Step 3: Update all 20 blog articles**

All articles follow the same structure from the templates. Apply identical changes to each:
- Google Fonts link swap
- `text-white` → `text-text` (headings, labels)
- `border-white/X` → `border-line`
- `text-white/60` → `text-text/60`
- `hover:bg-white/5` → `hover:bg-surface`
- `py-16 lg:py-24` → `py-12 lg:py-16`
- Nav hamburger `text-white` → `text-text`

Files:
```
blog/co-robic-po-wypadku.html
blog/ile-kosztuje-prawnik-odszkodowania.html
blog/ile-odszkodowania-za-uszczerbek.html
blog/jak-dokumentowac-obrazenia.html
blog/jak-udowodnic-blad-medyczny.html
blog/jak-zglosic-wypadek-przy-pracy.html
blog/jednorazowe-odszkodowanie-zus.html
blog/odszkodowanie-blad-przy-porodzie.html
blog/odszkodowanie-krus-ile.html
blog/odszkodowanie-od-pracodawcy.html
blog/odszkodowanie-smierc-rodzica.html
blog/odszkodowanie-za-potracenie.html
blog/przedawnienie-roszczen.html
blog/ubezpieczyciel-zanizyl-odszkodowanie.html
blog/wypadek-rolnictwo-krus.html
blog/zadoscuczynienie-smierc-bliskiej-osoby.html
blog/zadoscuczynienie-vs-odszkodowanie.html
blog/120000-za-wypadek-na-drodze-krajowej.html
blog/200000-za-bledna-diagnoze.html
blog/85000-za-wypadek-w-zakladzie-produkcyjnym.html
```

- [ ] **Step 4: Visual spot-check**

- Open `blog/index.html` — category filter, article cards render correctly
- Open one guide article — content readable, related articles section correct
- Open one case study article — same checks

- [ ] **Step 5: Commit**

```bash
git add blog/
git commit -m "refactor: convert blog listing, templates, and 20 articles to light theme"
```

---

### Task 6: Final Verification + CLAUDE.md Update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All 26 tests pass

- [ ] **Step 2: Full visual QA**

Open http://localhost:1111 and check these pages:
- [ ] `index.html` — all sections, quiz flow, FAQ accordion, mobile menu
- [ ] `kalkulator.html` — range slider renders with cream theme
- [ ] `kontakt.html` — contact form inputs
- [ ] `blog/index.html` — category filter, article cards
- [ ] One blog article — content readability
- [ ] One service subpage — breadcrumb, FAQ

Check for:
- No invisible text (white on cream)
- No leftover dark-theme borders/backgrounds
- Gold and orange accents visible and contrasting
- Mobile responsive (check at 375px width)

- [ ] **Step 3: Update CLAUDE.md**

Update these sections to reflect the new design:

**Color Palette section:** Replace old hex values with new ones:
- `bg` (#FDFBF7) — warm cream page background
- `surface` (#F5F0E8) — alternate section backgrounds
- `surface-light` (#FFFFFF) — cards, inputs, elevated elements
- `gold`, `gold-light`, `cta`, `cta-hover` — unchanged
- `text` (#1A1008) — dark brown body text
- `muted` (#8A7D6F) — warm gray secondary text
- `line` (#EDE7DA) — borders and dividers (NEW)
- Remove `error` from palette list if not updated

**Google Fonts line:** Update to "Plus Jakarta Sans (headings + body)"

**Key Design Patterns section:**
- "Dark premium theme" → "Light warm-cream theme with gold accents"
- Update card-hover description if needed

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for light theme redesign"
```
