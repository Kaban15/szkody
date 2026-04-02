# Strona Odszkodowania — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static lead-generation website for a Polish compensation claims firm with interactive quiz, calculator, case studies, and SEO subpages.

**Architecture:** Static HTML/CSS/JS site using Tailwind CSS (CDN) and vanilla JavaScript. Mobile-first, one-page layout with sticky nav and SEO subpages. All forms are static HTML (backend to be connected later). Quiz and calculator are client-side JS modules.

**Tech Stack:** HTML5, Tailwind CSS (CDN), Vanilla JS (ES modules), Lucide Icons (CDN), Google Fonts (Playfair Display + Inter)

**Spec:** `docs/superpowers/specs/2026-04-02-strona-odszkodowania-design.md`

---

## File Structure

```
szkody/
├── index.html                          # Strona glowna (one-page)
├── kalkulator.html                     # Podstrona kalkulatora
├── kontakt.html                        # Podstrona kontakt
├── jak-dzialamy.html                   # Podstrona timeline
├── polityka-prywatnosci.html           # Polityka prywatnosci
├── 404.html                            # Strona 404
├── odszkodowania-komunikacyjne.html    # Podstrona SEO
├── odszkodowania-wypadki-przy-pracy.html
├── odszkodowania-bledy-medyczne.html
├── odszkodowania-smierc-bliskiej-osoby.html
├── odszkodowania-wypadki-rolnicze.html
├── blog/
│   └── index.html                      # Lista artykulow
├── css/
│   └── styles.css                      # Custom styles (Tailwind overrides, animations)
├── js/
│   ├── quiz.js                         # Quiz diagnostyczny (5 krokow)
│   ├── calculator.js                   # Kalkulator odszkodowan
│   ├── animations.js                   # Scroll reveal, count-up, timeline
│   ├── navigation.js                   # Sticky nav, mobile menu, sticky bar
│   ├── cookie-consent.js               # Cookie banner + GA4 loader
│   ├── form-validation.js              # Walidacja formularzy (quiz + kontakt)
│   └── analytics.js                    # GA4 event tracking wrapper
└── docs/
    └── superpowers/
        ├── specs/...
        └── plans/...
```

---

### Task 1: Project Scaffold + Tailwind + Fonts + Nav

**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/navigation.js`

- [ ] **Step 1: Create `index.html` with HTML boilerplate, Tailwind CDN, fonts, meta tags**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Bezpłatna konsultacja odszkodowawcza. Sprawdź ile Ci się należy po wypadku. Prowizja tylko od sukcesu.">
    <meta property="og:title" content="Odszkodowania — Bezpłatna konsultacja">
    <meta property="og:description" content="Sprawdź ile Ci się należy po wypadku. Kalkulator odszkodowań online.">
    <meta property="og:type" content="website">
    <title>Odszkodowania — Bezpłatna konsultacja | Cała Polska</title>

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: '#1A1F36',
                        'navy-dark': '#121526',
                        gold: '#D4A843',
                        'gold-light': '#E8C76A',
                        cta: '#E8652D',
                        'cta-hover': '#D4561F',
                        warm: '#F7F5F2',
                        'warm-dark': '#EDE9E4',
                        txt: '#2D2D2D',
                    },
                    fontFamily: {
                        heading: ['"Playfair Display"', 'serif'],
                        body: ['"Inter"', 'sans-serif'],
                    },
                },
            },
        }
    </script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/styles.css">
</head>
<body class="font-body text-txt bg-warm">

    <!-- NAWIGACJA STICKY -->
    <nav id="main-nav" class="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 lg:h-20">
                <!-- Logo -->
                <a href="/" class="text-white font-heading text-xl lg:text-2xl font-bold">
                    <span class="text-gold">Odszkodowania</span>
                </a>

                <!-- Desktop Menu -->
                <div class="hidden lg:flex items-center gap-8">
                    <a href="#uslugi" class="text-white/80 hover:text-gold transition-colors text-sm">Usługi</a>
                    <a href="#jak-dzialamy" class="text-white/80 hover:text-gold transition-colors text-sm">Jak działamy</a>
                    <a href="#kalkulator" class="text-white/80 hover:text-gold transition-colors text-sm">Kalkulator</a>
                    <a href="#case-studies" class="text-white/80 hover:text-gold transition-colors text-sm">Sukcesy</a>
                    <a href="blog/" class="text-white/80 hover:text-gold transition-colors text-sm">Blog</a>
                    <a href="#kontakt" class="text-white/80 hover:text-gold transition-colors text-sm">Kontakt</a>
                </div>

                <!-- CTA + Phone -->
                <div class="hidden lg:flex items-center gap-4">
                    <a href="tel:+48XXXXXXXXX" class="text-gold hover:text-gold-light transition-colors text-sm font-medium flex items-center gap-2">
                        <i data-lucide="phone" class="w-4 h-4"></i>
                        +48 XXX XXX XXX
                    </a>
                    <a href="#quiz" class="bg-cta hover:bg-cta-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        Bezpłatna konsultacja
                    </a>
                </div>

                <!-- Mobile Hamburger -->
                <button id="mobile-menu-btn" class="lg:hidden text-white p-2" aria-label="Menu">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden lg:hidden bg-navy border-t border-white/10">
            <div class="px-4 py-4 space-y-3">
                <a href="#uslugi" class="block text-white/80 hover:text-gold py-2">Usługi</a>
                <a href="#jak-dzialamy" class="block text-white/80 hover:text-gold py-2">Jak działamy</a>
                <a href="#kalkulator" class="block text-white/80 hover:text-gold py-2">Kalkulator</a>
                <a href="#case-studies" class="block text-white/80 hover:text-gold py-2">Sukcesy</a>
                <a href="blog/" class="block text-white/80 hover:text-gold py-2">Blog</a>
                <a href="#kontakt" class="block text-white/80 hover:text-gold py-2">Kontakt</a>
                <a href="tel:+48XXXXXXXXX" class="block text-gold font-medium py-2">+48 XXX XXX XXX</a>
                <a href="#quiz" class="block bg-cta text-white text-center py-3 rounded-lg font-semibold">Bezpłatna konsultacja</a>
            </div>
        </div>
    </nav>

    <!-- Mobile Sticky Bottom Bar -->
    <div id="sticky-bar" class="fixed bottom-0 left-0 right-0 z-40 bg-navy p-3 flex gap-3 lg:hidden transition-transform duration-300">
        <a href="tel:+48XXXXXXXXX" class="flex-1 bg-gold text-navy text-center py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
            <i data-lucide="phone" class="w-4 h-4"></i> Zadzwoń
        </a>
        <a href="#quiz" class="flex-1 bg-cta text-white text-center py-3 rounded-lg font-semibold text-sm">
            Bezpłatna wycena
        </a>
    </div>

    <!-- Placeholder for sections -->
    <main>
        <section id="hero" class="pt-20"><!-- Task 2 --></section>
    </main>

    <!-- Scripts -->
    <script src="js/navigation.js"></script>
    <script>lucide.createIcons();</script>
</body>
</html>
```

- [ ] **Step 2: Create `css/styles.css` with custom animations and base overrides**

```css
/* Smooth scroll */
html {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
}

/* Quiz slide transitions */
.quiz-step {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(-30px);
    }
}

/* Count-up animation trigger */
.count-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.count-up.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Scroll reveal */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Card hover */
.card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Progress bar */
.progress-bar {
    transition: width 0.4s ease;
}

/* Range slider custom styling */
input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: #E0DCD7;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #E8652D;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #E8652D;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
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

/* Sticky bar hide */
#sticky-bar.hidden-bar {
    transform: translateY(100%);
}

/* Scrollbar hide for carousel */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

- [ ] **Step 3: Create `js/navigation.js` with mobile menu toggle, sticky bar hide logic**

```js
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const stickyBar = document.getElementById('sticky-bar');
    const interactiveSections = ['quiz', 'kalkulator', 'kontakt'];

    // Mobile menu toggle
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            const icon = menuBtn.querySelector('[data-lucide]');
            if (icon) {
                icon.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
                lucide.createIcons();
            }
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = menuBtn.querySelector('[data-lucide]');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            });
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

- [ ] **Step 4: Open `index.html` in browser, verify nav renders, mobile menu works, sticky bar shows**

