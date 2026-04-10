# Votum-Style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `index.html` to match the Votum S.A. corporate layout — dark hero, stats, colored service cards, simple contact form, testimonial quote, dark footer.

**Architecture:** Single-page rewrite of `index.html` with new v2-* color tokens in shared Tailwind config (old tokens preserved for subpages). Page-scoped CSS overrides for nav and body. No JS file changes — existing scripts handle missing elements gracefully via guards.

**Tech Stack:** Tailwind CSS CDN, Lucide Icons CDN, Poppins (Google Fonts), vanilla JS (existing `form-validation.js`, `navigation.js`, `animations.js`, `cookie-consent.js`, `analytics.js`).

**Spec:** `docs/superpowers/specs/2026-04-10-votum-redesign-design.md`

---

### Task 1: Add v2-* color tokens to Tailwind config

**Files:**
- Modify: `js/tailwind-config.js`

- [ ] **Step 1: Add v2 color tokens alongside existing tokens**

Open `js/tailwind-config.js` and add these colors inside `theme.extend.colors`:

```javascript
'v2-bg': '#FFFFFF',
'v2-surface': '#F5F5F5',
'v2-text': '#1a1a2e',
'v2-muted': '#6b7280',
'v2-line': '#e5e7eb',
'v2-cta': '#dc2626',
'v2-cta-hover': '#b91c1c',
'v2-hero': '#1a1a2e',
'v2-footer': '#1a1a2e',
```

All existing tokens (`bg`, `surface`, `gold`, `cta`, etc.) must remain unchanged.

- [ ] **Step 2: Verify subpages still work**

Run: `python3 -m http.server 1111`
Open `http://localhost:1111/uslugi.html` — verify cream/gold styling is intact.

- [ ] **Step 3: Commit**

```bash
git add js/tailwind-config.js
git commit -m "feat: add v2 color tokens for Votum redesign"
```

---

### Task 2: Add page-scoped CSS overrides for index.html

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add v2 nav-solid override**

At the end of `css/styles.css`, add a scoped block for pages with `body.v2-theme`:

```css
/* === V2 Theme (Votum redesign — index.html only) === */

body.v2-theme {
    background: #FFFFFF;
    color: #1a1a2e;
}

body.v2-theme #main-nav.nav-solid {
    background-color: rgba(255, 255, 255, 0.95);
    border-bottom-color: rgba(229, 231, 235, 0.5);
}

body.v2-theme #scroll-to-top {
    background-color: #FFFFFF;
    border-color: #e5e7eb;
    color: #6b7280;
}

body.v2-theme #scroll-to-top:hover {
    background-color: #dc2626;
    border-color: #dc2626;
    color: #FFFFFF;
}

/* V2 nav link colors — use !important to override Tailwind utility classes */
body.v2-theme #main-nav.nav-solid a,
body.v2-theme #main-nav.nav-solid button,
body.v2-theme #main-nav.nav-solid #nav-logo {
    color: #1a1a2e !important;
}

body.v2-theme #main-nav.nav-solid a:hover {
    color: #dc2626 !important;
}

/* V2 form validation error border — override old orange cta token */
body.v2-theme .border-cta {
    border-color: #dc2626 !important;
}

/* V2 service card hover */
.v2-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v2-card:hover {
    transform: scale(1.02);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* V2 count-up — reuse existing .count-up.visible */
```

- [ ] **Step 2: Commit**

```bash
git add css/styles.css
git commit -m "feat: add v2 theme CSS overrides for Votum redesign"
```

---

### Task 3: Rewrite index.html — Head and Header

**Files:**
- Modify: `index.html`

This is the start of the full rewrite. Back up the existing file first.

- [ ] **Step 1: Back up existing index.html**

```bash
cp index.html index.html.bak
```

- [ ] **Step 2: Write the new `<head>` section**

Replace the existing `<head>` keeping: charset, viewport, Tailwind CDN + config, Lucide CDN, custom CSS, JSON-LD schemas, mobile-menu style block.

Remove: Lenis CSS/JS CDN links (not used on new index).

Add: Poppins Google Font link:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Change `<body>` class to: `class="v2-theme font-[Poppins]"`

- [ ] **Step 3: Write the new navigation (header)**

