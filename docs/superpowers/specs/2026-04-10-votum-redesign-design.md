# Redesign strony głównej — styl Votum S.A.

**Data:** 2026-04-10
**Status:** Zatwierdzony przez użytkownika

## Kontekst

Przebudowa `index.html` z obecnego warm-cream layoutu na korporacyjny styl wzorowany na votum-sa.pl. Pełna zmiana kolorystyki, struktury sekcji i typografii. Podstrony pozostają bez zmian w tej iteracji.

## Decyzje projektowe

| Decyzja | Wybór |
|---------|-------|
| Quiz | Przeniesiony do popup/podstrony — na stronie głównej prosty formularz kontaktowy |
| Kolorystyka | Pełna zmiana na styl Votum (biały body, ciemny hero, kolorowe karty, ciemny footer) |
| Karty usług | 7 kart (5 usług + kalkulator + bezpłatna konsultacja) |
| Statystyki | 5 liczb (rozbudowane z obecnych 4) |
| Dodatkowe elementy | Dwa przyciski pod hero, pasek logo ubezpieczycieli, cytat testimonial, footer z danymi firmy |

## Struktura strony (od góry)

### 1. Header (sticky nav)
- Logo "Odszkodowania" po lewej — białe na ciemnym hero, ciemne po scrollu
- Menu desktop: Usługi, Jak działamy, Kalkulator, Sukcesy, Blog, Kontakt
- CTA button "Bezpłatna konsultacja" + numer telefonu po prawej
- Sticky z białym tłem po scrollu
- Mobile: hamburger menu (zachowane z obecnej implementacji)

### 2. Hero
- Pełnoekranowy ciemny section
- Placeholder: element z tekstem "FOTO" (docelowo zdjęcie z overlay `bg-black/50`)
- Nagłówek: **"Poznaj swoje prawa"** (duży, biały, wycentrowany)
- Podtytuł: "Dla osób poszkodowanych w wypadkach i zdarzeniach losowych"
- CTA button: **"Bezpłatna konsultacja"** (pomarańczowy/czerwony, wycentrowany)
- Pod CTA: mały tekst "Sprawdź, ile możemy dla Ciebie uzyskać"

### 3. Dwa przyciski pod hero
- Jasne tło
- "Dla poszkodowanych" → link do quizu/podstrony
- "Kalkulator odszkodowań" → link do kalkulatora
- Styl: outlined/bordered buttons, wycentrowane

### 4. Statystyki
- Białe tło
- Nagłówek: **"Nasza firma to"**
- 5 statystyk w gridzie:

| Liczba | Opis |
|--------|------|
| **500+** | wygranych spraw odszkodowawczych w całej Polsce |
| **98%** | skuteczności w sprawach, które prowadzimy |
| **15 mln zł** | uzyskanych odszkodowań dla naszych klientów |
| **10+** | lat doświadczenia w branży odszkodowawczej |
| **3,5 miesiąca** | średni czas realizacji sprawy od zgłoszenia do wypłaty |

- Pod spodem: *"Dane na podstawie spraw prowadzonych w latach 2015–2025"*
- Animacja count-up zachowana z obecnej implementacji

### 5. Logo ubezpieczycieli
- Pasek z logotypami w grayscale
- Placeholder tekstowy: PZU, Warta, Ergo Hestia, Allianz, Generali, Uniqa
- Bez nagłówka — sam pasek
- Docelowo: zamiana na SVG/PNG logo

### 6. Karty usług
- 7 kart w gridzie (mobile: 1 kolumna, tablet: 2, desktop: 2-3)
- Każda karta: kolorowe tło, biała ikona Lucide, biały tytuł, biały opis, link do podstrony
- Hover: `scale-[1.02]` + shadow
- Zaokrąglone: `rounded-xl`

| # | Karta | Kolor tła | Ikona Lucide | Link |
|---|-------|-----------|-------------|------|
| 1 | Odszkodowania komunikacyjne | #1e3a5f (ciemnoniebieski) | `car` | odszkodowania-komunikacyjne.html |
| 2 | Wypadki przy pracy | #b8860b (złoty/amber) | `hard-hat` | odszkodowania-wypadki-przy-pracy.html |
| 3 | Pomoc po wypadku | #8b2020 (czerwony) | `heart-pulse` | #quiz (popup) |
| 4 | Błędy medyczne | #1a7a6d (turkusowy) | `stethoscope` | odszkodowania-bledy-medyczne.html |
| 5 | Wypadki rolnicze (KRUS) | #2d5a27 (zielony) | `wheat` | odszkodowania-wypadki-rolnicze.html |
| 6 | Śmierć bliskiej osoby | #4a2d6b (fioletowy) | `heart` | odszkodowania-smierc-bliskiej-osoby.html |
| 7 | Kalkulator odszkodowań | #c4511a (pomarańczowy) | `calculator` | kalkulator.html |