Open in browser: `index.html`
Expected: Navy sticky nav with gold logo, menu links, CTA button. Mobile: hamburger opens menu, sticky bottom bar visible.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/navigation.js
git commit -m "feat: scaffold project with nav, tailwind, fonts, sticky bar"
```

---

### Task 2: Hero Section + Quiz (HTML shell)

**Files:**
- Modify: `index.html` (replace hero placeholder)
- Create: `js/quiz.js`
- Create: `js/form-validation.js`

- [ ] **Step 1: Add hero + quiz HTML to `index.html`**

Replace `<section id="hero" class="pt-20"><!-- Task 2 --></section>` with:

```html
<!-- HERO + QUIZ -->
<section id="hero" class="relative bg-gradient-to-b from-navy to-navy-dark pt-28 pb-16 lg:pt-36 lg:pb-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <!-- Left: Text -->
            <div class="text-center lg:text-left mb-12 lg:mb-0">
                <h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white font-bold leading-tight mb-6">
                    Miałeś wypadek? <br>
                    <span class="text-gold">Sprawdź ile Ci się należy</span>
                </h1>
                <p class="text-white/70 text-lg lg:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
                    Ubezpieczyciele zaniżają wypłaty nawet o 80%. Nie pozwól na to — bezpłatnie przeanalizujemy Twoją sprawę.
                </p>
                <div class="flex flex-wrap gap-6 justify-center lg:justify-start text-white/60 text-sm">
                    <span class="flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4 text-gold"></i> Bezpłatna konsultacja</span>
                    <span class="flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4 text-gold"></i> Płacisz tylko za sukces</span>
                    <span class="flex items-center gap-2"><i data-lucide="check-circle" class="w-4 h-4 text-gold"></i> Cała Polska</span>
                </div>
            </div>

            <!-- Right: Quiz -->
            <div id="quiz" class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg mx-auto lg:mx-0 lg:max-w-none">
                <!-- Progress bar -->
                <div class="mb-6">
                    <div class="flex justify-between text-xs text-txt/50 mb-2">
                        <span>Krok <span id="quiz-current-step">1</span> z 5</span>
                        <span id="quiz-percent">20%</span>
                    </div>
                    <div class="h-2 bg-warm rounded-full overflow-hidden">
                        <div id="quiz-progress" class="progress-bar h-full bg-cta rounded-full" style="width: 20%"></div>
                    </div>
                </div>

                <!-- Quiz Steps Container -->
                <div id="quiz-container">
                    <!-- Step 1 -->
                    <div class="quiz-step" data-step="1">
                        <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy mb-6">Co się wydarzyło?</h2>
                        <div class="grid grid-cols-2 gap-3" id="quiz-step-1-options">
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="wypadek-samochodowy">
                                <i data-lucide="car" class="w-8 h-8 text-navy"></i>
                                Wypadek samochodowy
                            </button>
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="wypadek-motocyklowy">
                                <i data-lucide="bike" class="w-8 h-8 text-navy"></i>
                                Wypadek motocyklowy
                            </button>
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="potracenie">
                                <i data-lucide="footprints" class="w-8 h-8 text-navy"></i>
                                Potrącenie pieszego
                            </button>
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="wypadek-praca">
                                <i data-lucide="hard-hat" class="w-8 h-8 text-navy"></i>
                                Wypadek przy pracy
                            </button>
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="blad-medyczny">
                                <i data-lucide="stethoscope" class="w-8 h-8 text-navy"></i>
                                Błąd medyczny
                            </button>
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="smierc-bliskiej">
                                <i data-lucide="heart" class="w-8 h-8 text-navy"></i>
                                Śmierć bliskiej osoby
                            </button>
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="wypadek-rolnictwo">
                                <i data-lucide="wheat" class="w-8 h-8 text-navy"></i>
                                Wypadek w rolnictwie
                            </button>
                            <button class="quiz-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm text-center" data-value="inne">
                                <i data-lucide="help-circle" class="w-8 h-8 text-navy"></i>
                                Inne
                            </button>
                        </div>
                        <button id="quiz-next-1" class="w-full mt-6 bg-cta hover:bg-cta-hover text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                            Dalej →
                        </button>
                    </div>

                    <!-- Step 2 -->
                    <div class="quiz-step hidden" data-step="2">
                        <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy mb-6">Kiedy to się stało?</h2>
                        <div class="space-y-3" id="quiz-step-2-options">
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="30dni">W ciągu ostatnich 30 dni</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="1-6mies">1–6 miesięcy temu</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="6-12mies">6–12 miesięcy temu</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="1-3lata">1–3 lata temu</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-txt/60" data-value="3+lata">Ponad 3 lata temu <span class="text-xs text-cta">(sprawdzimy przedawnienie)</span></button>
                        </div>
                        <div class="flex gap-3 mt-6">
                            <button class="quiz-back flex-1 border-2 border-navy/20 text-navy py-3 rounded-lg font-semibold transition-colors hover:bg-navy/5">← Wróć</button>
                            <button class="quiz-next flex-1 bg-cta hover:bg-cta-hover text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>Dalej →</button>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="quiz-step hidden" data-step="3">
                        <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy mb-6">Jakie były skutki?</h2>
                        <div class="space-y-3" id="quiz-step-3-options">
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="szpital">Pobyt w szpitalu</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="ambulatorium">Leczenie ambulatoryjne</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="uszczerbek">Trwały uszczerbek na zdrowiu</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="niezdolnosc">Niezdolność do pracy</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="smierc">Śmierć osoby bliskiej</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="szkoda-materialna">Szkoda materialna</button>
                        </div>
                        <div class="flex gap-3 mt-6">
                            <button class="quiz-back flex-1 border-2 border-navy/20 text-navy py-3 rounded-lg font-semibold transition-colors hover:bg-navy/5">← Wróć</button>
                            <button class="quiz-next flex-1 bg-cta hover:bg-cta-hover text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>Dalej →</button>
                        </div>
                    </div>

                    <!-- Step 4 -->
                    <div class="quiz-step hidden" data-step="4">
                        <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy mb-6">Jaki jest obecny status?</h2>
                        <div class="space-y-3" id="quiz-step-4-options">
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="nie-zgloszone">Jeszcze nic nie zgłaszałem/am</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="czekam">Zgłosiłem/am, czekam na decyzję</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="za-malo">Ubezpieczyciel wypłacił za mało</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="odmowa">Ubezpieczyciel odmówił wypłaty</button>
                            <button class="quiz-option w-full text-left p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all" data-value="nie-wiem">Nie wiem co robić</button>
                        </div>
                        <div class="flex gap-3 mt-6">
                            <button class="quiz-back flex-1 border-2 border-navy/20 text-navy py-3 rounded-lg font-semibold transition-colors hover:bg-navy/5">← Wróć</button>
                            <button class="quiz-next flex-1 bg-cta hover:bg-cta-hover text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>Dalej →</button>
                        </div>
                    </div>

                    <!-- Step 5: Contact form -->
                    <div class="quiz-step hidden" data-step="5">
                        <h2 class="font-heading text-xl sm:text-2xl font-bold text-navy mb-2">Ostatni krok!</h2>
                        <p class="text-txt/60 text-sm mb-6">Zostaw dane — bezpłatnie przeanalizujemy Twoją sprawę.</p>

                        <!-- Summary -->
                        <div id="quiz-summary" class="bg-warm rounded-xl p-4 mb-6 text-sm text-txt/70 space-y-1"></div>

                        <form id="quiz-form" novalidate>
                            <div class="space-y-4">
                                <div>
                                    <input type="text" id="quiz-name" name="name" placeholder="Imię *" required minlength="2"
                                        class="w-full px-4 py-3 rounded-lg border-2 border-warm-dark focus:border-gold focus:outline-none transition-colors">
                                    <p class="text-cta text-xs mt-1 hidden" id="quiz-name-error">Podaj swoje imię (min. 2 znaki)</p>
                                </div>
                                <div>
                                    <input type="tel" id="quiz-phone" name="phone" placeholder="Numer telefonu *" required
                                        class="w-full px-4 py-3 rounded-lg border-2 border-warm-dark focus:border-gold focus:outline-none transition-colors">
                                    <p class="text-cta text-xs mt-1 hidden" id="quiz-phone-error">Podaj prawidłowy numer telefonu</p>
                                </div>
                                <div>
                                    <input type="email" id="quiz-email" name="email" placeholder="Email (opcjonalnie)"
                                        class="w-full px-4 py-3 rounded-lg border-2 border-warm-dark focus:border-gold focus:outline-none transition-colors">
                                    <p class="text-cta text-xs mt-1 hidden" id="quiz-email-error">Podaj prawidłowy adres email</p>
                                </div>
                                <div class="flex items-start gap-2">
                                    <input type="checkbox" id="quiz-consent" name="consent" required class="mt-1 w-4 h-4 accent-cta">
                                    <label for="quiz-consent" class="text-xs text-txt/60">
                                        Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu i analizy sprawy.
                                        <a href="polityka-prywatnosci.html" class="text-gold underline">Polityka prywatności</a> *
                                    </label>
                                </div>
                                <div class="flex items-start gap-2">
                                    <input type="checkbox" id="quiz-marketing" name="marketing" class="mt-1 w-4 h-4 accent-cta">
                                    <label for="quiz-marketing" class="text-xs text-txt/60">
                                        Wyrażam zgodę na kontakt marketingowy (opcjonalne)
                                    </label>
                                </div>
                            </div>
                            <div class="flex gap-3 mt-6">
                                <button type="button" class="quiz-back flex-1 border-2 border-navy/20 text-navy py-3 rounded-lg font-semibold transition-colors hover:bg-navy/5">← Wróć</button>
                                <button type="submit" id="quiz-submit" class="flex-1 bg-cta hover:bg-cta-hover text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-40">
                                    Otrzymaj bezpłatną wycenę →
                                </button>
                            </div>
                            <p class="text-center text-xs text-txt/40 mt-4" id="quiz-callback-info"></p>
                        </form>
                    </div>

                    <!-- Success screen -->
                    <div id="quiz-success" class="hidden text-center py-8">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="check" class="w-8 h-8 text-green-600"></i>
                        </div>
                        <h2 class="font-heading text-2xl font-bold text-navy mb-2">Dziękujemy!</h2>
                        <p class="text-txt/60" id="quiz-success-msg">Nasz specjalista oddzwoni w ciągu 30 minut.</p>
                        <div id="quiz-success-summary" class="bg-warm rounded-xl p-4 mt-6 text-sm text-txt/70 text-left space-y-1"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Create `js/form-validation.js`**

```js
/**
 * Form validation utilities for quiz and contact forms.
 * Polish phone format: 9 digits, optionally prefixed with +48.
 */

const PHONE_REGEX = /^(\+48)?[0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(value) {
    return value.trim().length >= 2;
}

function validatePhone(value) {
    const cleaned = value.replace(/[\s-]/g, '');
    return PHONE_REGEX.test(cleaned);
}

function validateEmail(value) {
    if (!value.trim()) return true; // optional
    return EMAIL_REGEX.test(value.trim());
}

function showError(inputId) {
    const errorEl = document.getElementById(`${inputId}-error`);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.classList.remove('hidden');
    if (inputEl) inputEl.classList.add('border-cta');
}

function hideError(inputId) {
    const errorEl = document.getElementById(`${inputId}-error`);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('border-cta');
}

function validateQuizForm() {
    let valid = true;

    if (!validateName(document.getElementById('quiz-name').value)) {
        showError('quiz-name');
        valid = false;
    } else {
        hideError('quiz-name');
    }

    if (!validatePhone(document.getElementById('quiz-phone').value)) {
        showError('quiz-phone');
        valid = false;
    } else {
        hideError('quiz-phone');
    }

    if (!validateEmail(document.getElementById('quiz-email').value)) {
        showError('quiz-email');
        valid = false;
    } else {
        hideError('quiz-email');
    }

    if (!document.getElementById('quiz-consent').checked) {
        valid = false;
    }

    return valid;
}

// Export for use in other modules
window.formValidation = { validateName, validatePhone, validateEmail, validateQuizForm, showError, hideError };
```

- [ ] **Step 3: Create `js/quiz.js`**

```js
/**
 * Quiz diagnostyczny — 5-step interactive quiz with lead capture.
 * Handles step navigation, option selection, form submission, and business hours logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    const state = { step: 1, answers: {} };
    const totalSteps = 5;

    // Business hours check
    function isBusinessHours() {
        const now = new Date();
        const day = now.getDay(); // 0=Sun
        const hour = now.getHours();
        if (day >= 1 && day <= 5) return hour >= 8 && hour < 18; // Mon-Fri 8-18
        if (day === 6) return hour >= 9 && hour < 14; // Sat 9-14
        return false;
    }

    // Set callback info text
    const callbackInfo = document.getElementById('quiz-callback-info');
    if (callbackInfo) {
        callbackInfo.textContent = isBusinessHours()
            ? 'Oddzwonimy w ciągu 30 minut'
            : 'Oddzwonimy w następnym dniu roboczym';
    }

    // Update progress bar
    function updateProgress() {
        const percent = (state.step / totalSteps) * 100;
        document.getElementById('quiz-progress').style.width = `${percent}%`;
        document.getElementById('quiz-current-step').textContent = state.step;
        document.getElementById('quiz-percent').textContent = `${Math.round(percent)}%`;
    }

    // Show specific step
    function showStep(stepNum) {
        document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
        const target = document.querySelector(`.quiz-step[data-step="${stepNum}"]`);
        if (target) {
            target.classList.remove('hidden');
            // Re-trigger animation
            target.style.animation = 'none';
            target.offsetHeight; // force reflow
            target.style.animation = '';
        }
        state.step = stepNum;
        updateProgress();
    }

    // Option selection (single select per step)
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const stepEl = btn.closest('.quiz-step');
            const stepNum = parseInt(stepEl.dataset.step);

            // Deselect others in same step
            stepEl.querySelectorAll('.quiz-option').forEach(o => {
                o.classList.remove('border-gold', 'bg-gold/10');
                o.classList.add('border-warm');
            });

            // Select this one
            btn.classList.remove('border-warm');
            btn.classList.add('border-gold', 'bg-gold/10');
            state.answers[`step${stepNum}`] = btn.dataset.value;

            // Enable next button
            const nextBtn = stepEl.querySelector('.quiz-next, [id^="quiz-next-"]');
            if (nextBtn) nextBtn.disabled = false;
        });
    });

    // Next buttons
    document.querySelectorAll('.quiz-next, [id^="quiz-next-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.step < totalSteps) {
                showStep(state.step + 1);
                if (state.step === 5) buildSummary();
            }
        });
    });

    // Back buttons
    document.querySelectorAll('.quiz-back').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.step > 1) showStep(state.step - 1);
        });
    });

    // Build summary for step 5
    function buildSummary() {
        const labels = {
            step1: { 'wypadek-samochodowy': 'Wypadek samochodowy', 'wypadek-motocyklowy': 'Wypadek motocyklowy', 'potracenie': 'Potrącenie pieszego', 'wypadek-praca': 'Wypadek przy pracy', 'blad-medyczny': 'Błąd medyczny', 'smierc-bliskiej': 'Śmierć bliskiej osoby', 'wypadek-rolnictwo': 'Wypadek w rolnictwie', 'inne': 'Inne' },
            step2: { '30dni': 'W ciągu 30 dni', '1-6mies': '1–6 miesięcy temu', '6-12mies': '6–12 miesięcy temu', '1-3lata': '1–3 lata temu', '3+lata': 'Ponad 3 lata temu' },
            step3: { 'szpital': 'Pobyt w szpitalu', 'ambulatorium': 'Leczenie ambulatoryjne', 'uszczerbek': 'Trwały uszczerbek', 'niezdolnosc': 'Niezdolność do pracy', 'smierc': 'Śmierć osoby bliskiej', 'szkoda-materialna': 'Szkoda materialna' },
            step4: { 'nie-zgloszone': 'Jeszcze nie zgłoszone', 'czekam': 'Czekam na decyzję', 'za-malo': 'Wypłacono za mało', 'odmowa': 'Odmowa wypłaty', 'nie-wiem': 'Nie wiem co robić' },
        };
        const summaryEl = document.getElementById('quiz-summary');
        if (!summaryEl) return;
        summaryEl.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            const val = state.answers[`step${i}`];
            if (val && labels[`step${i}`]) {
                const div = document.createElement('div');
                div.textContent = `✓ ${labels[`step${i}`][val] || val}`;
                summaryEl.appendChild(div);
            }
        }
    }

    // Form submission
    const form = document.getElementById('quiz-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!window.formValidation.validateQuizForm()) return;

            const submitBtn = document.getElementById('quiz-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wysyłanie...';

            // Simulate submission (replace with real backend later)
            setTimeout(() => {
                // Hide form, show success
                document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
                const successEl = document.getElementById('quiz-success');
                successEl.classList.remove('hidden');

                // Success message based on hours
                const msgEl = document.getElementById('quiz-success-msg');
                msgEl.textContent = isBusinessHours()
                    ? 'Nasz specjalista oddzwoni w ciągu 30 minut.'
                    : 'Oddzwonimy w następnym dniu roboczym. Dziękujemy za cierpliwość.';

                // Copy summary
                const summarySource = document.getElementById('quiz-summary');
                const summaryTarget = document.getElementById('quiz-success-summary');
                if (summarySource && summaryTarget) {
                    summaryTarget.innerHTML = summarySource.innerHTML;
                }

                // Track event
                if (window.trackEvent) window.trackEvent('quiz_submitted', state.answers);
            }, 1000);
        });
    }

    // Track quiz steps
    const _originalShowStep = showStep;
    function showStepTracked(stepNum) {
        _originalShowStep(stepNum);
        if (window.trackEvent) window.trackEvent(`quiz_step_${stepNum}`, { step: stepNum });
    }
    // Replace next button handlers to use tracked version
    document.querySelectorAll('.quiz-next, [id^="quiz-next-"]').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); // remove old listeners
    });
    document.querySelectorAll('.quiz-next, [id^="quiz-next-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.step < totalSteps) {
                showStepTracked(state.step + 1);
                if (state.step === 5) buildSummary();
            }
        });
    });
});
```