Structure:
```html
<!-- NAWIGACJA -->
<nav id="main-nav" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
            <!-- Logo — white text, transitions to dark on scroll via nav-solid -->
            <a href="/">
                <span class="text-white font-bold text-xl lg:text-2xl transition-colors" id="nav-logo">Odszkodowania</span>
            </a>
            <!-- Desktop Menu — white links, dark on scroll -->
            <div class="hidden lg:flex items-center gap-5 xl:gap-8">
                <a href="uslugi.html" class="text-white/70 hover:text-white transition-colors text-sm">Usługi</a>
                <a href="jak-dzialamy.html" class="text-white/70 hover:text-white transition-colors text-sm">Jak działamy</a>
                <a href="kalkulator.html" class="text-white/70 hover:text-white transition-colors text-sm">Kalkulator</a>
                <a href="sukcesy.html" class="text-white/70 hover:text-white transition-colors text-sm">Sukcesy</a>
                <a href="blog/" class="text-white/70 hover:text-white transition-colors text-sm">Blog</a>
                <a href="kontakt.html" class="text-white/70 hover:text-white transition-colors text-sm">Kontakt</a>
            </div>
            <!-- CTA + Phone -->
            <div class="hidden lg:flex items-center gap-3">
                <a href="tel:+48XXXXXXXXX" class="text-white/80 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                    <i data-lucide="phone" class="w-4 h-4"></i>
                    +48 XXX XXX XXX
                </a>
                <a href="#contact-form" class="border border-v2-cta text-white bg-v2-cta hover:bg-v2-cta-hover px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Bezpłatna konsultacja
                </a>
            </div>
            <!-- Mobile Hamburger -->
            <button id="mobile-menu-btn" class="lg:hidden text-white p-2" aria-label="Menu">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
        </div>
    </div>
</nav>
```

Note: Nav link color transitions (white → dark on scroll) are handled by CSS rules added in Task 2 (`body.v2-theme #main-nav.nav-solid a` etc.).

- [ ] **Step 4: Write mobile menu overlay**

Same structure as current but with v2 colors:
```html
<div id="mobile-menu" class="fixed inset-0 z-[60] bg-white/95 backdrop-blur-lg flex items-center justify-center">
    <!-- Close button -->
    <button class="absolute top-4 right-4 text-v2-text p-2" onclick="..." aria-label="Zamknij menu">
        <i data-lucide="x" class="w-8 h-8"></i>
    </button>
    <div class="text-center space-y-4">
        <a href="uslugi.html" class="block text-2xl font-bold text-v2-text hover:text-v2-cta transition-colors">Usługi</a>
        <a href="jak-dzialamy.html" class="block text-2xl font-bold text-v2-text hover:text-v2-cta transition-colors">Jak działamy</a>
        <a href="kalkulator.html" class="block text-2xl font-bold text-v2-text hover:text-v2-cta transition-colors">Kalkulator</a>
        <a href="sukcesy.html" class="block text-2xl font-bold text-v2-text hover:text-v2-cta transition-colors">Sukcesy</a>
        <a href="blog/" class="block text-2xl font-bold text-v2-text hover:text-v2-cta transition-colors">Blog</a>
        <a href="kontakt.html" class="block text-2xl font-bold text-v2-text hover:text-v2-cta transition-colors">Kontakt</a>
        <div class="pt-4">
            <a href="#contact-form" class="inline-block bg-v2-cta hover:bg-v2-cta-hover text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Bezpłatna konsultacja
            </a>
        </div>
        <a href="tel:+48XXXXXXXXX" class="block text-v2-cta text-lg font-medium pt-2">
            <i data-lucide="phone" class="w-5 h-5 inline mr-2"></i>+48 XXX XXX XXX
        </a>
    </div>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: rewrite index.html head and header for Votum redesign"
```

---

### Task 4: Rewrite index.html — Hero + Action Buttons

**Files:**
- Modify: `index.html` (continue from Task 3)

- [ ] **Step 1: Write the Hero section**

