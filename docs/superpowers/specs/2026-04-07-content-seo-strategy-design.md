# Content SEO Strategy — Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Scope:** Content strategy for a Polish compensation claims blog — topic clusters, article list, publication priority, internal linking map

## Context

Static lead-generation site for a Polish compensation claims firm. Blog system (templates, sitemap, listing page) was built in a separate spec. This spec defines WHAT content to create and HOW it connects. Content is added via Claude Code — no CMS. Geographic scope: all of Poland (no local SEO).

## Goals

1. **SEO visibility** — rank for long-tail queries in the compensation claims niche
2. **Topical authority** — Google sees the site as an expert resource on odszkodowania
3. **Content foundation** — 20 articles covering all 5 service areas + general legal topics

Conversion optimization is secondary at this stage — focus is on getting indexed and ranking.

## Strategy: Topic Clusters Around Service Pages

Each of the 5 existing service subpages (`odszkodowania-*.html`) serves as a **pillar page** — the center of a topic cluster. Blog articles answer specific questions within each cluster and link back to the pillar page.

One additional cluster ("Prawo ogólne") covers cross-cutting legal topics that link to multiple service pages.

---

## 1. Topic Clusters

### Cluster 1: Wypadki komunikacyjne
**Pillar:** `odszkodowania-komunikacyjne.html`

| # | Type | Title | Slug | Target keyword |
|---|------|-------|------|----------------|
| 1 | Poradnik | Co robić po wypadku samochodowym? | `co-robic-po-wypadku` | co robić po wypadku samochodowym |
| 2 | Poradnik | Ile odszkodowania za uszczerbek na zdrowiu po wypadku? | `ile-odszkodowania-za-uszczerbek` | ile odszkodowania za uszczerbek na zdrowiu |
| 3 | Poradnik | Jak uzyskać odszkodowanie za potrącenie pieszego? | `odszkodowanie-za-potracenie` | odszkodowanie za potrącenie pieszego |
| 4 | Case study | {Kwota} za wypadek na drodze krajowej | `wypadek-droga-krajowa` | — |

### Cluster 2: Wypadki przy pracy
**Pillar:** `odszkodowania-wypadki-przy-pracy.html`

| # | Type | Title | Slug | Target keyword |
|---|------|-------|------|----------------|
| 5 | Poradnik | Jak zgłosić wypadek przy pracy — krok po kroku | `jak-zglosic-wypadek-przy-pracy` | jak zgłosić wypadek przy pracy |
| 6 | Poradnik | Odszkodowanie za wypadek przy pracy od pracodawcy | `odszkodowanie-od-pracodawcy` | odszkodowanie za wypadek przy pracy od pracodawcy |
| 7 | Poradnik | Jednorazowe odszkodowanie z ZUS — ile wynosi? | `jednorazowe-odszkodowanie-zus` | jednorazowe odszkodowanie z ZUS |
| 8 | Case study | {Kwota} za wypadek w zakładzie produkcyjnym | `wypadek-zaklad-produkcyjny` | — |

### Cluster 3: Błędy medyczne
**Pillar:** `odszkodowania-bledy-medyczne.html`

| # | Type | Title | Slug | Target keyword |
|---|------|-------|------|----------------|
| 9 | Poradnik | Jak udowodnić błąd medyczny? | `jak-udowodnic-blad-medyczny` | jak udowodnić błąd medyczny |
| 10 | Poradnik | Odszkodowanie za błąd przy porodzie | `odszkodowanie-blad-przy-porodzie` | odszkodowanie za błąd przy porodzie |
| 11 | Case study | {Kwota} za błędną diagnozę | `bledna-diagnoza` | — |

### Cluster 4: Śmierć bliskiej osoby
**Pillar:** `odszkodowania-smierc-bliskiej-osoby.html`

| # | Type | Title | Slug | Target keyword |
|---|------|-------|------|----------------|
| 12 | Poradnik | Zadośćuczynienie po śmierci bliskiej osoby — ile i dla kogo? | `zadoscuczynienie-smierc-bliskiej-osoby` | zadośćuczynienie po śmierci bliskiej osoby |
| 13 | Poradnik | Kto może ubiegać się o odszkodowanie po śmierci rodzica? | `odszkodowanie-smierc-rodzica` | odszkodowanie po śmierci rodzica |

### Cluster 5: Wypadki rolnicze (KRUS)
**Pillar:** `odszkodowania-wypadki-rolnicze.html`