- [ ] **Step 4: Add script tags to `index.html` before `</body>`**

Add before the existing `<script src="js/navigation.js"></script>`:

```html
<script src="js/form-validation.js"></script>
<script src="js/quiz.js"></script>
```

- [ ] **Step 5: Open in browser, test full quiz flow (all 5 steps), verify validation**

Expected: Quiz renders in white card, options highlight on click, next disabled until selection, step 5 shows summary + form, validation blocks empty submit, success screen shows after submit.

- [ ] **Step 6: Commit**

```bash
git add index.html js/quiz.js js/form-validation.js
git commit -m "feat: add hero section with 5-step diagnostic quiz"
```

---

### Task 3: Social Proof Bar + "Jak Działamy" Timeline + "Dlaczego My"

**Files:**
- Modify: `index.html` (add sections after hero)
- Create: `js/animations.js`

- [ ] **Step 1: Add social proof bar, timeline, and "Dlaczego my" HTML to `index.html` after hero section**

```html
<!-- SOCIAL PROOF BAR -->
<section class="bg-white py-8 border-b border-warm-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div class="count-up">
                <div class="font-heading text-3xl lg:text-4xl font-bold text-navy" data-count="500">0</div>
                <div class="text-txt/60 text-sm mt-1">Wygranych spraw</div>
            </div>
            <div class="count-up">
                <div class="font-heading text-3xl lg:text-4xl font-bold text-navy"><span data-count="15">0</span> mln zł</div>
                <div class="text-txt/60 text-sm mt-1">Uzyskanych odszkodowań</div>
            </div>
            <div class="count-up">
                <div class="font-heading text-3xl lg:text-4xl font-bold text-navy" data-count="98">0</div>
                <div class="text-txt/60 text-sm mt-1">% skuteczności</div>
            </div>
            <div class="count-up">
                <div class="font-heading text-3xl lg:text-4xl font-bold text-navy"><span data-count="10">0</span>+</div>
                <div class="text-txt/60 text-sm mt-1">Lat doświadczenia</div>
            </div>
        </div>
    </div>
</section>

<!-- JAK DZIAŁAMY -->
<section id="jak-dzialamy" class="py-16 lg:py-24 bg-warm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">Jak działamy?</h2>
            <p class="text-txt/60 max-w-2xl mx-auto">Przejrzysty proces w 4 krokach. Od pierwszego kontaktu do wypłaty odszkodowania.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="reveal relative bg-white rounded-2xl p-6 text-center card-hover">
                <div class="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="phone-call" class="w-7 h-7 text-gold"></i>
                </div>
                <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Krok 1</div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Bezpłatna konsultacja</h3>
                <p class="text-txt/60 text-sm">Opowiedz nam o swojej sprawie. Przeanalizujemy ją bez żadnych opłat.</p>
                <div class="text-xs text-txt/40 mt-3">~15 minut</div>
            </div>
            <div class="reveal relative bg-white rounded-2xl p-6 text-center card-hover">
                <div class="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="file-search" class="w-7 h-7 text-gold"></i>
                </div>
                <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Krok 2</div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Analiza dokumentacji</h3>
                <p class="text-txt/60 text-sm">Zbieramy dokumenty, analizujemy podstawy prawne i szacujemy kwotę.</p>
                <div class="text-xs text-txt/40 mt-3">1–3 dni</div>
            </div>
            <div class="reveal relative bg-white rounded-2xl p-6 text-center card-hover">
                <div class="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="scale" class="w-7 h-7 text-gold"></i>
                </div>
                <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Krok 3</div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Negocjacje</h3>
                <p class="text-txt/60 text-sm">Prowadzimy twarde negocjacje z ubezpieczycielem w Twoim imieniu.</p>
                <div class="text-xs text-txt/40 mt-3">2–8 tygodni</div>
            </div>
            <div class="reveal relative bg-white rounded-2xl p-6 text-center card-hover">
                <div class="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="banknote" class="w-7 h-7 text-gold"></i>
                </div>
                <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Krok 4</div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Wypłata</h3>
                <p class="text-txt/60 text-sm">Otrzymujesz odszkodowanie na swoje konto. Płacisz nam tylko prowizję od sukcesu.</p>
                <div class="text-xs text-txt/40 mt-3">Przelew w 7 dni</div>
            </div>
        </div>
    </div>
</section>

<!-- DLACZEGO MY -->
<section class="py-16 lg:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">Dlaczego my?</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="reveal text-center">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="shield-check" class="w-6 h-6 text-gold"></i>
                </div>
                <h3 class="font-bold text-navy mb-2">Bezpłatna konsultacja</h3>
                <p class="text-txt/60 text-sm">Nie pobieramy żadnych opłat wstępnych. Ryzyko zero.</p>
            </div>
            <div class="reveal text-center">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="trophy" class="w-6 h-6 text-gold"></i>
                </div>
                <h3 class="font-bold text-navy mb-2">Płacisz za sukces</h3>
                <p class="text-txt/60 text-sm">Prowizja naliczana wyłącznie od uzyskanego odszkodowania.</p>
            </div>
            <div class="reveal text-center">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="users" class="w-6 h-6 text-gold"></i>
                </div>
                <h3 class="font-bold text-navy mb-2">Doświadczony zespół</h3>
                <p class="text-txt/60 text-sm">Prawnicy, rzeczoznawcy i mediatorzy z wieloletnim stażem.</p>
            </div>
            <div class="reveal text-center">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="map-pin" class="w-6 h-6 text-gold"></i>
                </div>
                <h3 class="font-bold text-navy mb-2">Cała Polska</h3>
                <p class="text-txt/60 text-sm">Siedziba w Poznaniu, obsługujemy klientów w całym kraju.</p>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Create `js/animations.js` with count-up and scroll reveal**

```js
/**
 * Scroll-triggered animations: count-up numbers and reveal-on-scroll elements.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Count-up animation
    function animateCount(el) {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        const duration = 1500;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // Intersection observer for count-up elements
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

    // Scroll reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
```

- [ ] **Step 3: Add `<script src="js/animations.js"></script>` to `index.html` before `</body>`**

- [ ] **Step 4: Open in browser, verify count-up animates on scroll, timeline cards reveal, "Dlaczego my" renders**

- [ ] **Step 5: Commit**

```bash
git add index.html js/animations.js
git commit -m "feat: add social proof bar, timeline, and why-us sections"
```

---

### Task 4: Kalkulator odszkodowań

**Files:**
- Modify: `index.html` (add kalkulator section)
- Create: `js/calculator.js`

- [ ] **Step 1: Add kalkulator HTML to `index.html` after "Dlaczego my" section**

```html
<!-- KALKULATOR ODSZKODOWAŃ -->
<section id="kalkulator" class="py-16 lg:py-24 bg-warm">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">Kalkulator odszkodowań</h2>
            <p class="text-txt/60 max-w-2xl mx-auto">Sprawdź orientacyjną kwotę odszkodowania w 60 sekund.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div id="calc-container">
                <!-- Step 1: Event type -->
                <div id="calc-step-1">
                    <h3 class="font-heading text-xl font-bold text-navy mb-4">Typ zdarzenia</h3>
                    <div class="grid grid-cols-2 gap-3" id="calc-event-options">
                        <button class="calc-event-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm" data-value="komunikacyjny">
                            <i data-lucide="car" class="w-8 h-8 text-navy"></i>
                            Wypadek komunikacyjny
                        </button>
                        <button class="calc-event-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm" data-value="praca">
                            <i data-lucide="hard-hat" class="w-8 h-8 text-navy"></i>
                            Wypadek przy pracy
                        </button>
                        <button class="calc-event-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm" data-value="medyczny">
                            <i data-lucide="stethoscope" class="w-8 h-8 text-navy"></i>
                            Błąd medyczny
                        </button>
                        <button class="calc-event-option flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-warm hover:border-gold hover:bg-gold/5 transition-all text-sm" data-value="inne">
                            <i data-lucide="help-circle" class="w-8 h-8 text-navy"></i>
                            Inne
                        </button>
                    </div>
                </div>

                <!-- Step 2: Injuries (multi-select) -->
                <div id="calc-step-2" class="hidden mt-8">
                    <h3 class="font-heading text-xl font-bold text-navy mb-4">Rodzaj obrażeń <span class="text-sm font-normal text-txt/50">(możesz wybrać kilka)</span></h3>
                    <div class="grid grid-cols-2 gap-3" id="calc-injury-options">
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="zlamania" data-min="8000" data-max="25000">Złamania kości</button>
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="kregoslup" data-min="15000" data-max="60000">Urazy kręgosłupa / szyi</button>
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="glowa" data-min="10000" data-max="50000">Uraz głowy / wstrząs</button>
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="wewnetrzne" data-min="20000" data-max="80000">Urazy wewnętrzne</button>
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="blizny" data-min="5000" data-max="30000">Rany, blizny</button>
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="amputacja" data-min="50000" data-max="300000">Amputacja</button>
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="ptsd" data-min="10000" data-max="40000">PTSD / uszczerbek psychiczny</button>
                        <button class="calc-injury-option p-3 rounded-xl border-2 border-warm hover:border-gold transition-all text-sm text-left" data-value="smierc" data-min="30000" data-max="200000">Śmierć bliskiej osoby</button>
                    </div>
                    <p id="calc-injury-hint" class="text-cta text-xs mt-2 hidden">Wybierz co najmniej jedno obrażenie</p>
                </div>

                <!-- Step 3: Sliders -->
                <div id="calc-step-3" class="hidden mt-8">
                    <h3 class="font-heading text-xl font-bold text-navy mb-6">Szczegóły</h3>
                    <div class="space-y-6">
                        <div>
                            <div class="flex justify-between mb-2">
                                <label class="text-sm font-medium text-navy">Czas leczenia</label>
                                <span id="calc-treatment-value" class="text-sm font-bold text-cta">0 dni</span>
                            </div>
                            <input type="range" id="calc-treatment" min="0" max="365" value="0" class="w-full">
                        </div>
                        <div>
                            <div class="flex justify-between mb-2">
                                <label class="text-sm font-medium text-navy">Niezdolność do pracy</label>
                                <span id="calc-work-value" class="text-sm font-bold text-cta">0 dni</span>
                            </div>
                            <input type="range" id="calc-work" min="0" max="365" value="0" class="w-full">
                        </div>
                        <div>
                            <div class="flex justify-between mb-2">
                                <label class="text-sm font-medium text-navy">Trwały uszczerbek na zdrowiu</label>
                                <span id="calc-disability-value" class="text-sm font-bold text-cta">0%</span>
                            </div>
                            <input type="range" id="calc-disability" min="0" max="100" value="0" class="w-full">
                        </div>
                    </div>
                </div>

                <!-- Result -->
                <div id="calc-result" class="hidden mt-8">
                    <div class="bg-navy rounded-2xl p-6 sm:p-8 text-center">
                        <p class="text-white/60 text-sm mb-2">Orientacyjna kwota odszkodowania:</p>
                        <div class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gold mb-2">
                            <span id="calc-result-min">0</span> — <span id="calc-result-max">0</span> zł
                        </div>
                        <p class="text-white/40 text-xs mb-6">To orientacyjny szacunek. Dokładna kwota zależy od indywidualnych okoliczności sprawy.</p>
                        <div class="max-w-sm mx-auto">
                            <p class="text-white text-sm mb-4">Chcesz dokładną wycenę?</p>
                            <form id="calc-cta-form" class="space-y-3" novalidate>
                                <input type="text" id="calc-name" placeholder="Imię *" required minlength="2"
                                    class="w-full px-4 py-3 rounded-lg text-txt focus:outline-none focus:ring-2 focus:ring-gold">
                                <input type="tel" id="calc-phone" placeholder="Numer telefonu *" required
                                    class="w-full px-4 py-3 rounded-lg text-txt focus:outline-none focus:ring-2 focus:ring-gold">
                                <div class="flex items-start gap-2 text-left">
                                    <input type="checkbox" id="calc-consent" required class="mt-1 w-4 h-4 accent-cta">
                                    <label for="calc-consent" class="text-xs text-white/50">
                                        Wyrażam zgodę na przetwarzanie danych. <a href="polityka-prywatnosci.html" class="text-gold underline">Polityka prywatności</a> *
                                    </label>
                                </div>
                                <button type="submit" class="w-full bg-cta hover:bg-cta-hover text-white py-3 rounded-lg font-semibold transition-colors">
                                    Otrzymaj dokładną wycenę →
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Empty state message -->
                <div id="calc-empty" class="hidden mt-6 text-center text-txt/50 text-sm">
                    Uzupełnij dane powyżej, aby zobaczyć szacunek
                </div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Create `js/calculator.js`**

```js
/**
 * Kalkulator odszkodowań — interactive calculator with base amounts and multipliers.
 * Algorithm from spec: sum base amounts, apply treatment/work/disability multipliers, show as range.
 */