```html
<main>
    <!-- HERO -->
    <section id="hero" class="relative min-h-screen flex items-center justify-center text-center">
        <!-- FOTO placeholder background -->
        <div class="absolute inset-0 bg-gray-300 flex items-center justify-center">
            <span class="text-gray-500 text-6xl font-bold tracking-widest select-none">FOTO</span>
        </div>
        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-black/50"></div>
        <!-- Content -->
        <div class="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
            <h1 class="text-white text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Poznaj swoje prawa
            </h1>
            <p class="text-white/80 text-lg md:text-xl mb-4">
                Dla osób poszkodowanych w wypadkach i zdarzeniach losowych
            </p>
            <a href="#contact-form" class="inline-block bg-v2-cta hover:bg-v2-cta-hover text-white text-lg px-8 py-4 rounded-lg font-semibold transition-colors mb-4">
                Bezpłatna konsultacja
            </a>
            <p class="text-white/60 text-sm">
                Sprawdź, ile możemy dla Ciebie uzyskać
            </p>
        </div>
    </section>

    <!-- ACTION BUTTONS -->
    <section class="bg-v2-bg py-8">
        <div class="max-w-md mx-auto px-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact-form" class="flex-1 text-center border-2 border-v2-line text-v2-text hover:border-v2-cta hover:text-v2-cta px-6 py-4 rounded-lg font-semibold transition-colors">
                Dla poszkodowanych
            </a>
            <a href="kalkulator.html" class="flex-1 text-center border-2 border-v2-line text-v2-text hover:border-v2-cta hover:text-v2-cta px-6 py-4 rounded-lg font-semibold transition-colors">
                Kalkulator odszkodowań
            </a>
        </div>
    </section>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add hero and action buttons sections"
```

---

### Task 5: Rewrite index.html — Statistics + Logo Bar

**Files:**
- Modify: `index.html` (continue)

- [ ] **Step 1: Write the Statistics section**

```html
    <!-- STATISTICS -->
    <section class="bg-v2-bg py-16 lg:py-20">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-v2-text text-3xl lg:text-4xl font-bold mb-12">Nasza firma to</h2>
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
                <div class="count-up">
                    <div class="text-v2-text text-4xl lg:text-5xl font-bold"><span data-count="500">0</span>+</div>
                    <p class="text-v2-muted text-sm mt-2">wygranych spraw odszkodowawczych w całej Polsce</p>
                </div>
                <div class="count-up">
                    <div class="text-v2-text text-4xl lg:text-5xl font-bold"><span data-count="98">0</span>%</div>
                    <p class="text-v2-muted text-sm mt-2">skuteczności w sprawach, które prowadzimy</p>
                </div>
                <div class="count-up">
                    <div class="text-v2-text text-4xl lg:text-5xl font-bold"><span data-count="15">0</span> mln zł</div>
                    <p class="text-v2-muted text-sm mt-2">uzyskanych odszkodowań dla naszych klientów</p>
                </div>
                <div class="count-up">
                    <div class="text-v2-text text-4xl lg:text-5xl font-bold"><span data-count="10">0</span>+</div>
                    <p class="text-v2-muted text-sm mt-2">lat doświadczenia w branży odszkodowawczej</p>
                </div>
                <div class="count-up col-span-2 lg:col-span-1">
                    <div class="text-v2-text text-4xl lg:text-5xl font-bold">3,5</div>
                    <p class="text-v2-muted text-sm mt-2">miesiąca — średni czas realizacji sprawy</p>
                </div>
            </div>
            <p class="text-v2-muted/60 text-xs mt-10">Dane na podstawie spraw prowadzonych w latach 2015–2025</p>
        </div>
    </section>
```

Note: The `3,5` stat uses a static number (no count-up) since it's a decimal.

- [ ] **Step 2: Write the Logo Bar section**

```html
    <!-- LOGO BAR -->
    <section class="bg-v2-surface py-10">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
                <span class="text-v2-muted/40 text-lg font-semibold tracking-wide">PZU</span>
                <span class="text-v2-muted/40 text-lg font-semibold tracking-wide">WARTA</span>
                <span class="text-v2-muted/40 text-lg font-semibold tracking-wide">ERGO HESTIA</span>
                <span class="text-v2-muted/40 text-lg font-semibold tracking-wide">ALLIANZ</span>
                <span class="text-v2-muted/40 text-lg font-semibold tracking-wide">GENERALI</span>
                <span class="text-v2-muted/40 text-lg font-semibold tracking-wide">UNIQA</span>
            </div>
        </div>
    </section>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add statistics and logo bar sections"
```

---

### Task 6: Rewrite index.html — Service Cards

**Files:**
- Modify: `index.html` (continue)

- [ ] **Step 1: Write the 7 service cards section**

