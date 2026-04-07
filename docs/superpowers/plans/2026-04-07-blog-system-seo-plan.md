# Blog System SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a blog template system with full SEO markup (Article, FAQPage, BreadcrumbList schema), sitemap.xml, robots.txt, category filtering on listing page, and internal linking structure.

**Architecture:** Two HTML templates (article + case study) in `blog/`, updated listing page with JS category filter, new `sitemap.xml` and `robots.txt` in project root. No build step — everything is static HTML. Templates use `_` prefix to indicate they are not published pages.

**Tech Stack:** Static HTML, Tailwind CSS via CDN, vanilla JS, Lucide Icons via CDN, Google Fonts (Fraunces + Space Grotesk)

**Spec:** `docs/superpowers/specs/2026-04-07-blog-system-seo-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `robots.txt` | Crawl directives + sitemap pointer |
| Create | `sitemap.xml` | All page URLs with lastmod + priority |
| Create | `blog/_szablon-artykul.html` | Article template: nav, breadcrumb, article header, TOC, body, FAQ, CTA, related articles, footer |
| Create | `blog/_szablon-case-study.html` | Case study template: nav, breadcrumb, result block, story sections, quote, CTA, related, footer |
| Modify | `blog/index.html` | Add category filter bar, update cards with links/dates/times, add CollectionPage schema |

Internal linking (service subpages → blog) is out of scope until real articles exist.

---

### Task 1: Create `robots.txt`

**Files:**
- Create: `robots.txt`

- [ ] **Step 1: Create the file**

```
User-agent: *
Allow: /
Sitemap: https://example.pl/sitemap.xml
```

- [ ] **Step 2: Verify file exists and has correct content**

Run: `cat robots.txt`
Expected: 3 lines — User-agent, Allow, Sitemap

- [ ] **Step 3: Commit**

```bash
git add robots.txt
git commit -m "feat: add robots.txt with sitemap reference"
```

---

### Task 2: Create `sitemap.xml`

**Files:**
- Create: `sitemap.xml`

- [ ] **Step 1: Create the sitemap with all existing pages**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main pages -->
  <url><loc>https://example.pl/</loc><lastmod>2026-04-07</lastmod><priority>1.0</priority></url>
  <url><loc>https://example.pl/uslugi.html</loc><lastmod>2026-04-07</lastmod><priority>0.8</priority></url>
  <url><loc>https://example.pl/jak-dzialamy.html</loc><lastmod>2026-04-07</lastmod><priority>0.7</priority></url>
  <url><loc>https://example.pl/kalkulator.html</loc><lastmod>2026-04-07</lastmod><priority>0.7</priority></url>
  <url><loc>https://example.pl/sukcesy.html</loc><lastmod>2026-04-07</lastmod><priority>0.8</priority></url>
  <url><loc>https://example.pl/kontakt.html</loc><lastmod>2026-04-07</lastmod><priority>0.7</priority></url>
  <url><loc>https://example.pl/opinie.html</loc><lastmod>2026-04-07</lastmod><priority>0.6</priority></url>

  <!-- Service subpages -->
  <url><loc>https://example.pl/odszkodowania-komunikacyjne.html</loc><lastmod>2026-04-07</lastmod><priority>0.9</priority></url>
  <url><loc>https://example.pl/odszkodowania-wypadki-przy-pracy.html</loc><lastmod>2026-04-07</lastmod><priority>0.9</priority></url>
  <url><loc>https://example.pl/odszkodowania-bledy-medyczne.html</loc><lastmod>2026-04-07</lastmod><priority>0.9</priority></url>
  <url><loc>https://example.pl/odszkodowania-smierc-bliskiej-osoby.html</loc><lastmod>2026-04-07</lastmod><priority>0.9</priority></url>
  <url><loc>https://example.pl/odszkodowania-wypadki-rolnicze.html</loc><lastmod>2026-04-07</lastmod><priority>0.9</priority></url>

  <!-- Blog -->
  <url><loc>https://example.pl/blog/</loc><lastmod>2026-04-07</lastmod><priority>0.8</priority></url>
  <!-- Add blog articles here as they are published -->

  <!-- Utility -->
  <url><loc>https://example.pl/polityka-prywatnosci.html</loc><lastmod>2026-04-07</lastmod><priority>0.3</priority></url>

  <!-- Do not add 404.html — error pages must not be indexed -->
</urlset>
```