document.addEventListener('DOMContentLoaded', () => {
    const state = { eventType: null, injuries: new Set() };

    // Event type selection
    document.querySelectorAll('.calc-event-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.calc-event-option').forEach(o => {
                o.classList.remove('border-gold', 'bg-gold/10');
                o.classList.add('border-warm');
            });
            btn.classList.remove('border-warm');
            btn.classList.add('border-gold', 'bg-gold/10');
            state.eventType = btn.dataset.value;

            document.getElementById('calc-step-2').classList.remove('hidden');
            document.getElementById('calc-step-3').classList.remove('hidden');
            if (window.trackEvent) window.trackEvent('calculator_used', { type: btn.dataset.value });
            recalculate();
        });
    });

    // Injury multi-select (toggle)
    document.querySelectorAll('.calc-injury-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.value;
            if (state.injuries.has(val)) {
                state.injuries.delete(val);
                btn.classList.remove('border-gold', 'bg-gold/10');
                btn.classList.add('border-warm');
            } else {
                state.injuries.add(val);
                btn.classList.remove('border-warm');
                btn.classList.add('border-gold', 'bg-gold/10');
            }
            document.getElementById('calc-injury-hint').classList.toggle('hidden', state.injuries.size > 0);
            recalculate();
        });
    });

    // Slider listeners
    const treatmentSlider = document.getElementById('calc-treatment');
    const workSlider = document.getElementById('calc-work');
    const disabilitySlider = document.getElementById('calc-disability');

    [treatmentSlider, workSlider, disabilitySlider].forEach(slider => {
        if (slider) slider.addEventListener('input', recalculate);
    });

    function recalculate() {
        const treatment = parseInt(treatmentSlider?.value || 0);
        const work = parseInt(workSlider?.value || 0);
        const disability = parseInt(disabilitySlider?.value || 0);

        // Update labels
        const treatmentLabel = document.getElementById('calc-treatment-value');
        const workLabel = document.getElementById('calc-work-value');
        const disabilityLabel = document.getElementById('calc-disability-value');
        if (treatmentLabel) treatmentLabel.textContent = `${treatment} dni`;
        if (workLabel) workLabel.textContent = `${work} dni`;
        if (disabilityLabel) disabilityLabel.textContent = `${disability}%`;

        const resultEl = document.getElementById('calc-result');
        const emptyEl = document.getElementById('calc-empty');

        if (state.injuries.size === 0) {
            resultEl.classList.add('hidden');
            if (state.eventType) emptyEl.classList.remove('hidden');
            return;
        }

        emptyEl.classList.add('hidden');

        // Sum base amounts
        let baseMin = 0;
        let baseMax = 0;
        state.injuries.forEach(injury => {
            const btn = document.querySelector(`.calc-injury-option[data-value="${injury}"]`);
            if (btn) {
                baseMin += parseInt(btn.dataset.min);
                baseMax += parseInt(btn.dataset.max);
            }
        });

        // Multipliers (capped)
        const treatmentMult = Math.min(1.0 + (treatment / 365) * 0.5, 1.5);
        const workMult = Math.min(1.0 + (work / 365) * 0.8, 1.8);
        const disabilityMult = Math.min(1.0 + (disability / 100) * 2.0, 3.0);

        const totalMult = treatmentMult * workMult * disabilityMult;

        // Apply multipliers and create range (0.7x - 1.3x)
        const calcMin = Math.round((baseMin * totalMult * 0.7) / 1000) * 1000;
        const calcMax = Math.round((baseMax * totalMult * 1.3) / 1000) * 1000;

        // Format with spaces (Polish number formatting)
        const formatNum = n => n.toLocaleString('pl-PL');

        document.getElementById('calc-result-min').textContent = formatNum(calcMin);
        document.getElementById('calc-result-max').textContent = formatNum(calcMax);
        resultEl.classList.remove('hidden');

        if (window.trackEvent) window.trackEvent('calculator_result_shown', { min: calcMin, max: calcMax });
    }

    // CTA form
    const ctaForm = document.getElementById('calc-cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('calc-name').value;
            const phone = document.getElementById('calc-phone').value;
            const consent = document.getElementById('calc-consent').checked;

            if (!window.formValidation.validateName(name) || !window.formValidation.validatePhone(phone) || !consent) {
                return;
            }

            // Simulate submission
            const btn = ctaForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Wysyłanie...';

            setTimeout(() => {
                ctaForm.innerHTML = '<div class="text-center"><div class="text-green-400 text-lg font-bold mb-2">Dziękujemy!</div><p class="text-white/60 text-sm">Oddzwonimy wkrótce z dokładną wyceną.</p></div>';
                if (window.trackEvent) window.trackEvent('calculator_cta_clicked');
            }, 1000);
        });
    }
});
```

- [ ] **Step 3: Add `<script src="js/calculator.js"></script>` to `index.html`**

- [ ] **Step 4: Open in browser, test: select event → select injuries → move sliders → verify result updates live**

Expected: selecting injuries shows result section, sliders update numbers in real-time, CTA form validates and shows success.

- [ ] **Step 5: Commit**

```bash
git add index.html js/calculator.js
git commit -m "feat: add interactive compensation calculator with live results"
```

---

### Task 5: Usługi + Case Studies (with filter) + Opinie (carousel) + Blog Preview

**Files:**
- Modify: `index.html` (add 4 sections)

- [ ] **Step 1: Add usługi, case studies (with filter buttons), opinie (horizontal scroll carousel), and blog preview HTML after kalkulator section**

Case studies section must include filter buttons above the grid:
```html
<!-- Filter buttons -->
<div class="flex flex-wrap gap-2 justify-center mb-8">
    <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-navy text-white" data-filter="all">Wszystkie</button>
    <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-warm text-txt/60 hover:bg-navy hover:text-white transition-colors" data-filter="komunikacyjny">Komunikacyjne</button>
    <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-warm text-txt/60 hover:bg-navy hover:text-white transition-colors" data-filter="praca">Przy pracy</button>
    <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-warm text-txt/60 hover:bg-navy hover:text-white transition-colors" data-filter="smierc">Śmierć bliskiej osoby</button>
</div>
```
Each case study card gets `data-type="komunikacyjny"` etc. Filter JS in `animations.js`:
```js
document.querySelectorAll('.case-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        document.querySelectorAll('.case-filter').forEach(b => { b.classList.remove('bg-navy','text-white'); b.classList.add('bg-warm','text-txt/60'); });
        btn.classList.remove('bg-warm','text-txt/60');
        btn.classList.add('bg-navy','text-white');
        document.querySelectorAll('.case-card').forEach(card => {
            card.style.display = (filter === 'all' || card.dataset.type === filter) ? '' : 'none';
        });
    });
});
```

Opinie section uses horizontal scroll carousel instead of static grid:
```html
<div class="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
    <div class="snap-center shrink-0 w-80 bg-warm rounded-2xl p-6"><!-- testimonial card --></div>
    <!-- more cards... -->
</div>
```
Add to `css/styles.css`:
```css
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

After Opinie, add Blog Preview section:
```html
<!-- BLOG PREVIEW -->
<section class="py-16 lg:py-24 bg-warm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">Baza wiedzy</h2>
            <p class="text-txt/60">Porady i informacje, które pomogą Ci zrozumieć swoje prawa.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="blog/" class="reveal group bg-white rounded-2xl overflow-hidden card-hover block">
                <div class="p-6">
                    <span class="text-xs font-medium text-gold uppercase tracking-wider">Poradnik</span>
                    <h3 class="font-heading text-lg font-bold text-navy mt-2 mb-2 group-hover:text-gold transition-colors">Co robić po wypadku samochodowym?</h3>
                    <p class="text-txt/60 text-sm">Krok po kroku: od zabezpieczenia miejsca zdarzenia po zgłoszenie roszczenia.</p>
                </div>
            </a>
            <a href="blog/" class="reveal group bg-white rounded-2xl overflow-hidden card-hover block">
                <div class="p-6">
                    <span class="text-xs font-medium text-gold uppercase tracking-wider">Prawo</span>
                    <h3 class="font-heading text-lg font-bold text-navy mt-2 mb-2 group-hover:text-gold transition-colors">Przedawnienie roszczeń — ile masz czasu?</h3>
                    <p class="text-txt/60 text-sm">Terminy przedawnienia i wyjątki, o których musisz wiedzieć.</p>
                </div>
            </a>
            <a href="blog/" class="reveal group bg-white rounded-2xl overflow-hidden card-hover block">
                <div class="p-6">
                    <span class="text-xs font-medium text-gold uppercase tracking-wider">Poradnik</span>
                    <h3 class="font-heading text-lg font-bold text-navy mt-2 mb-2 group-hover:text-gold transition-colors">Ubezpieczyciel zaniżył odszkodowanie — co dalej?</h3>
                    <p class="text-txt/60 text-sm">Jak odwołać się od decyzji i uzyskać sprawiedliwą kwotę.</p>
                </div>
            </a>
        </div>
        <div class="text-center mt-8">
            <a href="blog/" class="text-gold font-semibold hover:underline">Zobacz wszystkie artykuły →</a>
        </div>
    </div>
</section>
```

