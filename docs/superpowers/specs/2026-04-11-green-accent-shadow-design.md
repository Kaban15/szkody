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
- Separacja przez `border-b-2` w kolorze `#1a6b3c` z opacity 15% (`border-[#1a6b3c]/15`)
- Dotyczy wyłącznie `uslugi.html` — siatka 6 kafelków

## Zakres zmian

### `js/tailwind-config.js` — token swap

| Token | Stara wartość | Nowa wartość |
|---|---|---|
| `gold` | `#dc2626` | `#1a6b3c` |
| `gold-light` | `#b91c1c` | `#166534` |
| `cta` | `#dc2626` | `#1a6b3c` |
| `cta-hover` | `#b91c1c` | `#166534` |
| `v2-cta` | `#dc2626` | `#1a6b3c` |
| `v2-cta-hover` | `#b91c1c` | `#166534` |

### `css/styles.css` — CSS custom property

Dodać na początku pliku:

```css
:root {
  --color-brand: #1a6b3c;
  --color-brand-hover: #166534;
}
```

Służy jako single source of truth — nie zastępuje tokenów Tailwind, ale ułatwia przyszłe zmiany koloru.

### Pliki HTML — hardcoded klasy

Grep po `*.html` w katalogu głównym i `blog/`:

| Szukaj | Zamień na | Uwaga |
|---|---|---|
| `hover:bg-red-700` | `hover:bg-[#166534]` | przyciski CTA |
| `focus:ring-red-200` | `focus:ring-green-200` | pola formularza |
| `hover:bg-v2-cta` na elementach non-button | bez zmian (propaguje przez token) | |
| `text-red-*` jako akcent (nie walidacja) | `text-[#1a6b3c]` | sprawdzić kontekst |

Klasy `text-red-500`, `border-red-500`, `bg-red-500` w kontekście **walidacji formularzy** — bez zmian.

### `uslugi.html` — kreska dolna kafelków

Każdy z 6 divów `.v2-slide-left` / `.v2-slide-right` w siatce usług dostaje dodatkowe klasy:

```html
border-b-2 border-[#1a6b3c]/15 pb-8
```

Tło sekcji (`bg-white`) pozostaje bez zmian.

## Czego nie zmieniamy

- Struktura HTML kafelków (żadnych nowych wrapper divów)
- Tło sekcji w `uslugi.html`
- Kolory w sekcji footer (`v2-footer: #1a1a2e`) — to nie jest kolor akcentu
- Error state (`error: #EF4444`)
- Ikony Lucide — ich kolor pochodzi z klasy `text-v2-text`, nie z cta

## Pliki do edycji

1. `js/tailwind-config.js`
2. `css/styles.css`
3. `uslugi.html`
4. `index.html` (hardcoded red classes)
5. Wszystkie 5 subpodstron usług (`odszkodowania-*.html`) — hardcoded red w formularzach
6. Pozostałe strony z formularzami: `kontakt.html`, `kalkulator.html`

## Kryteria sukcesu

- Żaden element UI (poza error state) nie używa czerwonego
- Kafelki usług mają widoczną, subtelną separację bez zmiany struktury kart
- `--color-brand` działa jako single source of truth w CSS
- Testy `npm test` przechodzą bez zmian (brak logiki JS dotkniętej przez zmianę)