- [ ] **Step 2: Validate XML syntax**

Run: `python3 -c "import xml.etree.ElementTree as ET; ET.parse('sitemap.xml'); print('Valid XML')"`
Expected: `Valid XML`

- [ ] **Step 3: Commit**

```bash
git add sitemap.xml
git commit -m "feat: add sitemap.xml with all existing pages"
```

---

### Task 3: Create article template (`blog/_szablon-artykul.html`)

**Files:**
- Create: `blog/_szablon-artykul.html`

**Reference files** (copy shared elements from these):
- Nav, mobile menu, sticky bar: copy from `blog/index.html` (lines 51-121) — these use `../` relative paths which is correct for `blog/` subfolder
- Footer: copy from `blog/index.html` (lines 221-273)
- Cookie banner: copy from `blog/index.html` (lines 276-284)
- FAQ accordion pattern: copy from `odszkodowania-komunikacyjne.html` (lines 199-221) — uses `.faq-toggle` / `.faq-answer` classes that `analytics.js` binds to
- Script load order from spec: `cookie-consent.js → i18n.js → animations.js → analytics.js → navigation.js`

- [ ] **Step 1: Create the full template file**

The template must include these sections in order:

**`<head>` section:**
- charset, viewport meta
- `<title>{Keyword phrase} | Odszkodowania</title>` — placeholder in curly braces
- `<meta name="description">` — placeholder
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical">` — placeholder URL
- OG tags: og:title, og:description, og:type=article, og:url, og:image (with comment about 1200x630px, fallback img/og-default.jpg)
- Tailwind CDN + `../js/tailwind-config.js`
- Google Fonts preconnect + stylesheet
- Lucide Icons CDN
- `../css/styles.css`
- Mobile menu transition style block (same as all pages)
- 3 JSON-LD script blocks:
  1. BreadcrumbList (3 levels: Strona główna → Baza wiedzy → {Article title})
  2. Article (headline, description, author Organization, publisher Organization, datePublished, dateModified, image, mainEntityOfPage)
  3. FAQPage (with placeholder Question/Answer pairs)

**`<body>` section — this order:**
1. Nav (copied from `blog/index.html`, blog link highlighted with `text-gold` class instead of `text-white/60`)
2. Mobile menu overlay (copied from `blog/index.html`)
3. Mobile sticky bottom bar (copied from `blog/index.html`)
4. `<main class="pt-20">` containing:
   - Breadcrumb bar: `bg-surface border-b border-white/5` div with `Strona główna › Baza wiedzy › {Tytuł artykułu}`
   - Article header section:
     - Category tag: `<span class="text-xs font-medium text-gold uppercase tracking-wider">{Poradnik}</span>`
     - `<h1 class="font-heading text-3xl lg:text-5xl font-bold text-white mb-4">{Tytuł artykułu}</h1>`
     - Date + read time: `<time datetime="YYYY-MM-DD" class="text-muted text-sm">{Data}</time> <span class="text-muted text-sm ml-4">{X} min czytania</span>`
   - Table of contents: `<nav>` with `<ul>` of anchor links to H2 sections, styled as a `bg-surface border border-white/5 rounded-lg p-6` box
   - Article body: `<article>` with prose styling. H2s use `font-heading text-2xl lg:text-3xl font-bold text-white mb-4`, H3s use `font-heading text-xl font-bold text-white mb-3`, paragraphs use `text-muted text-lg mb-6 leading-relaxed`
   - FAQ section: same accordion pattern as service subpages — outer div with `space-y-3`, each FAQ item is a `bg-surface border border-white/5 rounded-lg overflow-hidden` with `.faq-toggle` button and `.faq-answer` div
   - CTA box: `bg-surface border border-white/5 rounded-lg p-8 lg:p-12 text-center` — "Masz podobną sprawę?" heading + "Bezpłatna konsultacja" button linking to `../index.html#quiz`
   - Related articles: section with H2 "Powiązane artykuły" and 2-3 card links (same card style as listing page)