The full usługi and case studies HTML follows below (with `data-type` and `case-card` classes):


```html
<!-- USŁUGI -->
<section id="uslugi" class="py-16 lg:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">W czym pomagamy</h2>
            <p class="text-txt/60 max-w-2xl mx-auto">Specjalizujemy się w pełnym zakresie odszkodowań. Każda sprawa jest dla nas ważna.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="odszkodowania-komunikacyjne.html" class="reveal group bg-warm rounded-2xl p-6 card-hover block">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold transition-colors">
                    <i data-lucide="car" class="w-6 h-6 text-gold group-hover:text-navy transition-colors"></i>
                </div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Wypadki komunikacyjne</h3>
                <p class="text-txt/60 text-sm mb-4">Odszkodowania po wypadkach samochodowych, motocyklowych, potrąceniach pieszych i rowerzystów.</p>
                <span class="text-gold text-sm font-semibold group-hover:underline">Dowiedz się więcej →</span>
            </a>
            <a href="odszkodowania-wypadki-przy-pracy.html" class="reveal group bg-warm rounded-2xl p-6 card-hover block">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold transition-colors">
                    <i data-lucide="hard-hat" class="w-6 h-6 text-gold group-hover:text-navy transition-colors"></i>
                </div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Wypadki przy pracy</h3>
                <p class="text-txt/60 text-sm mb-4">Odszkodowania za wypadki w miejscu pracy, choroby zawodowe, wypadki w drodze do pracy.</p>
                <span class="text-gold text-sm font-semibold group-hover:underline">Dowiedz się więcej →</span>
            </a>
            <a href="odszkodowania-bledy-medyczne.html" class="reveal group bg-warm rounded-2xl p-6 card-hover block">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold transition-colors">
                    <i data-lucide="stethoscope" class="w-6 h-6 text-gold group-hover:text-navy transition-colors"></i>
                </div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Błędy medyczne</h3>
                <p class="text-txt/60 text-sm mb-4">Odszkodowania za błędy lekarskie, zakażenia szpitalne, nieprawidłowe diagnozy.</p>
                <span class="text-gold text-sm font-semibold group-hover:underline">Dowiedz się więcej →</span>
            </a>
            <a href="odszkodowania-smierc-bliskiej-osoby.html" class="reveal group bg-warm rounded-2xl p-6 card-hover block">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold transition-colors">
                    <i data-lucide="heart" class="w-6 h-6 text-gold group-hover:text-navy transition-colors"></i>
                </div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Śmierć bliskiej osoby</h3>
                <p class="text-txt/60 text-sm mb-4">Zadośćuczynienie i odszkodowania dla rodzin ofiar wypadków i błędów medycznych.</p>
                <span class="text-gold text-sm font-semibold group-hover:underline">Dowiedz się więcej →</span>
            </a>
            <a href="odszkodowania-wypadki-rolnicze.html" class="reveal group bg-warm rounded-2xl p-6 card-hover block">
                <div class="w-12 h-12 bg-navy rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold transition-colors">
                    <i data-lucide="wheat" class="w-6 h-6 text-gold group-hover:text-navy transition-colors"></i>
                </div>
                <h3 class="font-heading text-lg font-bold text-navy mb-2">Wypadki w rolnictwie</h3>
                <p class="text-txt/60 text-sm mb-4">Odszkodowania z KRUS za wypadki przy pracach rolnych i w gospodarstwach.</p>
                <span class="text-gold text-sm font-semibold group-hover:underline">Dowiedz się więcej →</span>
            </a>
            <a href="#quiz" class="reveal group bg-navy rounded-2xl p-6 card-hover block">
                <div class="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center mb-4">
                    <i data-lucide="message-circle" class="w-6 h-6 text-gold"></i>
                </div>
                <h3 class="font-heading text-lg font-bold text-white mb-2">Inna sprawa?</h3>
                <p class="text-white/60 text-sm mb-4">Nie znalazłeś swojej sytuacji? Opisz ją — bezpłatnie ocenimy Twoje szanse.</p>
                <span class="text-gold text-sm font-semibold group-hover:underline">Wypełnij formularz →</span>
            </a>
        </div>
    </div>
</section>

<!-- CASE STUDIES -->
<section id="case-studies" class="py-16 lg:py-24 bg-warm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">Nasze sukcesy</h2>
            <p class="text-txt/60 max-w-2xl mx-auto">Konkretne wyniki, nie puste obietnice. Zobacz ile uzyskaliśmy dla naszych klientów.</p>
        </div>
        <!-- Filter buttons -->
        <div class="flex flex-wrap gap-2 justify-center mb-8">
            <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-navy text-white" data-filter="all">Wszystkie</button>
            <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-warm text-txt/60 hover:bg-navy hover:text-white transition-colors" data-filter="komunikacyjny">Komunikacyjne</button>
            <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-warm text-txt/60 hover:bg-navy hover:text-white transition-colors" data-filter="praca">Przy pracy</button>
            <button class="case-filter px-4 py-2 rounded-full text-sm font-medium bg-warm text-txt/60 hover:bg-navy hover:text-white transition-colors" data-filter="smierc">Śmierć bliskiej osoby</button>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Case 1 -->
            <div class="reveal case-card bg-white rounded-2xl overflow-hidden card-hover" data-type="komunikacyjny">
                <div class="bg-navy p-4 flex items-center gap-3">
                    <i data-lucide="car" class="w-5 h-5 text-gold"></i>
                    <span class="text-white text-sm font-medium">Wypadek komunikacyjny</span>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <p class="text-xs text-txt/40 mb-1">Ubezpieczyciel oferował</p>
                            <p class="text-lg font-bold text-txt/40 line-through">15 000 zł</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-txt/40 mb-1">Uzyskaliśmy</p>
                            <p class="text-2xl font-bold text-navy">120 000 zł</p>
                        </div>
                    </div>
                    <div class="h-3 bg-warm rounded-full overflow-hidden mb-2">
                        <div class="h-full bg-gradient-to-r from-gold to-cta rounded-full" style="width: 100%"></div>
                    </div>
                    <p class="text-cta font-bold text-sm text-right">8x więcej</p>
                    <p class="text-txt/60 text-sm mt-4">Po wypadku na S7 ubezpieczyciel zaproponował 15 tys. Nasz zespół uzyskał 8-krotnie wyższe odszkodowanie.</p>
                    <p class="text-txt/40 text-xs mt-2">Czas trwania: 4 miesiące</p>
                </div>
            </div>
            <!-- Case 2 -->
            <div class="reveal case-card bg-white rounded-2xl overflow-hidden card-hover" data-type="praca">
                <div class="bg-navy p-4 flex items-center gap-3">
                    <i data-lucide="hard-hat" class="w-5 h-5 text-gold"></i>
                    <span class="text-white text-sm font-medium">Wypadek przy pracy</span>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <p class="text-xs text-txt/40 mb-1">Ubezpieczyciel oferował</p>
                            <p class="text-lg font-bold text-txt/40 line-through">8 000 zł</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-txt/40 mb-1">Uzyskaliśmy</p>
                            <p class="text-2xl font-bold text-navy">67 000 zł</p>
                        </div>
                    </div>
                    <div class="h-3 bg-warm rounded-full overflow-hidden mb-2">
                        <div class="h-full bg-gradient-to-r from-gold to-cta rounded-full" style="width: 100%"></div>
                    </div>
                    <p class="text-cta font-bold text-sm text-right">8.4x więcej</p>
                    <p class="text-txt/60 text-sm mt-4">Uraz kręgosłupa na budowie. Pracodawca i ubezpieczyciel bagatelizowali sprawę.</p>
                    <p class="text-txt/40 text-xs mt-2">Czas trwania: 3 miesiące</p>
                </div>
            </div>
            <!-- Case 3 -->
            <div class="reveal case-card bg-white rounded-2xl overflow-hidden card-hover" data-type="smierc">
                <div class="bg-navy p-4 flex items-center gap-3">
                    <i data-lucide="heart" class="w-5 h-5 text-gold"></i>
                    <span class="text-white text-sm font-medium">Śmierć bliskiej osoby</span>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <p class="text-xs text-txt/40 mb-1">Ubezpieczyciel oferował</p>
                            <p class="text-lg font-bold text-txt/40 line-through">40 000 zł</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-txt/40 mb-1">Uzyskaliśmy</p>
                            <p class="text-2xl font-bold text-navy">310 000 zł</p>
                        </div>
                    </div>
                    <div class="h-3 bg-warm rounded-full overflow-hidden mb-2">
                        <div class="h-full bg-gradient-to-r from-gold to-cta rounded-full" style="width: 100%"></div>
                    </div>
                    <p class="text-cta font-bold text-sm text-right">7.8x więcej</p>
                    <p class="text-txt/60 text-sm mt-4">Rodzina straciła bliskiego w wypadku. Uzyskaliśmy zadośćuczynienie dla 3 członków rodziny.</p>
                    <p class="text-txt/40 text-xs mt-2">Czas trwania: 6 miesięcy</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- OPINIE KLIENTÓW (carousel) -->
<section class="py-16 lg:py-24 bg-white overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">Co mówią nasi klienci</h2>
        </div>
        <div class="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
            <div class="reveal snap-center shrink-0 w-80 bg-warm rounded-2xl p-6">
                <div class="flex gap-1 mb-4">
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                </div>
                <p class="text-txt/70 text-sm mb-4 italic">"Po wypadku nie wiedziałam co robić. Kancelaria przejęła wszystko — od dokumentów po negocjacje. Uzyskali 5x więcej niż oferował ubezpieczyciel."</p>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-gold font-bold text-sm">AK</div>
                    <div>
                        <p class="font-semibold text-navy text-sm">Anna K.</p>
                        <p class="text-txt/40 text-xs">Wypadek komunikacyjny</p>
                    </div>
                </div>
            </div>
            <div class="reveal snap-center shrink-0 w-80 bg-warm rounded-2xl p-6">
                <div class="flex gap-1 mb-4">
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                </div>
                <p class="text-txt/70 text-sm mb-4 italic">"Profesjonalne podejście od pierwszego kontaktu. Wszystko załatwione w 3 miesiące. Polecam każdemu kto miał wypadek przy pracy."</p>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-gold font-bold text-sm">MN</div>
                    <div>
                        <p class="font-semibold text-navy text-sm">Marek N.</p>
                        <p class="text-txt/40 text-xs">Wypadek przy pracy</p>
                    </div>
                </div>
            </div>
            <div class="reveal snap-center shrink-0 w-80 bg-warm rounded-2xl p-6">
                <div class="flex gap-1 mb-4">
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-gold text-gold"></i>
                </div>
                <p class="text-txt/70 text-sm mb-4 italic">"Ubezpieczyciel odmówił wypłaty. Kancelaria podjęła sprawę i w ciągu 5 miesięcy uzyskała pełne odszkodowanie. Dziękuję!"</p>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-gold font-bold text-sm">JP</div>
                    <div>
                        <p class="font-semibold text-navy text-sm">Joanna P.</p>
                        <p class="text-txt/40 text-xs">Błąd medyczny</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Open in browser, verify all 3 sections render, cards hover, icons display**

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add services, case studies, and testimonials sections"
```

---

### Task 6: FAQ + Kontakt/Footer + Cookie Consent + Analytics

**Files:**
- Modify: `index.html` (add FAQ, contact, footer, cookie banner)
- Create: `js/cookie-consent.js`
- Create: `js/analytics.js`

- [ ] **Step 1: Add FAQ, contact section, footer, and cookie banner HTML**