| # | Type | Title | Slug | Target keyword |
|---|------|-------|------|----------------|
| 14 | KRUS | Wypadek w rolnictwie — jak zgłosić do KRUS? | `wypadek-rolnictwo-krus` | wypadek w rolnictwie KRUS |
| 15 | KRUS | Odszkodowanie z KRUS za wypadek — ile można uzyskać? | `odszkodowanie-krus-ile` | odszkodowanie z KRUS |

### Cluster 6: Prawo ogólne
**Pillar:** none — articles link to the closest service page

| # | Type | Title | Slug | Target keyword |
|---|------|-------|------|----------------|
| 16 | Prawo | Przedawnienie roszczeń odszkodowawczych — ile masz czasu? | `przedawnienie-roszczen` | przedawnienie roszczeń odszkodowawczych |
| 17 | Prawo | Zadośćuczynienie vs. odszkodowanie — jaka różnica? | `zadoscuczynienie-vs-odszkodowanie` | zadośćuczynienie a odszkodowanie różnica |
| 18 | Poradnik | Ubezpieczyciel zaniżył odszkodowanie — co dalej? | `ubezpieczyciel-zanizyl-odszkodowanie` | ubezpieczyciel zaniżył odszkodowanie |
| 19 | Poradnik | Jak dokumentować obrażenia po wypadku? | `jak-dokumentowac-obrazenia` | dokumentowanie obrażeń po wypadku |
| 20 | Poradnik | Ile kosztuje prawnik od odszkodowań? | `ile-kosztuje-prawnik-odszkodowania` | ile kosztuje prawnik od odszkodowań |

**Total: 20 articles** (17 guides/law + 3 case studies)

---

## 2. Publication Priority

Articles ordered by impact. Logic: existing blog placeholders first, then highest search volume clusters, then gap-fill, then case studies (need real data).

### Wave 1 — Existing placeholders (5 articles)
These match the 5 placeholder cards currently on `blog/index.html` (cards 1-3 have "Czytaj dalej", cards 4-6 show "Wkrótce"). Verify slugs match before publishing. Article #1 (`co-robic-po-wypadku`) already has an `href` on the listing page.

1. `co-robic-po-wypadku` — strongest keyword, placeholder exists
2. `przedawnienie-roszczen` — placeholder exists
3. `ubezpieczyciel-zanizyl-odszkodowanie` — placeholder exists
4. `jak-dokumentowac-obrazenia` — placeholder exists
5. `wypadek-rolnictwo-krus` — placeholder exists

### Wave 2 — High-volume clusters (5 articles)
Komunikacyjne and wypadki-przy-pracy clusters have the highest search volume.

6. `ile-odszkodowania-za-uszczerbek`
7. `jak-zglosic-wypadek-przy-pracy`
8. `jednorazowe-odszkodowanie-zus`
9. `odszkodowanie-od-pracodawcy`
10. `zadoscuczynienie-vs-odszkodowanie`

### Wave 3 — Cluster completion (7 articles)
Fill remaining clusters to build topical authority across all service areas.

11. `odszkodowanie-za-potracenie`
12. `jak-udowodnic-blad-medyczny`
13. `ile-kosztuje-prawnik-odszkodowania`
14. `zadoscuczynienie-smierc-bliskiej-osoby`
15. `odszkodowanie-smierc-rodzica`
16. `odszkodowanie-blad-przy-porodzie`
17. `odszkodowanie-krus-ile`

### Wave 4 — Case studies (3 articles)
Require real or realistic case data. Publish when data is available. Case study slugs are finalized when data is provided (slug should include the amount, e.g., `85000-za-wypadek-w-pracy`). Amount format in titles/badges: "85 000 zł" (space-separated thousands). Until data is provided, case study cards should NOT appear on `blog/index.html`.

18. `wypadek-droga-krajowa`
19. `wypadek-zaklad-produkcyjny`
20. `bledna-diagnoza`

**No fixed schedule.** Waves indicate priority order, not deadlines.

---

## 3. Internal Linking Map

### 3a. Article → Pillar page

Every article includes a natural in-text link to its pillar page (service subpage). The link uses descriptive anchor text, not "kliknij tutaj".