5. Footer (copied from `blog/index.html`)
6. Cookie banner (copied from `blog/index.html`)
7. Scripts in order:
   ```html
   <script src="../js/cookie-consent.js"></script>
   <script src="../js/i18n.js"></script>
   <script src="../js/animations.js"></script>
   <script src="../js/analytics.js"></script>
   <script src="../js/navigation.js"></script>
   <script>lucide.createIcons();</script>
   ```

**Important:** All placeholder values must be wrapped in `{curly braces}` and have an HTML comment explaining what to replace. Example: `<h1>{Tytuł artykułu}</h1> <!-- Replace with article H1, main keyword -->`

- [ ] **Step 2: Open in browser and verify layout**

Run: `python3 -m http.server 1111` then open `http://localhost:1111/blog/_szablon-artykul.html`

Verify:
- Nav renders correctly with blog link highlighted gold
- Breadcrumb shows 3 levels
- Article header has tag + H1 + date/read time
- TOC box renders
- FAQ accordion toggles work (click `.faq-toggle` buttons)
- CTA box renders with button
- Footer renders correctly
- Mobile: hamburger menu works, sticky bar shows

- [ ] **Step 3: Validate schema markup**

Open browser DevTools Console and run:
```javascript
document.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { JSON.parse(s.textContent); console.log('Valid:', JSON.parse(s.textContent)['@type']); } catch(e) { console.error('Invalid JSON-LD:', e); } });
```
Expected: 3 valid outputs — BreadcrumbList, Article, FAQPage

- [ ] **Step 4: Commit**

```bash
git add blog/_szablon-artykul.html
git commit -m "feat: add blog article template with SEO schema markup"
```

---

### Task 4: Create case study template (`blog/_szablon-case-study.html`)

**Files:**
- Create: `blog/_szablon-case-study.html`

**Reference:** Start from `blog/_szablon-artykul.html` (Task 3) and modify. Differences from article template:

- [ ] **Step 1: Copy article template and modify**

Changes from article template:

**`<head>` — schema blocks:**
- Keep BreadcrumbList (same 3 levels)
- Keep Article schema (same fields)
- **Remove** FAQPage schema entirely
- Add HTML comment: `<!-- No FAQ section on case studies -->`

**`<body>` — structural changes:**
- Category tag: hardcode `Case study` instead of `{Poradnik}`
- H1 format: `{Kwota} za {typ sprawy} — historia klienta` (with comment explaining format)
- **Remove** table of contents section
- **Add** result block between article header and body — immediately after H1:

```html
<!-- Result block -->
<div class="bg-surface border-l-4 border-gold rounded-lg p-6 lg:p-8 mb-12">
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
            <p class="text-muted text-xs uppercase tracking-wider mb-1">Uzyskana kwota</p>
            <p class="text-gold text-2xl lg:text-3xl font-bold font-heading">{85 000 zł}</p>
        </div>
        <div>
            <p class="text-muted text-xs uppercase tracking-wider mb-1">Typ sprawy</p>
            <p class="text-white font-semibold">{Wypadek przy pracy}</p>
        </div>
        <div>
            <p class="text-muted text-xs uppercase tracking-wider mb-1">Czas trwania</p>
            <p class="text-white font-semibold">{4 miesiące}</p>
        </div>
        <div>
            <p class="text-muted text-xs uppercase tracking-wider mb-1">Ubezpieczyciel</p>
            <p class="text-white font-semibold">{Nazwa}</p> <!-- Optional — remove if not applicable -->
        </div>
    </div>
</div>
```

- **Replace** free-form article body with fixed H2 structure:

```html
<h2 id="sytuacja" class="font-heading text-2xl lg:text-3xl font-bold text-white mb-4">Sytuacja klienta</h2>
<p class="text-muted text-lg mb-8 leading-relaxed">{Opis sytuacji...}</p>

<h2 id="wyzwanie" class="font-heading text-2xl lg:text-3xl font-bold text-white mb-4">Wyzwanie</h2>
<p class="text-muted text-lg mb-8 leading-relaxed">{Opis wyzwania, oferta ubezpieczyciela...}</p>

<h2 id="dzialania" class="font-heading text-2xl lg:text-3xl font-bold text-white mb-4">Nasze działania</h2>
<p class="text-muted text-lg mb-8 leading-relaxed">{Co firma zrobiła...}</p>

<h2 id="wynik" class="font-heading text-2xl lg:text-3xl font-bold text-white mb-4">Wynik</h2>
<p class="text-muted text-lg mb-8 leading-relaxed">{Finalna kwota, porównanie z ofertą...}</p>
```

- **Add** optional blockquote after body, before CTA:

```html
<!-- Optional client quote — remove if not available -->
<blockquote class="border-l-4 border-gold pl-6 py-4 my-12 bg-surface rounded-r-lg">
    <p class="text-white text-lg italic mb-3">{Cytat klienta...}</p>
    <cite class="text-muted text-sm not-italic">— {Imię klienta}</cite>
</blockquote>
```

- **Remove** FAQ section entirely
- Keep CTA box (same as article template)
- Keep Related articles section (same, but label "Powiązane" instead of "Powiązane artykuły")

- [ ] **Step 2: Open in browser and verify layout**

Run: open `http://localhost:1111/blog/_szablon-case-study.html`

Verify:
- Result block renders with 4-column grid (2 on mobile)
- Gold left border on result block is visible
- Fixed H2 sections render in order
- Blockquote has gold left border
- No FAQ section present
- No TOC present

- [ ] **Step 3: Validate schema markup**

Same DevTools check as Task 3.
Expected: 2 valid outputs — BreadcrumbList, Article (no FAQPage)

- [ ] **Step 4: Commit**

```bash
git add blog/_szablon-case-study.html
git commit -m "feat: add blog case study template with result block and Article schema"
```

---

### Task 5: Update listing page (`blog/index.html`)

**Files:**
- Modify: `blog/index.html`

This task has 3 parts: add CollectionPage schema, add category filter bar, update article cards.

- [ ] **Step 1: Add CollectionPage schema to `<head>`**

In `blog/index.html`, find the existing BreadcrumbList JSON-LD block (lines 37-46). **Keep it.** Add a second JSON-LD block right after it:

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Baza wiedzy",
    "description": "Porady prawne, poradniki dla poszkodowanych i case studies odszkodowawcze.",
    "url": "https://example.pl/blog/",
    "isPartOf": { "@type": "WebSite", "name": "Odszkodowania", "url": "https://example.pl/" }
}
</script>
```

- [ ] **Step 2: Add category filter bar above article grid**

Find the article grid container by searching for `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">` (do not rely on line numbers — they shift as you edit).

Insert this filter bar **before** the grid div, inside the `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`:

```html
<!-- Category filter -->
<div class="flex flex-wrap gap-3 mb-8" id="blog-filters">
    <button class="blog-filter-btn active px-4 py-2 rounded-full text-sm font-medium border border-gold text-gold transition-colors" data-filter="all">Wszystko</button>
    <button class="blog-filter-btn px-4 py-2 rounded-full text-sm font-medium border border-white/20 text-muted hover:border-gold hover:text-gold transition-colors" data-filter="poradnik">Poradniki</button>
    <button class="blog-filter-btn px-4 py-2 rounded-full text-sm font-medium border border-white/20 text-muted hover:border-gold hover:text-gold transition-colors" data-filter="prawo">Prawo</button>
    <button class="blog-filter-btn px-4 py-2 rounded-full text-sm font-medium border border-white/20 text-muted hover:border-gold hover:text-gold transition-colors" data-filter="case-study">Case studies</button>
    <button class="blog-filter-btn px-4 py-2 rounded-full text-sm font-medium border border-white/20 text-muted hover:border-gold hover:text-gold transition-colors" data-filter="krus">KRUS</button>
</div>
```

- [ ] **Step 3: Update article cards — wrap in `<a>`, add data-category, date, read time**

Replace each article card. Example for Article 1 (currently lines 149-156):