```html
    <!-- SERVICE CARDS -->
    <section class="bg-v2-bg py-16 lg:py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- Card 1: Odszkodowania komunikacyjne -->
                <a href="odszkodowania-komunikacyjne.html" class="v2-card rounded-xl p-6 lg:p-8 text-white" style="background-color: #1e3a5f;">
                    <i data-lucide="car" class="w-10 h-10 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Odszkodowania komunikacyjne</h3>
                    <p class="text-white/80 text-sm">Wypadki samochodowe, motocyklowe, potrącenia pieszych. Walczymy o najwyższe odszkodowanie.</p>
                </a>

                <!-- Card 2: Wypadki przy pracy -->
                <a href="odszkodowania-wypadki-przy-pracy.html" class="v2-card rounded-xl p-6 lg:p-8 text-white" style="background-color: #b8860b;">
                    <i data-lucide="hard-hat" class="w-10 h-10 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Wypadki przy pracy</h3>
                    <p class="text-white/80 text-sm">Uraz na budowie, w fabryce lub biurze. Odszkodowanie od pracodawcy i ubezpieczyciela.</p>
                </a>

                <!-- Card 3: Pomoc po wypadku -->
                <a href="#contact-form" class="v2-card rounded-xl p-6 lg:p-8 text-white" style="background-color: #8b2020;">
                    <i data-lucide="heart-pulse" class="w-10 h-10 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Pomoc po wypadku</h3>
                    <p class="text-white/80 text-sm">Bezpłatna konsultacja i analiza Twojej sprawy. Skontaktuj się z nami już dziś.</p>
                </a>

                <!-- Card 4: Błędy medyczne -->
                <a href="odszkodowania-bledy-medyczne.html" class="v2-card rounded-xl p-6 lg:p-8 text-white" style="background-color: #1a7a6d;">
                    <i data-lucide="stethoscope" class="w-10 h-10 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Błędy medyczne</h3>
                    <p class="text-white/80 text-sm">Błąd lekarza, zakażenie szpitalne, wadliwa diagnoza. Odszkodowanie za szkody zdrowotne.</p>
                </a>

                <!-- Card 5: Wypadki rolnicze (KRUS) -->
                <a href="odszkodowania-wypadki-rolnicze.html" class="v2-card rounded-xl p-6 lg:p-8 text-white" style="background-color: #2d5a27;">
                    <i data-lucide="wheat" class="w-10 h-10 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Wypadki rolnicze (KRUS)</h3>
                    <p class="text-white/80 text-sm">Wypadki w gospodarstwie rolnym. Odszkodowanie z KRUS i ubezpieczenia OC rolnika.</p>
                </a>

                <!-- Card 6: Śmierć bliskiej osoby -->
                <a href="odszkodowania-smierc-bliskiej-osoby.html" class="v2-card rounded-xl p-6 lg:p-8 text-white" style="background-color: #4a2d6b;">
                    <i data-lucide="heart" class="w-10 h-10 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Śmierć bliskiej osoby</h3>
                    <p class="text-white/80 text-sm">Zadośćuczynienie, renta i odszkodowanie dla rodziny po tragicznej stracie.</p>
                </a>

                <!-- Card 7: Kalkulator odszkodowań (full width) -->
                <a href="kalkulator.html" class="v2-card rounded-xl p-6 lg:p-8 text-white sm:col-span-2" style="background-color: #c4511a;">
                    <i data-lucide="calculator" class="w-10 h-10 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Kalkulator odszkodowań</h3>
                    <p class="text-white/80 text-sm">Sprawdź orientacyjną kwotę odszkodowania za pomocą naszego bezpłatnego kalkulatora online.</p>
                </a>

            </div>
        </div>
    </section>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add colored service cards section"
```

---

### Task 7: Rewrite index.html — Contact Form

**Files:**
- Modify: `index.html` (continue)

- [ ] **Step 1: Write the contact form section**

