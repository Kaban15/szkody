# Design: Zmiana koloru akcentu na zieleń + cienie kafelków usług

**Data:** 2026-04-11  
**Status:** Zatwierdzony

## Cel

1. Zastąpić dominujący kolor akcentujący (czerwony `#dc2626`) głęboką zielenią (`#1a6b3c`) na wszystkich stronach.
2. Dodać subtelną separację wizualną pod kafelkami usług na `uslugi.html` bez wprowadzania białego tła karty (zachowanie stylu Votum).

## Decyzje projektowe

### Kolor

- **Nowy akcent:** `#1a6b3c` (głęboka zieleń — skojarzenia: zaufanie, wzrost finansowy, wygrana)
- **Hover/ciemniejszy:** `#166534`
- **Error state:** `#EF4444` — bez zmian (nie jest kolorem brandu)
- Zmiana **globalna** — zastępuje czerwony wszędzie (przyciski, linki, ikony, nagłówki akcentowane)

### Kafelki usług

- Styl Votum zachowany: brak białego tła karty, brak pudełka
- Separacja przez `border-b-2` w kolorze `#1a6b3c` z opacity 15%
- Dotyczy wyłącznie `uslugi.html` — siatka 6 kafelków

## Zakres zmian

### 1. `js/tailwind-config.js` — token swap

| Token | Stara wartość | Nowa wartość |
|---|---|---|
| `gold` | `#dc2626` | `#1a6b3c` |
| `gold-light` | `#b91c1c` | `#166534` |
| `cta` | `#dc2626` | `#1a6b3c` |
| `cta-hover` | `#b91c1c` | `#166534` |
| `v2-cta` | `#dc2626` | `#1a6b3c` |
| `v2-cta-hover` | `#b91c1c` | `#166534` |

### 2. `css/styles.css` — CSS custom property + find-replace

Dodać na początku pliku (po `'use strict'` sekcji, przed pierwszą regułą):

```css
:root {
  --color-brand: #1a6b3c;
  --color-brand-hover: #166534;
}
```

Następnie **pełny find-replace** w tym pliku:
- `#dc2626` → `var(--color-brand)`
- `#b91c1c` → `var(--color-brand-hover)`
- `#991b1b` → `var(--color-brand-hover)`
- `rgba(220, 38, 38,` → `rgba(26, 107, 60,`

Dotyczy m.in.: slider thumb, `.v2-hover-accent::before`, `.aurora-cta::before`, `@keyframes result-pulse`, nav hover links, `.v2-step-tab.active`, focus ring shadows.

`--color-brand` pełni rolę single source of truth tylko dla reguł w `styles.css`. Tailwind tokeny i CSS var są osobnymi mechanizmami — oba muszą być zaktualizowane.

### 3. Pliki HTML — hardcoded klasy Tailwind

Pełna tabela podmian (grep po wszystkich `*.html` poza `blog/`):

| Szukaj | Zamień na | Dotyczy |
|---|---|---|
| `hover:bg-red-700` | `hover:bg-[#166534]` | przyciski CTA |
| `focus:ring-red-200` | `focus:ring-green-200` | pola formularza |
| `bg-red-50` | `bg-[#1a6b3c]/10` | tło ikonek w sekcjach |
| `bg-red-600` | `bg-[#1a6b3c]` | avatar/kółko inicjałów |
| `accent-red-600` | `accent-[#1a6b3c]` | checkboxy |
| `hover:text-red-700` | `hover:text-[#166534]` | linki tekstowe |
| `hover:text-red-400` | `hover:text-[#166534]` | link telefonu w kalkulatorze |

Klasy `text-red-500`, `border-red-500`, `bg-red-500` w kontekście **walidacji formularzy** — bez zmian (error state).

### 4. Pliki HTML do edycji

Wszystkie poniższe pliki mają hardcoded klasy czerwone poza token-scope:

1. `js/tailwind-config.js`
2. `css/styles.css`
3. `uslugi.html` (kafelki + formularz)
4. `index.html`
5. `odszkodowania-komunikacyjne.html`
6. `odszkodowania-wypadki-przy-pracy.html`
7. `odszkodowania-bledy-medyczne.html`
8. `odszkodowania-smierc-bliskiej-osoby.html`
9. `odszkodowania-wypadki-rolnicze.html`
10. `jak-dzialamy.html`
11. `opinie.html`
12. `sukcesy.html`
13. `kalkulator.html`
14. `404.html`
15. `polityka-prywatnosci.html`

`kontakt.html` — tylko tokeny `v2-cta`, propaguje automatycznie przez tailwind-config.

### 5. `uslugi.html` — kreska dolna kafelków

Każdy z 6 divów `.v2-slide-left` / `.v2-slide-right` w siatce usług dostaje:

```html
border-b-2 border-[#1a6b3c]/15
```

**Uwaga dot. gap:** siatka używa `gap-y-16` (64px). Kreska `border-b` pojawi się na dole treści kafelka, w środku tego odstępu — co jest zamierzonym efektem subtelnej separacji. Nie dodajemy `pb-8` żeby nie zaburzać rytmu siatki.

## Czego nie zmieniamy

- Struktura HTML kafelków (żadnych nowych wrapper divów)
- Tło sekcji w `uslugi.html` (`bg-white`)
- Kolory footer (`v2-footer: #1a1a2e`)
- Error state (`error: #EF4444`, `text-red-500`, `border-red-500`, `bg-red-500` w walidacji)
- Logika JS — testy `npm test` przechodzą bez zmian

## Kryteria sukcesu

- Żaden element UI (poza error state) nie używa czerwonego
- Kafelki usług mają widoczną, subtelną separację
- `--color-brand` pokrywa wszystkie reguły w `styles.css`

### Weryfikacja

```bash
grep -rn "red-[0-9]\|#dc2626\|#b91c1c\|#991b1b" *.html css/*.css js/tailwind-config.js \
  | grep -v "error\|EF4444\|red-500\|border-red-500\|text-red-500\|bg-red-500"
```

Wynik powinien być pusty.
