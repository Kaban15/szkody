# Blog System SEO — Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Scope:** Technical blog system with SEO optimization for a Polish compensation claims site

## Context

Static lead-generation site (plain HTML/CSS/JS on Vercel). Content is added via Claude Code — no CMS needed. Blog serves two purposes: SEO traffic from long-tail queries + building authority through case studies. This spec covers the technical system only; content strategy (topics, clusters, publication plan) is a separate spec.

## Decisions

- No CMS, no SSR, no build step — stays static HTML
- No pagination — JS "show more" when 20+ articles
- No category URL structure (no `/blog/poradniki/`) — flat `blog/slug.html`
- Templates prefixed with `_` are not published (e.g., `_szablon-artykul.html`)
- Sitemap manually maintained (updated when adding articles via Claude Code)
- Polish slugs without diacritics (e.g., `odszkodowanie-zlamanie-reki`)

---

## 1. File Structure & URLs

```
blog/
  index.html                        # listing page (exists, to be updated)
  _szablon-artykul.html             # template: guide/law article
  _szablon-case-study.html          # template: case study
  co-robic-po-wypadku.html          # example: guide article
  85000-za-wypadek-w-pracy.html     # example: case study

sitemap.xml                         # NEW — in project root
robots.txt                          # NEW — in project root
```

**URL pattern:** `blog/{slug-po-polsku}.html` — short, keyword-rich, no Polish diacritics.

---

## 2. Article Template (`_szablon-artykul.html`)

For guides (Poradnik), legal explainers (Prawo), and KRUS-related content.

### Head — meta & schema

```html
<title>{Keyword phrase} | Odszkodowania</title>                    <!-- max 60 chars -->
<meta name="description" content="{150-160 chars with CTA}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://example.pl/blog/{slug}.html">
<meta property="og:title" content="{same as title}">
<meta property="og:description" content="{same as meta description}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://example.pl/blog/{slug}.html">
<meta property="og:image" content="https://example.pl/img/blog/{slug}.jpg">  <!-- 1200x630px, fallback: img/og-default.jpg -->
```

**Schema.org JSON-LD blocks (3):**

1. **BreadcrumbList:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Strona glowna", "item": "https://example.pl/" },
    { "@type": "ListItem", "position": 2, "name": "Baza wiedzy", "item": "https://example.pl/blog/" },
    { "@type": "ListItem", "position": 3, "name": "{Article title}", "item": "https://example.pl/blog/{slug}.html" }
  ]
}
```

2. **Article:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{H1 text}",
  "description": "{meta description}",
  "author": { "@type": "Organization", "name": "Odszkodowania" },
  "publisher": { "@type": "Organization", "name": "Odszkodowania" },
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "image": "https://example.pl/img/blog/{slug}.jpg",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://example.pl/blog/{slug}.html" }
}
```

3. **FAQPage** (for the FAQ section at bottom):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{Question text}",
      "acceptedAnswer": { "@type": "Answer", "text": "{Answer text}" }
    }
  ]
}
```

### Body structure

1. **Nav** — same as all subpages (blog link highlighted gold)
2. **Breadcrumb** — visible, matching schema: Strona glowna > Baza wiedzy > {Title}
3. **Article header:**
   - Category tag (gold uppercase badge: "Poradnik" / "Prawo" / "KRUS")
   - `<h1>` — main keyword, one per page
   - Publication date (`<time datetime="YYYY-MM-DD">`) + estimated reading time
4. **Table of contents** — anchor links to H2 sections (helps Google "jump to" links)
5. **Article body** — proper H2/H3 hierarchy, no skipping levels
6. **FAQ section** — 3-5 questions with accordion (reuse existing FAQ pattern from service subpages), backed by FAQPage schema
7. **CTA box** — "Masz podobna sprawe? Bezplatna konsultacja" with link to `../index.html#quiz`
8. **Related articles** — 2-3 links to articles in same topic cluster
9. **Footer, sticky bar, cookie consent** — same as all subpages

### Scripts (load order)

```
../js/cookie-consent.js
../js/i18n.js
../js/animations.js       <!-- fade-in, scroll reveal -->
../js/analytics.js        <!-- contains FAQ accordion toggle -->
../js/navigation.js
lucide.createIcons()
```

Note: `form-validation.js` and `quiz.js` not needed on blog articles (no forms/quiz).