```html
<!-- FAQ -->
<section class="py-16 lg:py-24 bg-warm">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-navy mb-4">Najczęściej zadawane pytania</h2>
        </div>
        <div class="space-y-3">
            <div class="bg-white rounded-xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy hover:bg-warm/50 transition-colors">
                    <span>Ile kosztuje konsultacja?</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                </button>
                <div class="faq-answer">
                    <p class="px-5 pb-5 text-txt/60 text-sm">Konsultacja jest całkowicie bezpłatna i niezobowiązująca. Przeanalizujemy Twoją sprawę i ocenimy szanse na uzyskanie odszkodowania bez żadnych opłat.</p>
                </div>
            </div>
            <div class="bg-white rounded-xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy hover:bg-warm/50 transition-colors">
                    <span>Ile trwa cały proces?</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                </button>
                <div class="faq-answer">
                    <p class="px-5 pb-5 text-txt/60 text-sm">Większość spraw rozwiązujemy w ciągu 2-6 miesięcy. Czas zależy od złożoności sprawy i postawy ubezpieczyciela. Sprawy sądowe mogą trwać dłużej.</p>
                </div>
            </div>
            <div class="bg-white rounded-xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy hover:bg-warm/50 transition-colors">
                    <span>Co jeśli ubezpieczyciel odmówił wypłaty?</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                </button>
                <div class="faq-answer">
                    <p class="px-5 pb-5 text-txt/60 text-sm">Odmowa ubezpieczyciela to nie koniec drogi. Często odmawiają bezzasadnie licząc, że klient zrezygnuje. Podejmujemy takie sprawy i skutecznie je wygrywamy.</p>
                </div>
            </div>
            <div class="bg-white rounded-xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy hover:bg-warm/50 transition-colors">
                    <span>Jakie dokumenty potrzebuję?</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                </button>
                <div class="faq-answer">
                    <p class="px-5 pb-5 text-txt/60 text-sm">Na początek wystarczy opis zdarzenia. Pomożemy Ci zebrać resztę dokumentów — protokoły policji, dokumentację medyczną, rachunki. Zajmiemy się wszystkim.</p>
                </div>
            </div>
            <div class="bg-white rounded-xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy hover:bg-warm/50 transition-colors">
                    <span>Ile to kosztuje?</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                </button>
                <div class="faq-answer">
                    <p class="px-5 pb-5 text-txt/60 text-sm">Nie pobieramy opłat wstępnych. Nasze wynagrodzenie to prowizja naliczana wyłącznie od uzyskanego odszkodowania. Jeśli nie wygramy — nie płacisz nic.</p>
                </div>
            </div>
            <div class="bg-white rounded-xl overflow-hidden">
                <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy hover:bg-warm/50 transition-colors">
                    <span>Czy sprawa może się przedawnić?</span>
                    <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                </button>
                <div class="faq-answer">
                    <p class="px-5 pb-5 text-txt/60 text-sm">Tak. Standardowy termin przedawnienia wynosi 3 lata od dnia zdarzenia, ale są wyjątki — np. sprawy karne lub roszczenia niepełnoletnich. Skontaktuj się z nami, żebyśmy ocenili Twoją sytuację.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- KONTAKT -->
<section id="kontakt" class="py-16 lg:py-24 bg-navy">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-2 lg:gap-16">
            <div class="mb-12 lg:mb-0">
                <h2 class="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">Skontaktuj się z nami</h2>
                <p class="text-white/60 mb-8">Bezpłatna konsultacja. Bez zobowiązań. Odpowiadamy w ciągu 30 minut w godzinach pracy.</p>
                <div class="space-y-4">
                    <a href="tel:+48XXXXXXXXX" class="flex items-center gap-4 text-white hover:text-gold transition-colors">
                        <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <i data-lucide="phone" class="w-5 h-5 text-gold"></i>
                        </div>
                        <div>
                            <p class="text-white/40 text-xs">Telefon</p>
                            <p class="font-semibold">+48 XXX XXX XXX</p>
                        </div>
                    </a>
                    <a href="mailto:kontakt@example.pl" class="flex items-center gap-4 text-white hover:text-gold transition-colors">
                        <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <i data-lucide="mail" class="w-5 h-5 text-gold"></i>
                        </div>
                        <div>
                            <p class="text-white/40 text-xs">Email</p>
                            <p class="font-semibold">kontakt@example.pl</p>
                        </div>
                    </a>
                    <div class="flex items-center gap-4 text-white">
                        <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <i data-lucide="map-pin" class="w-5 h-5 text-gold"></i>
                        </div>
                        <div>
                            <p class="text-white/40 text-xs">Biuro</p>
                            <p class="font-semibold">Poznań • Obsługujemy całą Polskę</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 text-white">
                        <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <i data-lucide="clock" class="w-5 h-5 text-gold"></i>
                        </div>
                        <div>
                            <p class="text-white/40 text-xs">Godziny pracy</p>
                            <p class="font-semibold">Pn–Pt 8:00–18:00 • Sb 9:00–14:00</p>
                        </div>
                    </div>
                </div>
                <!-- Google Maps Embed -->
                <div class="mt-8 rounded-xl overflow-hidden h-48">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2434.0!2d16.9!3d52.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPozna%C5%84!5e0!3m2!1spl!2spl" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Lokalizacja biura w Poznaniu"></iframe>
                </div>
            </div>
            <div>
                <form id="contact-form" class="bg-white/5 rounded-2xl p-6 sm:p-8 backdrop-blur-sm" novalidate>
                    <div class="space-y-4">
                        <input type="text" id="contact-name" placeholder="Imię *" required minlength="2"
                            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 focus:border-gold focus:outline-none">
                        <p class="text-red-400 text-xs mt-1 hidden" id="contact-name-error">Podaj swoje imię (min. 2 znaki)</p>
                        <input type="tel" id="contact-phone" placeholder="Numer telefonu *" required
                            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 focus:border-gold focus:outline-none">
                        <input type="email" id="contact-email" placeholder="Email (opcjonalnie)"
                            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 focus:border-gold focus:outline-none">
                        <select id="contact-type" class="w-full px-4 py-3 rounded-lg bg-white/10 text-white/40 border border-white/10 focus:border-gold focus:outline-none">
                            <option value="">Rodzaj sprawy (opcjonalnie)</option>
                            <option value="komunikacyjny">Wypadek komunikacyjny</option>
                            <option value="praca">Wypadek przy pracy</option>
                            <option value="medyczny">Błąd medyczny</option>
                            <option value="smierc">Śmierć bliskiej osoby</option>
                            <option value="rolnictwo">Wypadek w rolnictwie</option>
                            <option value="inne">Inne</option>
                        </select>
                        <textarea id="contact-message" placeholder="Opisz swoją sytuację (opcjonalnie)" rows="4"
                            class="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 focus:border-gold focus:outline-none resize-none"></textarea>
                        <div class="flex items-start gap-2">
                            <input type="checkbox" id="contact-consent" required class="mt-1 w-4 h-4 accent-cta">
                            <label for="contact-consent" class="text-xs text-white/50">
                                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu i analizy sprawy.
                                <a href="polityka-prywatnosci.html" class="text-gold underline">Polityka prywatności</a> *
                            </label>
                        </div>
                        <div class="flex items-start gap-2">
                            <input type="checkbox" id="contact-marketing" class="mt-1 w-4 h-4 accent-cta">
                            <label for="contact-marketing" class="text-xs text-white/50">
                                Wyrażam zgodę na kontakt marketingowy (opcjonalne)
                            </label>
                        </div>
                    </div>
                    <button type="submit" id="contact-submit" class="w-full mt-6 bg-cta hover:bg-cta-hover text-white py-3 rounded-lg font-semibold transition-colors">
                        Wyślij wiadomość →
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>

<!-- FOOTER -->
<footer class="bg-navy-dark py-12 border-t border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
                <h3 class="text-gold font-heading font-bold text-lg mb-4">Odszkodowania</h3>
                <p class="text-white/40 text-sm">Profesjonalna pomoc w uzyskaniu odszkodowań. Bezpłatna konsultacja, prowizja tylko od sukcesu.</p>
            </div>
            <div>
                <h4 class="text-white font-semibold text-sm mb-4">Usługi</h4>
                <ul class="space-y-2 text-white/40 text-sm">
                    <li><a href="odszkodowania-komunikacyjne.html" class="hover:text-gold transition-colors">Wypadki komunikacyjne</a></li>
                    <li><a href="odszkodowania-wypadki-przy-pracy.html" class="hover:text-gold transition-colors">Wypadki przy pracy</a></li>
                    <li><a href="odszkodowania-bledy-medyczne.html" class="hover:text-gold transition-colors">Błędy medyczne</a></li>
                    <li><a href="odszkodowania-smierc-bliskiej-osoby.html" class="hover:text-gold transition-colors">Śmierć bliskiej osoby</a></li>
                    <li><a href="odszkodowania-wypadki-rolnicze.html" class="hover:text-gold transition-colors">Wypadki w rolnictwie</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold text-sm mb-4">Informacje</h4>
                <ul class="space-y-2 text-white/40 text-sm">
                    <li><a href="jak-dzialamy.html" class="hover:text-gold transition-colors">Jak działamy</a></li>
                    <li><a href="kalkulator.html" class="hover:text-gold transition-colors">Kalkulator odszkodowań</a></li>
                    <li><a href="blog/" class="hover:text-gold transition-colors">Blog</a></li>
                    <li><a href="kontakt.html" class="hover:text-gold transition-colors">Kontakt</a></li>
                    <li><a href="polityka-prywatnosci.html" class="hover:text-gold transition-colors">Polityka prywatności</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold text-sm mb-4">Kontakt</h4>
                <ul class="space-y-2 text-white/40 text-sm">
                    <li><a href="tel:+48XXXXXXXXX" class="hover:text-gold transition-colors">+48 XXX XXX XXX</a></li>
                    <li><a href="mailto:kontakt@example.pl" class="hover:text-gold transition-colors">kontakt@example.pl</a></li>
                    <li>Poznań, Polska</li>
                    <li>Pn–Pt 8:00–18:00</li>
                    <li>Sb 9:00–14:00</li>
                </ul>
                <div class="flex gap-3 mt-4">
                    <a href="#" class="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gold/20 transition-colors" aria-label="Facebook">
                        <i data-lucide="facebook" class="w-4 h-4 text-white/60"></i>
                    </a>
                    <a href="#" class="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gold/20 transition-colors" aria-label="LinkedIn">
                        <i data-lucide="linkedin" class="w-4 h-4 text-white/60"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="border-t border-white/5 pt-8 text-center text-white/30 text-xs">
            <p>&copy; 2026 Odszkodowania. Wszelkie prawa zastrzeżone.</p>
        </div>
    </div>
</footer>

<!-- COOKIE CONSENT BANNER -->
<div id="cookie-banner" class="fixed bottom-0 left-0 right-0 z-50 bg-navy border-t border-white/10 p-4 hidden">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-white/70 text-sm">Ta strona używa plików cookie w celu zapewnienia najlepszej jakości usług. <a href="polityka-prywatnosci.html" class="text-gold underline">Polityka prywatności</a></p>
        <div class="flex gap-3">
            <button id="cookie-accept" class="bg-cta hover:bg-cta-hover text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">Akceptuję</button>
            <button id="cookie-reject" class="border border-white/20 text-white/60 px-6 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">Tylko niezbędne</button>
        </div>
    </div>
</div>
```

- [ ] **Step 2: Create `js/cookie-consent.js`**

```js
/**
 * Cookie consent banner. Blocks GA4 until user accepts.
 * Stores preference in localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

    const consent = localStorage.getItem('cookie-consent');

    if (!consent) {
        banner.classList.remove('hidden');
    } else if (consent === 'accepted') {
        loadAnalytics();
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'accepted');
            banner.classList.add('hidden');
            loadAnalytics();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'rejected');
            banner.classList.add('hidden');
        });
    }

    function loadAnalytics() {
        // Load GA4 script dynamically
        if (document.getElementById('ga4-script')) return;
        const GA_ID = 'G-XXXXXXXXXX'; // Replace with real GA4 ID
        const script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);
    }
});
```

- [ ] **Step 3: Create `js/analytics.js`**

