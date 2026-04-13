# Logo Display — Design Spec
**Data:** 2026-04-13  
**Status:** Zatwierdzony

## Problem

Logo Lexperiens (`images/lexperiens-logo.png`) ma białe tło. Pojawia się w dwóch kontekstach:

| Miejsce | Tło | Aktualny stan |
|---------|-----|--------------|
| Nav transparent (index.html hero) | Ciemne zdjęcie | Biały prostokąt ✗ |
| Nav solid (po scrollu / subpages) | Białe `rgba(255,255,255,0.95)` | Poprawne ✓ |
| Footer (wszystkie strony) | Ciemny `#1a1a2e` | CSS tekst (nie PNG) ✗ |

## Rozwiązanie — Podejście A

### 1. Przetwarzanie PNG (jednorazowe)

Skrypt Python (Pillow) usuwa białe tło z `images/lexperiens-logo.png`:
- Próg: `R > 240 AND G > 240 AND B > 240` → `alpha = 0`
- Skrypt jest **idempotentny**: sprawdza czy PNG już ma kanał alpha i czy tło jest już transparentne — pomija przetwarzanie jeśli tak
- Oryginalny plik jest backupowany jako `images/lexperiens-logo-original.png` przed nadpisaniem
- Skrypt: `scripts/remove-logo-bg.py` (dodany do `.gitignore`)

### 2. CSS — przełączanie filtrów

Istniejące reguły `.nav-logo-link` i `#main-nav.nav-solid .nav-logo-link` w `css/styles.css` są **aktualizowane** (nie dodawane duplikatów). Należy wcześniej usunąć stare wersje tych reguł.

**Filter na ciemnym tle:** `invert(1) hue-rotate(180deg)`

Uzasadnienie `hue-rotate(180deg)` bez `brightness`:
- Białe tło (255,255,255) → invert → czarne → hue-rotate → czarne ✓ (niewidoczne na ciemnym)
- Ciemny charcoal (#3D3D3D) → invert → jasny szary (#C2C2C2) → hue-rotate → jasny szary ✓
- Cyan (#29ABE2, HSL 201°) → invert → HSL 21° (pomarańcz) → +180° → HSL 201° ≈ oryginalny cyan ✓

`brightness(1.5)` zostaje **pominięte** — po usunięciu białego tła (transparent bg) jasny szary jest wystarczająco widoczny i dodanie brightness nadmiernie rozjaśniłoby cyan.

```css
/* Usuń/zastąp istniejące reguły .nav-logo-link */

/* Nav transparent — ciemny hero (index.html startowo) */
.nav-logo-link {
    display: inline-flex;
    align-items: center;
    filter: invert(1) hue-rotate(180deg);
    transition: filter 0.3s ease;
}
/* Nav solid — białe tło */
#main-nav.nav-solid .nav-logo-link {
    filter: none;
}
/* Footer — zawsze ciemny */
.footer-logo-link {
    filter: invert(1) hue-rotate(180deg);
    display: inline-flex;
    align-items: center;
}
/* Wymiary */
.nav-logo-img    { height: 40px !important; width: auto !important; display: block; }
.footer-logo-img { height: 34px !important; width: auto !important; display: block; }
```

**Edge case — `#nav-logo` ID:** `index.html` używa `id="nav-logo"` na `<a>`. Należy sprawdzić czy w blokach `body.v2-theme` nie ma `#nav-logo` reguł ustawiających `filter` — jeśli tak, usunąć konflikty.

**Edge case — `404.html`:** Nav nie ma `id="main-nav"`, więc `#main-nav.nav-solid` nigdy nie odpali. Na `404.html` logo zawsze będzie w trybie ciemnym (filtr). Akceptowalne — tło nava na 404 jest ciemne.

### 3. HTML — footer

Jednolity HTML dla wszystkich plików (ścieżka absolutna `/images/...` działa wszędzie łącznie z `blog/`):

```html
<a href="/" class="footer-logo-link">
  <img src="/images/lexperiens-logo.png"
       alt="Lexperiens – Kancelaria Radców Prawnych"
       class="footer-logo-img">
</a>
```

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `images/lexperiens-logo.png` | Nadpisany transparent wersją (backup: `lexperiens-logo-original.png`) |
| `css/styles.css` | Aktualizacja `.nav-logo-*`, dodanie `.footer-logo-*` |
| `index.html` | Footer: CSS tekst div → `<a class="footer-logo-link"><img>` |
| 13 głównych subpages | Footer: CSS tekst/img → `<a class="footer-logo-link"><img>` |
| `blog/index.html` | Footer: j.w. |
| 20 artykułów `blog/*.html` | Footer: j.w. (ścieżka `/images/` absolutna — bezpieczna) |

**Łącznie:** ~36 plików HTML.

## Kryteria sukcesu

- Logo białe + cyan widoczne na ciemnym hero nava (`index.html`, transparent nav)
- Logo oryginalne (ciemny + cyan) na białym navie po scrollu / na subpages
- Logo białe + cyan widoczne w footerze na wszystkich stronach
- Brak białego prostokąta w żadnym kontekście
- Rozmiar: 40px nav, 34px footer