```html
    <!-- CONTACT FORM -->
    <section id="contact-form" class="bg-v2-surface py-16 lg:py-20">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="lg:grid lg:grid-cols-2 lg:gap-12">
                <!-- Left: Info -->
                <div class="mb-10 lg:mb-0">
                    <h2 class="text-v2-text text-3xl lg:text-4xl font-bold mb-4">Masz pytanie?</h2>
                    <p class="text-v2-muted mb-6">Skontaktuj się z nami. Bezpłatnie przeanalizujemy Twoją sprawę i ocenimy szanse na uzyskanie odszkodowania.</p>
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <i data-lucide="phone" class="w-5 h-5 text-v2-cta"></i>
                            <a href="tel:+48XXXXXXXXX" class="text-v2-text font-semibold hover:text-v2-cta transition-colors">+48 XXX XXX XXX</a>
                        </div>
                        <div class="flex items-center gap-3">
                            <i data-lucide="mail" class="w-5 h-5 text-v2-cta"></i>
                            <a href="mailto:kontakt@example.pl" class="text-v2-text font-semibold hover:text-v2-cta transition-colors">kontakt@example.pl</a>
                        </div>
                        <div class="flex items-center gap-3">
                            <i data-lucide="clock" class="w-5 h-5 text-v2-cta"></i>
                            <span class="text-v2-muted">Pon–Pt: 8:00–18:00, Sob: 9:00–14:00</span>
                        </div>
                    </div>
                </div>
                <!-- Right: Form -->
                <div>
                    <form id="v2-contact-form" novalidate class="space-y-4">
                        <div>
                            <select name="topic" class="w-full px-4 py-3 rounded-lg bg-white border border-v2-line text-v2-text focus:border-v2-cta focus:ring-2 focus:ring-v2-cta/20 focus:outline-none transition-colors">
                                <option value="" disabled selected>Wybierz temat rozmowy</option>
                                <option value="komunikacyjne">Odszkodowanie komunikacyjne</option>
                                <option value="praca">Wypadek przy pracy</option>
                                <option value="medyczne">Błąd medyczny</option>
                                <option value="smierc">Śmierć bliskiej osoby</option>
                                <option value="rolnicze">Wypadek rolniczy</option>
                                <option value="inne">Inne</option>
                            </select>
                        </div>
                        <div>
                            <input type="text" id="v2-name" name="name" placeholder="Imię i nazwisko *" required minlength="2"
                                class="w-full px-4 py-3 rounded-lg bg-white border border-v2-line text-v2-text placeholder-v2-muted focus:border-v2-cta focus:ring-2 focus:ring-v2-cta/20 focus:outline-none transition-colors">
                            <p class="text-red-500 text-xs mt-1 hidden" id="v2-name-error">Podaj swoje imię (min. 2 znaki)</p>
                        </div>
                        <div>
                            <input type="tel" id="v2-phone" name="phone" placeholder="Numer telefonu *" required
                                class="w-full px-4 py-3 rounded-lg bg-white border border-v2-line text-v2-text placeholder-v2-muted focus:border-v2-cta focus:ring-2 focus:ring-v2-cta/20 focus:outline-none transition-colors">
                            <p class="text-red-500 text-xs mt-1 hidden" id="v2-phone-error">Podaj prawidłowy numer telefonu</p>
                        </div>
                        <div>
                            <input type="email" id="v2-email" name="email" placeholder="E-mail"
                                class="w-full px-4 py-3 rounded-lg bg-white border border-v2-line text-v2-text placeholder-v2-muted focus:border-v2-cta focus:ring-2 focus:ring-v2-cta/20 focus:outline-none transition-colors">
                            <p class="text-red-500 text-xs mt-1 hidden" id="v2-email-error">Podaj prawidłowy adres email</p>
                        </div>
                        <div>
                            <textarea name="message" rows="4" placeholder="Treść wiadomości"
                                class="w-full px-4 py-3 rounded-lg bg-white border border-v2-line text-v2-text placeholder-v2-muted focus:border-v2-cta focus:ring-2 focus:ring-v2-cta/20 focus:outline-none transition-colors resize-none"></textarea>
                        </div>
                        <div class="flex items-start gap-2">
                            <input type="checkbox" name="consent" required class="mt-1 w-4 h-4 accent-v2-cta" id="v2-consent">
                            <label for="v2-consent" class="text-v2-muted text-xs">
                                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu i analizy sprawy.
                                <a href="polityka-prywatnosci.html" class="text-v2-cta underline">Polityka prywatności</a> *
                            </label>
                        </div>
                        <button type="submit" class="w-full bg-v2-text hover:bg-v2-text/80 text-white py-3 rounded-lg font-semibold transition-colors">
                            Wyślij
                        </button>
                    </form>

                    <!-- Success template -->
                    <template id="v2-contact-success">
                        <div class="text-center py-8">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="check" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="text-v2-text text-2xl font-bold mb-2">Dziękujemy!</h3>
                            <p class="text-v2-muted">Nasz specjalista skontaktuje się z Tobą wkrótce.</p>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </section>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add contact form section"
```