---

## 3. Case Study Template (`_szablon-case-study.html`)

For success stories with specific monetary outcomes.

### Differences from article template

| Aspect | Article | Case Study |
|--------|---------|------------|
| Schema | Article + FAQPage + Breadcrumb | Article + Breadcrumb (no FAQ) |
| Category tag | "Poradnik" / "Prawo" / "KRUS" | "Case study" |
| Table of contents | Yes | No (shorter content) |
| FAQ section | Yes (3-5 questions) | No |
| Result block | No | Yes (gold-accented) |
| Blockquote | No | Optional client quote |

### H1 format

Include amount and case type: e.g., "85 000 zl za wypadek przy pracy — historia klienta"

### Result block (after H1, before body)

Visually prominent box with gold border/accent:

- **Uzyskana kwota** — large, gold text
- **Typ sprawy** — e.g., "Wypadek przy pracy"
- **Czas trwania** — e.g., "4 miesiace"
- **Ubezpieczyciel** — optional

### Body H2 structure (fixed for all case studies)

1. "Sytuacja klienta" — what happened
2. "Wyzwanie" — why the case was difficult / insurer's initial offer
3. "Nasze dzialania" — what the firm did
4. "Wynik" — final amount, comparison with insurer's offer

### Optional blockquote

Client testimonial quote, styled consistently with testimonials elsewhere on the site.

Note: case study template has no FAQ section. The `analytics.js` FAQ accordion binding (`.faq-toggle`) is safe but inactive on these pages — add an HTML comment in the template: `<!-- No FAQ section on case studies -->`.

---

## 4. Listing Page Updates (`blog/index.html`)

### Category filter bar

Buttons above the article grid:
- "Wszystko" (default, active) | "Poradniki" | "Prawo" | "Case studies" | "KRUS"
- JS filters by `data-category` attribute on article cards
- Active filter: gold text/border. Inactive: muted.
- No page reload — show/hide with CSS classes.

### Updated article cards

Each card becomes an `<a>` wrapping the content (currently cards have no link).

Added to each card:
- `data-category="{category}"` attribute for filtering
- `<time datetime="YYYY-MM-DD">` visible publication date
- Reading time estimate (e.g., "5 min")
- For case study cards: gold badge with amount (e.g., "85 000 zl")

### Schema.org

Replace current BreadcrumbList-only schema with:

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Baza wiedzy",
  "description": "Porady prawne, poradniki dla poszkodowanych i case studies odszkodowawcze.",
  "url": "https://example.pl/blog/",
  "isPartOf": { "@type": "WebSite", "name": "Odszkodowania", "url": "https://example.pl/" }
}
```

Keep BreadcrumbList schema as well.

---

## 5. sitemap.xml

New file in project root. Manually updated when adding/removing pages. Update `example.pl` domain when domain is purchased.

`<lastmod>` is the one field Google actually uses from sitemaps — update it when a page is significantly changed.

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

---

## 6. robots.txt

New file in project root.

```
User-agent: *
Allow: /
Sitemap: https://example.pl/sitemap.xml
```

URL updated when domain is purchased.

---

## 7. Internal Linking Plan

| From | To | How |
|------|----|-----|
| Blog article | Service subpage | In-text link to relevant service (e.g., article about car accidents links to `odszkodowania-komunikacyjne.html`) |
| Blog article | Blog articles | "Powiazane artykuly" section at bottom (2-3 links, same topic cluster) |
| Service subpage | Blog articles | New "Przeczytaj tez" section with 2-3 related blog article links |
| Blog listing | Blog articles | Card links (currently missing — to be added) |
| Index.html | Blog | Nav link (exists). Future: "Z naszego bloga" section with 3 manually curated article cards (same card format as `blog/index.html`), updated when new articles are published. Out of scope for this spec — implement when blog has 3+ articles. |
| Case study | Case studies/articles | "Powiazane" section at bottom |

---

## 8. What's NOT in Scope

- CMS or any content management system
- SSR or any server-side rendering
- Build step, bundler, or static site generator
- Automatic listing generation from file system
- Pagination (JS "show more" added later if 20+ articles)
- Category pages at separate URLs (e.g., `/blog/poradniki/`)
- RSS feed (can add later)
- Image optimization pipeline
- Content strategy / keyword research (separate spec)