**Before:**
```html
<div class="bg-surface border border-white/5 rounded-lg overflow-hidden card-hover fade-in">
    <div class="p-6">
        <span class="text-xs font-medium text-gold uppercase tracking-wider">Poradnik</span>
        <h2 class="font-heading text-lg font-bold text-white mt-2 mb-2">Co robić po wypadku samochodowym?</h2>
        <p class="text-muted text-sm mb-4">Krok po kroku: od zabezpieczenia miejsca zdarzenia...</p>
        <span class="text-gold text-sm font-semibold">Czytaj dalej →</span>
    </div>
</div>
```

**After:**
```html
<a href="co-robic-po-wypadku.html" class="bg-surface border border-white/5 rounded-lg overflow-hidden card-hover fade-in block" data-category="poradnik">
    <div class="p-6">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gold uppercase tracking-wider">Poradnik</span>
            <span class="text-muted text-xs">5 min</span>
        </div>
        <h2 class="font-heading text-lg font-bold text-white mb-2">Co robić po wypadku samochodowym?</h2>
        <p class="text-muted text-sm mb-4">Krok po kroku: od zabezpieczenia miejsca zdarzenia po zgłoszenie roszczenia. Dowiedz się, jakie czynności są kluczowe w pierwszych godzinach po wypadku.</p>
        <div class="flex items-center justify-between">
            <time datetime="2026-04-07" class="text-muted text-xs">7 kwietnia 2026</time>
            <span class="text-gold text-sm font-semibold">Czytaj dalej →</span>
        </div>
    </div>
</a>
```

Apply this pattern to all 6 cards. Key changes per card:
- Outer `<div>` → `<a>` with `href` to article page (or `href="#"` for "Wkrótce" articles) and `class="block"` added
- Add `data-category="poradnik|prawo|case-study|krus"` attribute
- Add reading time in top-right corner
- Add `<time>` element at bottom-left
- Keep `data-i18n` attributes on all text elements
- For "Wkrótce" articles (4, 5, 6): keep the gold/50 "Wkrótce →" text, use `href="#"` and add `data-i18n` attributes

Category mapping for existing cards:
- Article 1: `data-category="poradnik"` — "Co robić po wypadku samochodowym?"
- Article 2: `data-category="prawo"` — "Przedawnienie roszczeń"
- Article 3: `data-category="poradnik"` — "Ubezpieczyciel zaniżył odszkodowanie"
- Article 4: `data-category="prawo"` — "Zadośćuczynienie vs. odszkodowanie"
- Article 5: `data-category="poradnik"` — "Jak dokumentować obrażenia"
- Article 6: `data-category="krus"` — "Wypadek w rolnictwie"

**Case study cards** get a gold amount badge. When a case study card is added to the listing, use this pattern:

```html
<a href="85000-za-wypadek-w-pracy.html" class="bg-surface border border-white/5 rounded-lg overflow-hidden card-hover fade-in block" data-category="case-study">
    <div class="p-6">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gold uppercase tracking-wider">Case study</span>
            <span class="text-muted text-xs">4 min</span>
        </div>
        <h2 class="font-heading text-lg font-bold text-white mb-2">85 000 zł za wypadek przy pracy</h2>
        <span class="inline-block bg-gold/10 text-gold text-sm font-bold px-3 py-1 rounded mb-3">85 000 zł</span>
        <p class="text-muted text-sm mb-4">Ubezpieczyciel oferował 12 000 zł. Uzyskaliśmy 7x więcej dla naszego klienta po wypadku w zakładzie produkcyjnym.</p>
        <div class="flex items-center justify-between">
            <time datetime="2026-04-07" class="text-muted text-xs">7 kwietnia 2026</time>
            <span class="text-gold text-sm font-semibold">Czytaj dalej →</span>
        </div>
    </div>
</a>
```

The key difference: case study cards include a `<span class="inline-block bg-gold/10 text-gold text-sm font-bold px-3 py-1 rounded mb-3">{kwota}</span>` badge between the H2 and the description. None of the 6 existing cards are case studies, so this is documented for when new case study articles are added.

- [ ] **Step 4: Add filter JS — inline script before closing `</body>`**

Add this script block before the existing `<script>` tags at the bottom of the file:

```html
<script>
// Blog category filter
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.blog-filter-btn');
    const cards = document.querySelectorAll('[data-category]');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => {
                b.classList.remove('active', 'border-gold', 'text-gold');
                b.classList.add('border-white/20', 'text-muted');
            });
            btn.classList.add('active', 'border-gold', 'text-gold');
            btn.classList.remove('border-white/20', 'text-muted');

            // Show/hide cards
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
</script>
```

- [ ] **Step 5: Add `animations.js` to script load order**

The current `blog/index.html` is missing `animations.js`. Find the script block at the bottom (line 286-289):

```html
<script src="../js/cookie-consent.js"></script>
<script src="../js/i18n.js"></script>
<script src="../js/analytics.js"></script>
<script src="../js/navigation.js"></script>
```

Add `animations.js` between `i18n.js` and `analytics.js`:

```html
<script src="../js/cookie-consent.js"></script>
<script src="../js/i18n.js"></script>
<script src="../js/animations.js"></script>
<script src="../js/analytics.js"></script>
<script src="../js/navigation.js"></script>
```

- [ ] **Step 6: Open in browser and test**

Open `http://localhost:1111/blog/`

Verify:
- Filter buttons render in a row
- Clicking "Poradniki" shows only poradnik cards (1, 3, 5)
- Clicking "Prawo" shows only prawo cards (2, 4)
- Clicking "KRUS" shows only KRUS card (6)
- Clicking "Wszystko" shows all cards
- Active filter button has gold border/text
- Cards are clickable links (cursor changes on hover)
- Date and read time visible on each card
- `.fade-in` animations work (scroll into view)

- [ ] **Step 7: Commit**

```bash
git add blog/index.html
git commit -m "feat: update blog listing with category filters, card links, CollectionPage schema"
```

---

### Task 6: Final verification

- [ ] **Step 1: Validate all JSON-LD across all new/modified files**

Run in browser console on each page:
- `blog/_szablon-artykul.html` — expect 3 schemas (BreadcrumbList, Article, FAQPage)
- `blog/_szablon-case-study.html` — expect 2 schemas (BreadcrumbList, Article)
- `blog/index.html` — expect 2 schemas (BreadcrumbList, CollectionPage)

- [ ] **Step 2: Validate sitemap XML**

Run: `python3 -c "import xml.etree.ElementTree as ET; ET.parse('sitemap.xml'); print('Valid')"`

- [ ] **Step 3: Check all file references are correct**

Run: verify no broken relative paths in templates:
```bash
grep -h 'src="\.\./\|href="\.\./\' blog/_szablon-artykul.html blog/_szablon-case-study.html | sort -u
```

All `../js/`, `../css/` paths should correspond to real files. Verify:
```bash
ls js/tailwind-config.js js/cookie-consent.js js/i18n.js js/animations.js js/analytics.js js/navigation.js css/styles.css
```

- [ ] **Step 4: Verify mobile layout on all new pages**

Open browser DevTools, toggle mobile viewport (375px wide):
- `blog/_szablon-artykul.html` — hamburger menu works, sticky bar shows, article readable
- `blog/_szablon-case-study.html` — result block stacks to 2 columns on mobile
- `blog/index.html` — filter buttons wrap, cards stack to single column

- [ ] **Step 5: Update CLAUDE.md if needed**

Check if CLAUDE.md `Page Structure` section needs updating to mention the two blog templates. If the blog section already mentions `blog/index.html`, add a note about the templates:

In the "Page Structure" bullet list, update the blog entry to:
```
- **`blog/index.html`** — blog listing with category filter (Poradniki/Prawo/Case studies/KRUS)
- **`blog/_szablon-artykul.html`** — template for guide/law articles (not published)
- **`blog/_szablon-case-study.html`** — template for case studies (not published)
```

Also add to the "Page Structure" section:
```
- **Utility pages**: ... `robots.txt`, `sitemap.xml`
```

- [ ] **Step 6: Final commit if any changes from verification**

```bash
git add blog/index.html blog/_szablon-artykul.html blog/_szablon-case-study.html CLAUDE.md
git commit -m "chore: final verification fixes for blog system"
```