---

### Task 8: Rewrite index.html — Testimonial Quote + Footer + Mobile CTA + Scripts

**Files:**
- Modify: `index.html` (continue)

- [ ] **Step 1: Write the testimonial quote section**

```html
    <!-- TESTIMONIAL QUOTE -->
    <section class="bg-v2-bg py-16 lg:py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <blockquote>
                <p class="text-v2-text text-2xl lg:text-3xl italic font-light leading-relaxed mb-6">
                    "Byłem pewien, że 15 tysięcy to wszystko na co mogę liczyć. Dostałem 8 razy więcej."
                </p>
                <cite class="text-v2-muted text-base not-italic">— Marek, Warszawa</cite>
            </blockquote>
        </div>
    </section>
```

- [ ] **Step 2: Write the footer**

```html
    </main>

    <!-- COOKIE BANNER -->
    <div id="cookie-banner" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-v2-line hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-v2-muted text-sm">Używamy plików cookie, aby zapewnić najlepsze doświadczenia na naszej stronie. <a href="polityka-prywatnosci.html" class="text-v2-cta underline">Polityka prywatności</a></p>
            <div class="flex gap-3 shrink-0">
                <button id="cookie-reject" class="border border-v2-line text-v2-muted px-4 py-2 rounded text-sm hover:text-v2-text transition-colors">Tylko niezbędne</button>
                <button id="cookie-accept" class="bg-v2-cta hover:bg-v2-cta-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Akceptuję</button>
            </div>
        </div>
    </div>

    <!-- FOOTER -->
    <footer class="bg-v2-footer text-white py-12 lg:py-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <!-- Col 1: Logo + Company -->
                <div class="md:col-span-1">
                    <span class="text-white font-bold text-xl mb-4 block">Odszkodowania</span>
                    <div class="text-white/60 text-sm space-y-1">
                        <p>ul. Przykładowa 10</p>
                        <p>00-001 Warszawa</p>
                        <p class="mt-2">NIP: XXXXXXXXXX</p>
                        <p>KRS: XXXXXXXXXX</p>
                    </div>
                </div>
                <!-- Col 2: Usługi -->
                <div>
                    <h4 class="text-white font-semibold mb-4">Usługi</h4>
                    <ul class="space-y-2 text-white/60 text-sm">
                        <li><a href="odszkodowania-komunikacyjne.html" class="hover:text-white transition-colors">Odszkodowania komunikacyjne</a></li>
                        <li><a href="odszkodowania-wypadki-przy-pracy.html" class="hover:text-white transition-colors">Wypadki przy pracy</a></li>
                        <li><a href="odszkodowania-bledy-medyczne.html" class="hover:text-white transition-colors">Błędy medyczne</a></li>
                        <li><a href="odszkodowania-smierc-bliskiej-osoby.html" class="hover:text-white transition-colors">Śmierć bliskiej osoby</a></li>
                        <li><a href="odszkodowania-wypadki-rolnicze.html" class="hover:text-white transition-colors">Wypadki rolnicze</a></li>
                    </ul>
                </div>
                <!-- Col 3: Informacje -->
                <div>
                    <h4 class="text-white font-semibold mb-4">Informacje</h4>
                    <ul class="space-y-2 text-white/60 text-sm">
                        <li><a href="jak-dzialamy.html" class="hover:text-white transition-colors">Jak działamy</a></li>
                        <li><a href="sukcesy.html" class="hover:text-white transition-colors">Sukcesy</a></li>
                        <li><a href="opinie.html" class="hover:text-white transition-colors">Opinie klientów</a></li>
                        <li><a href="blog/" class="hover:text-white transition-colors">Blog</a></li>
                        <li><a href="polityka-prywatnosci.html" class="hover:text-white transition-colors">Polityka prywatności</a></li>
                    </ul>
                </div>
                <!-- Col 4: Kontakt -->
                <div>
                    <h4 class="text-white font-semibold mb-4">Kontakt</h4>
                    <ul class="space-y-2 text-white/60 text-sm">
                        <li><a href="tel:+48XXXXXXXXX" class="hover:text-white transition-colors">+48 XXX XXX XXX</a></li>
                        <li><a href="mailto:kontakt@example.pl" class="hover:text-white transition-colors">kontakt@example.pl</a></li>
                        <li>Pon–Pt: 8:00–18:00</li>
                        <li>Sob: 9:00–14:00</li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
                <p>&copy; 2026 Odszkodowania. Wszelkie prawa zastrzeżone.</p>
            </div>
        </div>
    </footer>
```