### 7. Formularz kontaktowy — "Masz pytanie?"
- Layout: desktop = tekst po lewej + formularz po prawej; mobile = tekst na górze, formularz pod spodem
- Lewa strona: nagłówek, tekst zachęcający, numer telefonu, godziny pracy
- Formularz:
  - Dropdown: "Wybierz temat rozmowy" (6 opcji odpowiadających usługom + "Inne")
  - Input: Imię i nazwisko
  - Input: Numer telefonu
  - Input: E-mail
  - Textarea: Treść wiadomości
  - Checkbox: zgoda RODO
  - Button: "Wyślij" (ciemny/primary)
- Walidacja: re-use `window.formValidation` z `form-validation.js`

### 8. Cytat / Testimonial
- Szare/jasne tło
- Duży cudzysłów dekoracyjny (italic, duży font)
- Tekst: *"Byłem pewien, że 15 tysięcy to wszystko na co mogę liczyć. Dostałem 8 razy więcej."*
- Pod spodem: "— Marek, Warszawa"

### 9. Footer
- Ciemnoszare/grafitowe tło (#1a1a2e)
- Logo "Odszkodowania" (białe)
- Adres firmy, NIP, KRS (placeholder)
- Kolumny: Usługi | Informacje | Kontakt
- Copyright: "© 2025 Odszkodowania. Wszelkie prawa zastrzeżone."
- Link do polityki prywatności

## Elementy usunięte ze strony głównej

- Ticker (animowany pasek sukcesów na górze)
- Trust bar (pasek z oceną Google, badge)
- 5-krokowy quiz diagnostyczny (przeniesiony do popup/podstrony)
- Sekcja "Jak działamy" (proces 4 kroków)
- Case studies z comparison bars i timeline
- Karuzela opinii (6 testimoniali)
- Sekcja "Dlaczego my" (4 powody)
- Sekcja zespołu/ekspertów
- FAQ accordion
- Floating WhatsApp/phone buttons
- Mobile sticky bottom bar

## Nowa paleta kolorów

**Strategia:** `tailwind-config.js` jest współdzielony z podstronami — NIE nadpisujemy starych tokenów. Dodajemy nowe tokeny z prefixem `v2-` dla strony głównej. Stare tokeny (`bg`, `gold`, `cta`, etc.) pozostają nienaruszone.

Nowe tokeny w `js/tailwind-config.js`:

| Nowy token | Wartość | Użycie (tylko index.html) |
|------------|---------|--------------------------|
| `v2-bg` | #FFFFFF | Tło body |
| `v2-surface` | #F5F5F5 | Alternate backgrounds |
| `v2-text` | #1a1a2e | Body text |
| `v2-muted` | #6b7280 | Secondary text |
| `v2-line` | #e5e7eb | Borders |
| `v2-cta` | #dc2626 | Primary CTA |
| `v2-cta-hover` | #b91c1c | CTA hover |
| `v2-hero` | #1a1a2e | Hero overlay |
| `v2-footer` | #1a1a2e | Footer tło |

Stare tokeny (`bg`, `surface`, `gold`, `cta`, etc.) — **bez zmian**, podstrony dalej działają.

Na `index.html` klasa body zmieni się z `bg-bg text-text` na `bg-v2-bg text-v2-text` i analogicznie w całym pliku.

## Typografia

**Strategia:** Font Poppins ładowany TYLKO w `index.html` via osobny `<link>` tag w `<head>`. Tailwind config zachowuje Plus Jakarta Sans jako domyślny. Na `index.html` nadpisanie fontu inline: `<body class="font-[Poppins]">` lub dedykowane klasy.

- Font na index.html: **Poppins** (Google Fonts), weights 400, 500, 600, 700, 800
- Font na podstronach: Plus Jakarta Sans (bez zmian)
- Font size system zachowany (Tailwind classes)

## Pliki do zmodyfikowania

| Plik | Zmiana |
|------|--------|
| `index.html` | Pełna przebudowa struktury HTML, nowy font link, nowe tokeny kolorów |
| `js/tailwind-config.js` | Dodanie tokenów `v2-*` (stare tokeny bez zmian) |
| `css/styles.css` | Dodanie nowych animacji (count-up, card hover), stare animacje bez zmian (używane na podstronach) |

**Pliki JS — BEZ zmian:**
- `js/navigation.js` — zachowany, sticky nav reaguje na scroll (klasy bg zmienione w HTML, nie w JS). Sprawdzić czy JS ustawia klasy kolorów — jeśli tak, dodać warunek per page.
- `js/animations.js` — zachowany. Lenis nie jest ładowany na nowym index.html (brak CDN `<script>`), więc guard `typeof Lenis !== 'undefined'` obsłuży to automatycznie. Parallax/observers pozostają — te które nie znajdą elementów na nowej stronie, po prostu się nie uruchomią.
- `js/form-validation.js` — bez zmian, re-use dla nowego formularza
- `js/quiz.js`, `js/calculator.js`, `js/cookie-consent.js`, `js/analytics.js` — bez zmian

## Pliki BEZ zmian

- Podstrony (`uslugi.html`, `odszkodowania-*.html`, etc.)
- Wszystkie pliki JS (patrz wyżej)
- Blog (`blog/`)
- Testy (`tests/`)

## Mobile contact affordance

Usunięte: floating WhatsApp/phone buttons, mobile sticky bottom bar.
**Zastąpione przez:** sticky CTA button na mobile (fixed bottom, pełna szerokość) z tekstem "Zadzwoń teraz" linkujący do `tel:+48XXXXXXXXX`. Prosty, jednoelementowy — nie sticky bar z dwoma przyciskami.

## Karty usług — layout

7 kart: na mobile 1 kolumna, na tablet 2 kolumny (ostatnia karta pełna szerokość / `col-span-2`), na desktop 3+3+1 lub 4+3. Preferowane: **2 kolumny na wszystkich breakpointach** (jak Votum mobile), 7 kart w pionie — najprostsze i najbliższe referencji.

## Zdjęcia

Zdjęcia wdrożone 2026-04-11. Folder: `images/` (root projektu), 9 plików PNG generowanych przez Gemini.

### Mapowanie zdjęć → sekcje

| Plik | Sekcja | Strona |
|------|--------|--------|
| `Gemini_Generated_Image_9moolc9moolc9moo.png` | Hero tło (full-screen bg) | `index.html`, `jak-dzialamy.html`, `odszkodowania-wypadki-rolnicze.html` (sekcja 2) |
| `Gemini_Generated_Image_5g2h8z5g2h8z5g2h.png` | "Jak działamy" panel | `index.html`, `uslugi.html` |
| `Gemini_Generated_Image_mcyjr7mcyjr7mcyj.png` | Hero sekcji | `odszkodowania-komunikacyjne.html` |
| `Gemini_Generated_Image_q44jvkq44jvkq44j.png` | Hero sekcji | `odszkodowania-wypadki-przy-pracy.html` |
| `Gemini_Generated_Image_rvhv0frvhv0frvhv.png` | Hero sekcji | `odszkodowania-bledy-medyczne.html` |
| `Gemini_Generated_Image_v6j33av6j33av6j3.png` | Hero sekcji + sukcesy | `odszkodowania-smierc-bliskiej-osoby.html`, `sukcesy.html` |
| `Gemini_Generated_Image_nnl0c7nnl0c7nnl0.png` | "Kto może ubiegać się" + opinie | `odszkodowania-smierc-bliskiej-osoby.html`, `opinie.html` |
| `Gemini_Generated_Image_ivbp9wivbp9wivbp.png` | "Jak postępujemy" + kalkulator | `odszkodowania-smierc-bliskiej-osoby.html`, `kalkulator.html` |
| `Gemini_Generated_Image_ib7zhnib7zhnib7z.png` | Hero sekcji rolniczej | `odszkodowania-wypadki-rolnicze.html` |

### Implementacja

- Hero (`index.html`): `background-image` inline style na `.v2-scroll-expand`, `background-size: cover`
- Wszystkie pozostałe: `<img class="w-full h-full object-cover">` w kontenerze `rounded-xl aspect-[4/3] overflow-hidden`
- Logo ubezpieczycieli: nadal tekst placeholder (PZU, Warta, etc.) — wymagają docelowych plików SVG/PNG

## Kompatybilność

- Podstrony zachowują stary styl (cream/gold) — stare tokeny nienaruszone w tailwind-config
- Nav i footer na podstronach pozostają bez zmian (każda podstrona ma własną kopię HTML)
- Font Poppins ładowany tylko na index.html
- JS pliki współdzielone — brak breaking changes, nowe elementy po prostu nie matchują starych selektorów
- Copyright: "© 2026" (nie 2025)