| Article slug | Links to pillar |
|-------------|-----------------|
| co-robic-po-wypadku | odszkodowania-komunikacyjne.html |
| ile-odszkodowania-za-uszczerbek | odszkodowania-komunikacyjne.html |
| odszkodowanie-za-potracenie | odszkodowania-komunikacyjne.html |
| wypadek-droga-krajowa | odszkodowania-komunikacyjne.html |
| jak-zglosic-wypadek-przy-pracy | odszkodowania-wypadki-przy-pracy.html |
| odszkodowanie-od-pracodawcy | odszkodowania-wypadki-przy-pracy.html |
| jednorazowe-odszkodowanie-zus | odszkodowania-wypadki-przy-pracy.html |
| wypadek-zaklad-produkcyjny | odszkodowania-wypadki-przy-pracy.html |
| jak-udowodnic-blad-medyczny | odszkodowania-bledy-medyczne.html |
| odszkodowanie-blad-przy-porodzie | odszkodowania-bledy-medyczne.html |
| bledna-diagnoza | odszkodowania-bledy-medyczne.html |
| zadoscuczynienie-smierc-bliskiej-osoby | odszkodowania-smierc-bliskiej-osoby.html |
| odszkodowanie-smierc-rodzica | odszkodowania-smierc-bliskiej-osoby.html |
| wypadek-rolnictwo-krus | odszkodowania-wypadki-rolnicze.html |
| odszkodowanie-krus-ile | odszkodowania-wypadki-rolnicze.html |
| przedawnienie-roszczen | odszkodowania-komunikacyjne.html |
| zadoscuczynienie-vs-odszkodowanie | odszkodowania-komunikacyjne.html |
| ubezpieczyciel-zanizyl-odszkodowanie | odszkodowania-komunikacyjne.html |
| jak-dokumentowac-obrazenia | odszkodowania-komunikacyjne.html |
| ile-kosztuje-prawnik-odszkodowania | jak-dzialamy.html (intentional exception — cost/process topic fits "how we work" better than any service page) |

### 3b. Article → Related articles

Each article's "Powiązane artykuły" section links to 2-3 articles from the same cluster. General cluster (16-20) articles serve as bridges between clusters by linking to articles from different service clusters.

Example linking for Cluster 1 (komunikacyjne):
- `co-robic-po-wypadku` → ile-odszkodowania-za-uszczerbek, odszkodowanie-za-potracenie
- `ile-odszkodowania-za-uszczerbek` → co-robic-po-wypadku, ubezpieczyciel-zanizyl-odszkodowanie
- `odszkodowanie-za-potracenie` → co-robic-po-wypadku, jak-dokumentowac-obrazenia

Related articles are populated as articles are published. Empty related section is acceptable when an article is the first in its cluster.

### 3c. Pillar page → Articles

When a cluster has 2+ published articles, add a "Przeczytaj też" section on the pillar page (service subpage) with links to its articles. This is done during article publication, not upfront.

---

## 4. Article Content Guidelines

### Guide articles (Poradnik)
- **Length:** 1000-1500 words
- **Structure:** H1 (keyword), 3-5 H2 sections, FAQ (3-5 questions with FAQPage schema)
- **Tone:** professional but accessible, Polish language, direct ("Ty" form)
- **Content:** actionable advice, specific numbers where possible (amounts, deadlines, percentages)
- **CTA:** "Masz podobną sprawę? Bezpłatna konsultacja" box at bottom

### Law articles (Prawo)
- **Length:** 800-1200 words
- **Structure:** same as guide but more focused on legal concepts
- **Content:** explain legal terms in plain language, cite relevant Polish law articles (Kodeks cywilny, etc.)

### Case studies
- **Length:** 600-800 words
- **Structure:** fixed H2s (Sytuacja klienta / Wyzwanie / Nasze działania / Wynik)
- **Content:** specific numbers (amount obtained, insurer's offer, multiplier), timeline
- **Data:** provided by owner when available — placeholder until then

### SEO per article
- Title tag: keyword + brand, max 60 chars
- Meta description: 150-160 chars, includes CTA
- H1: contains primary keyword
- URL slug: keyword-based, no Polish diacritics
- Schema: Article + FAQPage (guides) or Article only (case studies) + BreadcrumbList
- Internal links: 1 to pillar page (in-text), 2-3 related articles (bottom section)

---

## 5. What's NOT in Scope

- Local SEO (no city-specific pages or keywords)
- Link building (external backlinks strategy)
- Social media content strategy
- Paid advertising / SEM
- Content calendar with fixed dates
- Image/infographic creation
- Video content
- Competitor keyword analysis tools (Ahrefs, SEMrush)
- Automated content generation

## Technical Note

Blog pages load `analytics.js` without `form-validation.js`. This is safe because `analytics.js` only calls `window.formValidation` inside `if (contactForm)` guard — blog pages have no `#contact-form` element, so that code path is never reached.