- [ ] **Step 3: Write the mobile sticky CTA**

```html
    <!-- MOBILE STICKY CTA -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-v2-cta p-3 lg:hidden">
        <a href="tel:+48XXXXXXXXX" class="block text-white text-center py-2 font-semibold text-sm flex items-center justify-center gap-2">
            <i data-lucide="phone" class="w-4 h-4"></i> Zadzwoń teraz
        </a>
    </div>
```

- [ ] **Step 4: Write the script tags (before `</body>`)**

Script load order for new index.html:
```html
    <!-- Scripts -->
    <script src="js/form-validation.js"></script>
    <script src="js/cookie-consent.js"></script>
    <script src="js/animations.js"></script>
    <script src="js/analytics.js"></script>
    <script src="js/navigation.js"></script>

    <!-- Lucide icon init -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // V2 contact form — uses window.formValidation API
            const form = document.getElementById('v2-contact-form');
            if (form && window.formValidation) {
                const fv = window.formValidation;

                // Attach live validation per field (fieldId, validatorFn)
                fv.attachLiveValidation('v2-name', fv.validateName);
                fv.attachLiveValidation('v2-phone', fv.validatePhone);
                fv.attachLiveValidation('v2-email', fv.validateEmail);

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    // Use submitForm() which handles validation, disable, and success template
                    fv.submitForm({
                        form: form,
                        fields: [
                            { id: 'v2-name', validate: fv.validateName },
                            { id: 'v2-phone', validate: fv.validatePhone },
                            { id: 'v2-email', validate: fv.validateEmail },
                        ],
                        consentId: 'v2-consent',
                        templateId: 'v2-contact-success',
                        onSuccess: () => {
                            if (typeof lucide !== 'undefined') lucide.createIcons();
                        }
                    });
                });
            }
        });
    </script>
</body>
</html>
```

Note: `quiz.js` and `calculator.js` are NOT loaded — no quiz or calculator on new index.html. Lenis CDN is NOT loaded — `animations.js` guard handles this.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add testimonial, footer, mobile CTA, and scripts"
```

---

### Task 9: Visual verification on localhost

**Files:**
- Read-only verification

- [ ] **Step 1: Start local server**

```bash
python3 -m http.server 1111
```

Open `http://localhost:1111` in browser.

- [ ] **Step 2: Verify each section renders correctly**

Check:
- [ ] Header: white text on dark hero, sticky with white bg after scroll
- [ ] Hero: gray "FOTO" placeholder visible, dark overlay, white heading centered
- [ ] Action buttons: two bordered buttons, centered
- [ ] Statistics: 5 numbers with descriptions, count-up animation works
- [ ] Logo bar: 6 insurer names in gray on light bg
- [ ] Service cards: 7 colored cards, 2-column grid, last card full width
- [ ] Contact form: left info + right form layout on desktop, stacked on mobile
- [ ] Testimonial: centered italic quote
- [ ] Footer: dark bg, 4 columns, copyright
- [ ] Mobile CTA: red "Zadzwoń teraz" fixed at bottom on mobile
- [ ] Nav solid: scrolling changes nav to white bg with dark text

- [ ] **Step 3: Verify subpage compatibility**

Open `http://localhost:1111/uslugi.html` — should still show cream/gold styling.
Open `http://localhost:1111/odszkodowania-komunikacyjne.html` — same.

- [ ] **Step 4: Fix any visual issues found and commit**

```bash
git add -A
git commit -m "fix: visual adjustments after localhost verification"
```

---

### Task 10: Clean up backup file

- [ ] **Step 1: Remove backup**

```bash
rm index.html.bak
```

- [ ] **Step 2: Final commit**

```bash
git commit --allow-empty -m "chore: votum redesign complete — ready for review"
```