```js
/**
 * GA4 event tracking wrapper. Safe to call before GA4 loads (events are no-ops).
 */

window.trackEvent = function(eventName, params) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
    }
};

// Auto-track phone clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="tel:"]');
    if (link) window.trackEvent('phone_clicked', { number: link.href });

    // Sticky bar clicks
    const stickyLink = e.target.closest('#sticky-bar a');
    if (stickyLink) window.trackEvent('cta_sticky_bar_clicked');

    // Case study views
    const caseCard = e.target.closest('.case-card');
    if (caseCard) window.trackEvent('case_study_viewed', { type: caseCard.dataset.type });
});

// FAQ toggle
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.nextElementSibling;
            const icon = btn.querySelector('[data-lucide]');
            const isOpen = answer.classList.contains('open');

            // Close all others
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
            document.querySelectorAll('.faq-toggle [data-lucide]').forEach(i => i.style.transform = '');

            if (!isOpen) {
                answer.classList.add('open');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const phone = document.getElementById('contact-phone').value;
            const consent = document.getElementById('contact-consent').checked;

            if (!window.formValidation.validateName(name) || !window.formValidation.validatePhone(phone) || !consent) return;

            const btn = document.getElementById('contact-submit');
            btn.disabled = true;
            btn.textContent = 'Wysyłanie...';

            setTimeout(() => {
                contactForm.innerHTML = `
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <h3 class="text-white font-heading text-xl font-bold mb-2">Dziękujemy!</h3>
                        <p class="text-white/60 text-sm">Skontaktujemy się z Tobą wkrótce.</p>
                    </div>`;
                window.trackEvent('form_submitted', { form: 'contact' });
            }, 1000);
        });
    }
});
```

- [ ] **Step 4: Add script tags to `index.html` (before navigation.js)**

```html
<script src="js/cookie-consent.js"></script>
<script src="js/analytics.js"></script>
```

- [ ] **Step 5: Verify FAQ accordion, contact form validation, cookie banner, footer links**

- [ ] **Step 6: Commit**

```bash
git add index.html js/cookie-consent.js js/analytics.js
git commit -m "feat: add FAQ, contact form, footer, cookie consent, analytics"
```

---

### Task 7: SEO Schema Markup (JSON-LD)

**Files:**
- Modify: `index.html` (add JSON-LD in `<head>`)

- [ ] **Step 1: Add JSON-LD schema to `<head>` of `index.html`**

```html
<!-- Schema.org JSON-LD -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "LegalService"],
    "name": "Odszkodowania",
    "description": "Profesjonalna pomoc w uzyskaniu odszkodowań po wypadkach. Bezpłatna konsultacja, prowizja tylko od sukcesu.",
    "url": "https://example.pl",
    "telephone": "+48XXXXXXXXX",
    "email": "kontakt@example.pl",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Poznań",
        "addressCountry": "PL"
    },
    "areaServed": {
        "@type": "Country",
        "name": "Polska"
    },
    "openingHoursSpecification": [
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
            "opens": "08:00",
            "closes": "18:00"
        },
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "09:00",
            "closes": "14:00"
        }
    ],
    "priceRange": "Bezpłatna konsultacja"
}
</script>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile kosztuje konsultacja?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Konsultacja jest całkowicie bezpłatna i niezobowiązująca. Przeanalizujemy Twoją sprawę i ocenimy szanse na uzyskanie odszkodowania bez żadnych opłat."
            }
        },
        {
            "@type": "Question",
            "name": "Ile trwa cały proces?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Większość spraw rozwiązujemy w ciągu 2-6 miesięcy. Czas zależy od złożoności sprawy i postawy ubezpieczyciela."
            }
        },
        {
            "@type": "Question",
            "name": "Co jeśli ubezpieczyciel odmówił wypłaty?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Odmowa ubezpieczyciela to nie koniec drogi. Często odmawiają bezzasadnie licząc, że klient zrezygnuje. Podejmujemy takie sprawy i skutecznie je wygrywamy."
            }
        },
        {
            "@type": "Question",
            "name": "Ile to kosztuje?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nie pobieramy opłat wstępnych. Nasze wynagrodzenie to prowizja naliczana wyłącznie od uzyskanego odszkodowania. Jeśli nie wygramy — nie płacisz nic."
            }
        },
        {
            "@type": "Question",
            "name": "Czy sprawa może się przedawnić?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak. Standardowy termin przedawnienia wynosi 3 lata od dnia zdarzenia, ale są wyjątki — np. sprawy karne lub roszczenia niepełnoletnich."
            }
        }
    ]
}
</script>
```

- [ ] **Step 2: Validate JSON-LD**

Open https://validator.schema.org/ and paste the JSON-LD blocks. Verify no errors for LocalBusiness, LegalService, FAQPage.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add SEO schema markup (LocalBusiness, LegalService, FAQPage)"
```

---

### Task 8: Service Subpage Template + First 3 Service Pages

**Files:**
- Create: `odszkodowania-komunikacyjne.html`
- Create: `odszkodowania-wypadki-przy-pracy.html`
- Create: `odszkodowania-bledy-medyczne.html`

- [ ] **Step 1: Create `odszkodowania-komunikacyjne.html` as the full template**

This is the reference template — all other service pages follow this structure:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Odszkodowania po wypadkach komunikacyjnych. Bezpłatna analiza sprawy. Uzyskujemy nawet 8x więcej niż oferuje ubezpieczyciel.">
    <title>Odszkodowania komunikacyjne — Wypadki samochodowe, motocyklowe | Bezpłatna konsultacja</title>

    <!-- Same head as index.html: Tailwind, fonts, Lucide, styles.css -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: { navy: '#1A1F36', 'navy-dark': '#121526', gold: '#D4A843', 'gold-light': '#E8C76A', cta: '#E8652D', 'cta-hover': '#D4561F', warm: '#F7F5F2', 'warm-dark': '#EDE9E4', txt: '#2D2D2D' },
                    fontFamily: { heading: ['"Playfair Display"', 'serif'], body: ['"Inter"', 'sans-serif'] },
                },
            },
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="css/styles.css">

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": "https://example.pl/" },
            { "@type": "ListItem", "position": 2, "name": "Odszkodowania komunikacyjne", "item": "https://example.pl/odszkodowania-komunikacyjne.html" }
        ]
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Odszkodowania komunikacyjne",
        "description": "Pomoc prawna w uzyskaniu odszkodowania po wypadku komunikacyjnym.",
        "provider": { "@type": "LegalService", "name": "Odszkodowania" },
        "areaServed": { "@type": "Country", "name": "Polska" }
    }
    </script>
</head>
<body class="font-body text-txt bg-warm">

    <!-- NAV: copy from index.html -->
    <nav id="main-nav" class="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 lg:h-20">
                <a href="/" class="text-white font-heading text-xl lg:text-2xl font-bold"><span class="text-gold">Odszkodowania</span></a>
                <div class="hidden lg:flex items-center gap-8">
                    <a href="index.html#uslugi" class="text-white/80 hover:text-gold transition-colors text-sm">Usługi</a>
                    <a href="index.html#jak-dzialamy" class="text-white/80 hover:text-gold transition-colors text-sm">Jak działamy</a>
                    <a href="kalkulator.html" class="text-white/80 hover:text-gold transition-colors text-sm">Kalkulator</a>
                    <a href="index.html#case-studies" class="text-white/80 hover:text-gold transition-colors text-sm">Sukcesy</a>
                    <a href="blog/" class="text-white/80 hover:text-gold transition-colors text-sm">Blog</a>
                    <a href="kontakt.html" class="text-white/80 hover:text-gold transition-colors text-sm">Kontakt</a>
                </div>
                <div class="hidden lg:flex items-center gap-4">
                    <a href="tel:+48XXXXXXXXX" class="text-gold hover:text-gold-light transition-colors text-sm font-medium flex items-center gap-2">
                        <i data-lucide="phone" class="w-4 h-4"></i> +48 XXX XXX XXX
                    </a>
                    <a href="index.html#quiz" class="bg-cta hover:bg-cta-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">Bezpłatna konsultacja</a>
                </div>
                <button id="mobile-menu-btn" class="lg:hidden text-white p-2" aria-label="Menu"><i data-lucide="menu" class="w-6 h-6"></i></button>
            </div>
        </div>
    </nav>

    <main class="pt-20">
        <!-- Breadcrumb -->
        <div class="bg-white border-b border-warm-dark">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <nav class="text-sm text-txt/50">
                    <a href="/" class="hover:text-gold">Strona główna</a>
                    <span class="mx-2">›</span>
                    <span class="text-navy font-medium">Odszkodowania komunikacyjne</span>
                </nav>
            </div>
        </div>

        <!-- Hero -->
        <section class="bg-gradient-to-b from-navy to-navy-dark py-16 lg:py-24">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="font-heading text-3xl lg:text-5xl font-bold text-white mb-6">Odszkodowania po wypadkach komunikacyjnych</h1>
                <p class="text-white/70 text-lg max-w-2xl mx-auto mb-8">Ubezpieczyciele zaniżają wypłaty nawet o 80%. Pomagamy uzyskać pełne odszkodowanie po wypadkach samochodowych, motocyklowych i potrąceniach.</p>
                <a href="index.html#quiz" class="inline-block bg-cta hover:bg-cta-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors">Bezpłatna analiza sprawy →</a>
            </div>
        </section>

        <!-- Content -->
        <section class="py-16 lg:py-24">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="prose max-w-none">
                    <h2 class="font-heading text-2xl font-bold text-navy mb-4">Komu pomagamy?</h2>
                    <p class="text-txt/70 mb-6">Specjalizujemy się w odszkodowaniach dla ofiar wypadków komunikacyjnych na terenie całej Polski. Pomagamy kierowcom, pasażerom, pieszym, rowerzystom i motocyklistom — niezależnie od tego, kto spowodował wypadek.</p>

                    <h2 class="font-heading text-2xl font-bold text-navy mb-4 mt-12">Co możesz uzyskać?</h2>
                    <ul class="space-y-3 text-txt/70 mb-6">
                        <li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-5 h-5 text-gold shrink-0 mt-0.5"></i> Zadośćuczynienie za ból i cierpienie</li>
                        <li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-5 h-5 text-gold shrink-0 mt-0.5"></i> Zwrot kosztów leczenia i rehabilitacji</li>
                        <li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-5 h-5 text-gold shrink-0 mt-0.5"></i> Odszkodowanie za utracone dochody</li>
                        <li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-5 h-5 text-gold shrink-0 mt-0.5"></i> Renta na przyszłość (przy trwałym uszczerbku)</li>
                        <li class="flex items-start gap-3"><i data-lucide="check-circle" class="w-5 h-5 text-gold shrink-0 mt-0.5"></i> Zwrot kosztów naprawy lub wartość pojazdu</li>
                    </ul>

                    <!-- Mini case study -->
                    <div class="bg-warm rounded-2xl p-6 my-8">
                        <h3 class="font-heading text-lg font-bold text-navy mb-3">Przykładowa sprawa</h3>
                        <div class="flex justify-between items-center mb-3">
                            <div><span class="text-txt/40 text-sm">Ubezpieczyciel:</span> <span class="font-bold text-txt/40 line-through">15 000 zł</span></div>
                            <div><span class="text-txt/40 text-sm">Uzyskaliśmy:</span> <span class="font-bold text-navy text-xl">120 000 zł</span></div>
                        </div>
                        <p class="text-txt/60 text-sm">Po wypadku na S7 ubezpieczyciel zaproponował 15 tys. zł. Nasz zespół przeprowadził negocjacje i uzyskał 8-krotnie wyższe odszkodowanie.</p>
                    </div>

                    <!-- FAQ -->
                    <h2 class="font-heading text-2xl font-bold text-navy mb-4 mt-12">Najczęstsze pytania</h2>
                    <div class="space-y-3">
                        <div class="bg-white rounded-xl border border-warm-dark overflow-hidden">
                            <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy">
                                <span>Czy mogę dochodzić odszkodowania jeśli sam spowodowałem wypadek?</span>
                                <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                            </button>
                            <div class="faq-answer"><p class="px-5 pb-5 text-txt/60 text-sm">Jeśli masz polisę NNW lub AC, możesz uzyskać odszkodowanie nawet jako sprawca. Skontaktuj się z nami — przeanalizujemy Twoje polisy.</p></div>
                        </div>
                        <div class="bg-white rounded-xl border border-warm-dark overflow-hidden">
                            <button class="faq-toggle w-full flex items-center justify-between p-5 text-left font-semibold text-navy">
                                <span>Ile czasu mam na zgłoszenie roszczenia po wypadku?</span>
                                <i data-lucide="chevron-down" class="w-5 h-5 text-gold transition-transform"></i>
                            </button>
                            <div class="faq-answer"><p class="px-5 pb-5 text-txt/60 text-sm">Standardowy termin to 3 lata, ale w sprawach karnych może wynosić nawet 20 lat. Nie czekaj — im szybciej działasz, tym lepsze szanse.</p></div>
                        </div>
                    </div>
                </div>

                <!-- CTA -->
                <div class="mt-12 bg-navy rounded-2xl p-8 text-center">
                    <h2 class="font-heading text-2xl font-bold text-white mb-4">Miałeś wypadek komunikacyjny?</h2>
                    <p class="text-white/60 mb-6">Bezpłatnie przeanalizujemy Twoją sprawę i powiemy ile możesz uzyskać.</p>
                    <a href="index.html#quiz" class="inline-block bg-cta hover:bg-cta-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors">Sprawdź ile Ci się należy →</a>
                </div>
            </div>
        </section>
    </main>

    <!-- FOOTER: copy from index.html -->
    <!-- ... (same footer as index.html) ... -->

    <script src="js/analytics.js"></script>
    <script src="js/navigation.js"></script>
    <script>lucide.createIcons();</script>
</body>
</html>
```

- [ ] **Step 2: Create `odszkodowania-wypadki-przy-pracy.html` using same template**

Copy from komunikacyjne.html, change:
- `<title>`: "Odszkodowania za wypadki przy pracy"
- `<meta description>`: about workplace accidents
- Breadcrumb: "Wypadki przy pracy"
- H1: "Odszkodowania za wypadki przy pracy"
- Content: focus on workplace injuries, KRUS, ZUS, employer liability
- FAQ: workplace-specific questions
- Schema: update Service name and BreadcrumbList

- [ ] **Step 3: Create `odszkodowania-bledy-medyczne.html` using same template**

Change content to: medical malpractice, hospital infections, misdiagnosis, specific FAQ.

- [ ] **Step 4: Verify all 3 pages render correctly in browser**

- [ ] **Step 5: Commit**

```bash
git add odszkodowania-komunikacyjne.html odszkodowania-wypadki-przy-pracy.html odszkodowania-bledy-medyczne.html
git commit -m "feat: add service subpages (komunikacyjne, praca, bledy medyczne)"
```

---

### Task 9: Remaining Service Pages + Utility Pages

**Files:**
- Create: `odszkodowania-smierc-bliskiej-osoby.html`
- Create: `odszkodowania-wypadki-rolnicze.html`
- Create: `kalkulator.html`
- Create: `kontakt.html`
- Create: `jak-dzialamy.html`
- Create: `404.html`
- Create: `polityka-prywatnosci.html`
- Create: `blog/index.html`

- [ ] **Step 1: Create `odszkodowania-smierc-bliskiej-osoby.html`**

Same template. Content: wrongful death claims, family compensation, emotional tone.

- [ ] **Step 2: Create `odszkodowania-wypadki-rolnicze.html`**

Same template. Content: KRUS claims, farm accidents, agricultural machinery.

- [ ] **Step 3: Create `kalkulator.html` — standalone page**

Full page with nav + breadcrumb + same calculator HTML/JS from index.html + footer. Include Service schema for calculator.

- [ ] **Step 4: Create `kontakt.html` — standalone contact page**

Full page with nav + breadcrumb + contact form (same as index.html contact section) + map embed + footer.

- [ ] **Step 5: Create `jak-dzialamy.html` — expanded process page**

Full page with nav + breadcrumb + expanded 4-step timeline with more detail than homepage version + CTA + footer.

- [ ] **Step 6: Create `404.html`**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 — Strona nie znaleziona</title>
    <!-- Same Tailwind/fonts config as other pages -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { theme: { extend: { colors: { navy: '#1A1F36', gold: '#D4A843', cta: '#E8652D', 'cta-hover': '#D4561F', warm: '#F7F5F2', txt: '#2D2D2D' }, fontFamily: { heading: ['"Playfair Display"','serif'], body: ['"Inter"','sans-serif'] } } } }</script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body class="font-body text-txt bg-warm min-h-screen flex flex-col">
    <!-- Nav (simplified) -->
    <nav class="bg-navy py-4"><div class="max-w-7xl mx-auto px-4"><a href="/" class="text-white font-heading text-xl font-bold"><span class="text-gold">Odszkodowania</span></a></div></nav>

    <main class="flex-1 flex items-center justify-center py-16">
        <div class="text-center px-4">
            <div class="text-8xl font-heading font-bold text-navy/10 mb-4">404</div>
            <h1 class="font-heading text-3xl font-bold text-navy mb-4">Nie znaleźliśmy tej strony</h1>
            <p class="text-txt/60 mb-8 max-w-md mx-auto">Strona, której szukasz, mogła zostać przeniesiona lub nie istnieje.</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/" class="bg-cta hover:bg-cta-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors">Wróć na stronę główną</a>
                <a href="kontakt.html" class="border-2 border-navy/20 text-navy px-6 py-3 rounded-lg font-semibold hover:bg-navy/5 transition-colors">Skontaktuj się z nami</a>
            </div>
        </div>
    </main>

    <script>lucide.createIcons();</script>
</body>
</html>
```

- [ ] **Step 7: Create `polityka-prywatnosci.html`**

```html
<!-- Same head/nav/footer as service pages -->
<!-- Content: -->
<main class="pt-20">
    <div class="max-w-4xl mx-auto px-4 py-16">
        <h1 class="font-heading text-3xl font-bold text-navy mb-8">Polityka prywatności</h1>
        <div class="prose max-w-none text-txt/70 space-y-6">
            <p><strong>Administrator danych:</strong> [Nazwa firmy], [Adres], Poznań, NIP: [do uzupełnienia]</p>
            <h2 class="font-heading text-xl font-bold text-navy">1. Jakie dane zbieramy</h2>
            <p>Zbieramy dane osobowe podane przez Ciebie w formularzach kontaktowych: imię, numer telefonu, adres email (opcjonalnie), opis sprawy, oraz informacje o stanie zdrowia związane z roszczeniem odszkodowawczym.</p>
            <h2 class="font-heading text-xl font-bold text-navy">2. Cel przetwarzania</h2>
            <p>Dane przetwarzamy w celu: kontaktu zwrotnego, analizy sprawy odszkodowawczej, realizacji umowy, oraz — za odrębną zgodą — kontaktu marketingowego.</p>
            <h2 class="font-heading text-xl font-bold text-navy">3. Podstawa prawna</h2>
            <p>Art. 6 ust. 1 lit. a) RODO (zgoda), art. 6 ust. 1 lit. b) RODO (wykonanie umowy), art. 9 ust. 2 lit. a) RODO (dane o zdrowiu — wyraźna zgoda).</p>
            <h2 class="font-heading text-xl font-bold text-navy">4. Okres przechowywania</h2>
            <p>Dane przechowujemy przez okres niezbędny do realizacji celu, nie dłużej niż 6 lat od zakończenia sprawy (okres przedawnienia roszczeń).</p>
            <h2 class="font-heading text-xl font-bold text-navy">5. Twoje prawa</h2>
            <p>Masz prawo do: dostępu do danych, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, cofnięcia zgody w dowolnym momencie, oraz wniesienia skargi do Prezesa UODO.</p>
            <h2 class="font-heading text-xl font-bold text-navy">6. Pliki cookie</h2>
            <p>Strona używa plików cookie w celach analitycznych (Google Analytics 4). Skrypty analityczne ładowane są dopiero po wyrażeniu zgody w banerze cookie.</p>
            <p class="text-txt/40 text-sm mt-8"><em>Dokument do uzupełnienia i weryfikacji przez prawnika.</em></p>
        </div>
    </div>
</main>
```

- [ ] **Step 8: Create `blog/index.html` with placeholder articles**

```html
<!-- Same head/nav/footer as service pages -->
<main class="pt-20">
    <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="font-heading text-3xl font-bold text-navy mb-8">Baza wiedzy</h1>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Placeholder articles (same 3 as homepage preview) -->
            <div class="bg-white rounded-2xl overflow-hidden card-hover">
                <div class="p-6">
                    <span class="text-xs font-medium text-gold uppercase tracking-wider">Poradnik</span>
                    <h2 class="font-heading text-lg font-bold text-navy mt-2 mb-2">Co robić po wypadku samochodowym?</h2>
                    <p class="text-txt/60 text-sm mb-4">Krok po kroku: od zabezpieczenia miejsca zdarzenia po zgłoszenie roszczenia.</p>
                    <span class="text-gold text-sm font-semibold">Czytaj dalej →</span>
                </div>
            </div>
            <div class="bg-white rounded-2xl overflow-hidden card-hover">
                <div class="p-6">
                    <span class="text-xs font-medium text-gold uppercase tracking-wider">Prawo</span>
                    <h2 class="font-heading text-lg font-bold text-navy mt-2 mb-2">Przedawnienie roszczeń — ile masz czasu?</h2>
                    <p class="text-txt/60 text-sm mb-4">Terminy przedawnienia i wyjątki, o których musisz wiedzieć.</p>
                    <span class="text-gold text-sm font-semibold">Czytaj dalej →</span>
                </div>
            </div>
            <div class="bg-white rounded-2xl overflow-hidden card-hover">
                <div class="p-6">
                    <span class="text-xs font-medium text-gold uppercase tracking-wider">Poradnik</span>
                    <h2 class="font-heading text-lg font-bold text-navy mt-2 mb-2">Ubezpieczyciel zaniżył odszkodowanie — co dalej?</h2>
                    <p class="text-txt/60 text-sm mb-4">Jak odwołać się od decyzji i uzyskać sprawiedliwą kwotę.</p>
                    <span class="text-gold text-sm font-semibold">Czytaj dalej →</span>
                </div>
            </div>
        </div>
    </div>
</main>
```

- [ ] **Step 9: Verify all pages load, links work, breadcrumbs render**

- [ ] **Step 10: Commit**

```bash
git add odszkodowania-smierc-bliskiej-osoby.html odszkodowania-wypadki-rolnicze.html kalkulator.html kontakt.html jak-dzialamy.html 404.html polityka-prywatnosci.html blog/
git commit -m "feat: add remaining service pages, utility pages, 404, privacy, blog"
```

---

### Task 10: Final Polish — Mobile QA, Accessibility, Lighthouse

**Files:**
- Possibly modify: `index.html`, `css/styles.css`, `js/*.js`

- [ ] **Step 1: Test mobile responsive on all breakpoints (320px, 375px, 768px, 1024px, 1440px)**

Open browser dev tools, test each breakpoint. Check:
- Hero + quiz stacks vertically on mobile
- Sticky bottom bar visible (and hides during quiz)
- All cards stack to 1 column on mobile
- Touch targets >= 48px
- No horizontal overflow

- [ ] **Step 2: Run Lighthouse audit (Performance, Accessibility, SEO, Best Practices)**

Target: 90+ on all categories. Fix any critical issues found.

- [ ] **Step 3: Verify all internal links work (nav, footer, service cards, CTA buttons)**

- [ ] **Step 4: Verify all Lucide icons render (check for missing icons)**

- [ ] **Step 5: Test quiz full flow on mobile + desktop**

- [ ] **Step 6: Test calculator full flow on mobile + desktop**

- [ ] **Step 7: Test contact form validation**

- [ ] **Step 8: Test cookie consent banner (accept / reject / persistence)**

- [ ] **Step 9: Test keyboard navigation (Tab through quiz, calculator, FAQ, forms)**

Ensure all interactive elements are reachable via Tab, quiz options activatable via Enter/Space, FAQ toggleable via Enter.

- [ ] **Step 10: Verify all images/iframes use `loading="lazy"`**

All Google Maps iframes and any future `<img>` elements must have `loading="lazy"` attribute.

- [ ] **Step 11: Fix any issues found, commit**

```bash
git add -A
git commit -m "fix: mobile QA and lighthouse audit fixes"
```
