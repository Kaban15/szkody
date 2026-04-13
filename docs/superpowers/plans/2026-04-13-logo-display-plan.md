# Logo Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wyświetlić oryginalne logo Lexperiens PNG (bez białego tła) poprawnie na ciemnych i jasnych tlach we wszystkich kontekstach (nav, footer) na wszystkich stronach.

**Architecture:** Jednorazowy skrypt Python usuwa białe tło z PNG (transparent RGBA). CSS filter `invert(1) hue-rotate(180deg)` przełącza logo między wersją jasną (ciemne tła) a oryginalną. Kluczowy edge case: subpage nav ma ciemne tło (`rgba(26,26,46,0.95)`) mimo klasy `nav-solid` — wymaga osobnej reguły CSS.

**Tech Stack:** Python 3 + Pillow, CSS filter, PowerShell mass-replace

**Spec:** `docs/superpowers/specs/2026-04-13-logo-display-design.md`

---

## Konteksty wyświetlania logo

| Strona | Stan nav | Tło nav | Wymagany filter |
|--------|----------|---------|----------------|
| `index.html` | transparent | ciemne zdjęcie | `invert(1) hue-rotate(180deg)` |
| `index.html` po scrollu | nav-solid | białe `rgba(255,255,255,0.95)` | `none` |
| subpages | nav-solid + v2-subpage | ciemne `rgba(26,26,46,0.95)` | `invert(1) hue-rotate(180deg)` |
| footer wszędzie | — | ciemne `#1a1a2e` | `invert(1) hue-rotate(180deg)` |

---

## Pliki do modyfikacji

| Plik | Zmiana |
|------|--------|
| `images/lexperiens-logo.png` | Nadpisany wersją RGBA z transparent tłem |
| `images/lexperiens-logo-original.png` | Backup oryginału (nowy plik) |
| `css/styles.css` | Aktualizacja `.nav-logo-link` + dodanie reguł subpage + footer |
| `index.html` | Footer: div LEXPERIENS → `<a class="footer-logo-link"><img>` |
| 13 subpages (`jak-dzialamy.html` itd.) | Footer: div LEXPERIENS → `<a class="footer-logo-link"><img>` |
| `blog/index.html` | Nav logo (już OK) + Footer |
| 20 artykułów `blog/*.html` | Nav logo + Footer |

---

## Task 1: Skrypt Python — usuń białe tło PNG

**Files:**
- Create: `scripts/remove-logo-bg.py`

- [ ] **Krok 1: Utwórz katalog scripts**

```bash
mkdir -p scripts
```

- [ ] **Krok 2: Zainstaluj Pillow**

```bash
pip install Pillow
```

Oczekiwane: `Successfully installed Pillow-...`

- [ ] **Krok 3: Napisz skrypt**

Plik `scripts/remove-logo-bg.py`:

```python
"""
Removes white background from Lexperiens logo PNG.
Idempotent: skips if top-right corner is already transparent.
Creates backup before overwriting.
"""
import shutil
from pathlib import Path
from PIL import Image

SRC = Path("images/lexperiens-logo.png")
BACKUP = Path("images/lexperiens-logo-original.png")
THRESHOLD = 240


def is_already_transparent(img: Image.Image) -> bool:
    """Check top-right corner — always background in this logo."""
    if img.mode != "RGBA":
        return False
    w, _ = img.size
    return img.getpixel((w - 1, 1))[3] == 0


def remove_white_bg(src: Path, backup: Path, threshold: int) -> None:
    img = Image.open(src).convert("RGBA")
    if is_already_transparent(img):
        print(f"[SKIP] {src} already has transparent background.")
        return
    if not backup.exists():
        shutil.copy2(src, backup)
        print(f"[BACKUP] {backup}")
    data = img.getdata()
    new_data = [
        (r, g, b, 0) if (r > threshold and g > threshold and b > threshold) else (r, g, b, a)
        for r, g, b, a in data
    ]
    img.putdata(new_data)
    img.save(src, "PNG")
    print(f"[DONE] White background removed from {src}")


if __name__ == "__main__":
    remove_white_bg(SRC, BACKUP, THRESHOLD)
```

- [ ] **Krok 4: Uruchom skrypt**

```bash
python3 scripts/remove-logo-bg.py
```

Oczekiwane:
```
[BACKUP] images/lexperiens-logo-original.png
[DONE] White background removed from images/lexperiens-logo.png
```

- [ ] **Krok 5: Zweryfikuj**

```bash
python3 -c "
from PIL import Image
img = Image.open('images/lexperiens-logo.png')
w, _ = img.size
print('Mode:', img.mode)            # RGBA
print('Corner alpha:', img.getpixel((w-1, 1))[3])  # 0
"
```

- [ ] **Krok 6: Dodaj skrypt do .gitignore**

Dopisz linię do `.gitignore`:
```
scripts/remove-logo-bg.py
```

- [ ] **Krok 7: Commit**

```bash
git add images/lexperiens-logo.png images/lexperiens-logo-original.png .gitignore
git commit -m "chore: remove white background from Lexperiens logo PNG"
```

---

## Task 2: CSS — reguły filtrów logo

**Files:**
- Modify: `css/styles.css`

- [ ] **Krok 1: Zlokalizuj istniejący blok do zastąpienia**

```bash
grep -n "nav-logo\|footer-logo" css/styles.css
```

Zapamiętaj numery linii bloku `.nav-logo-link`. Cały ten blok zostanie zastąpiony.

- [ ] **Krok 2: Zastąp cały blok nav/footer logo CSS**

Znajdź i zastąp sekcję od `/* Nav logo` do `.footer-logo-img { ... }` poniższym:

```css
/* Nav logo — transparent PNG, filter per background type */
.nav-logo-link {
    display: inline-flex;
    align-items: center;
    filter: invert(1) hue-rotate(180deg);
    transition: filter 0.3s ease;
}
/* index.html — white nav after scroll: show original colors */
#main-nav.nav-solid .nav-logo-link {
    filter: none;
}
/* subpages — nav-solid has DARK background (rgba 26,26,46): keep inverted */
body.v2-theme.v2-subpage #main-nav.nav-solid .nav-logo-link {
    filter: invert(1) hue-rotate(180deg);
}
/* Footer — always dark #1a1a2e */
.footer-logo-link {
    display: inline-flex;
    align-items: center;
    filter: invert(1) hue-rotate(180deg);
}
.nav-logo-img {
    height: 40px !important;
    width: auto !important;
    display: block;
}
.footer-logo-img {
    height: 34px !important;
    width: auto !important;
    display: block;
}
```

- [ ] **Krok 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: add logo CSS filter rules for nav/footer dark/light contexts"
```

---

## Task 3: Nav logo w artykułach bloga (20 plików)

Artykuły bloga nadal mają stary span `Odszkodowania` w navie.

**Files:**
- Modify: `blog/*.html` (20 artykułów, pomijamy `_szablon-*`)

- [ ] **Krok 1: Zweryfikuj wzorzec**

```bash
grep -c "font-bold.*Odszkodowania" blog/co-robic-po-wypadku.html
```

Oczekiwane: `1` (lub więcej).

- [ ] **Krok 2: Mass replace NAV logo TYLKO w artykułach (nie dotykaj footera)**

```powershell
$navLogo = '<a href="/" class="nav-logo-link"><img src="/images/lexperiens-logo.png" alt="Lexperiens" class="nav-logo-img" style="height:40px;width:auto;max-height:40px"></a>'

$files = Get-ChildItem "blog/*.html" | Where-Object { $_.Name -notmatch "^_szablon" }
foreach ($file in $files) {
    $c = Get-Content $file.FullName -Raw -Encoding UTF8
    # Tylko anchor z nav logo — nie dotykamy footera
    $c = $c -replace '<a href="/"><span[^>]*font-bold[^>]*>Odszkodowania</span></a>', $navLogo
    Set-Content $file.FullName -Value $c -Encoding UTF8 -NoNewline
    Write-Host "nav done: $($file.Name)"
}
```

- [ ] **Krok 3: Weryfikacja — brak starych anchorów nav**

```powershell
Select-String -Pattern '<a href="/"><span.*>Odszkodowania</span></a>' -Path "blog/*.html" | Where-Object { $_.Filename -notmatch "_szablon" }
```

Oczekiwane: brak wyników.

- [ ] **Krok 4: Commit**

```bash
git add blog/
git commit -m "feat: replace nav logo text with PNG img in blog articles"
```

---

## Task 4: Footer logo — index.html

`index.html` ma inną strukturę footera niż subpages — ręczna edycja.

**Files:**
- Modify: `index.html`

- [ ] **Krok 1: Znajdź dokładny blok w footerze**

W pliku `index.html` znajdź (ok. linia 481):
```html
<div class="flex flex-col gap-0.5 mb-4">
    <span class="font-bold" style="letter-spacing:0.12em;font-size:1.05rem;color:white">LEXPERIENS</span>
    <span class="font-medium" style="letter-spacing:0.18em;font-size:0.52rem;color:#29ABE2">KANCELARIA RADCÓW PRAWNYCH</span>
</div>
```

- [ ] **Krok 2: Zastąp blokiem z img**

```html
<a href="/" class="footer-logo-link mb-4">
    <img src="/images/lexperiens-logo.png" alt="Lexperiens – Kancelaria Radców Prawnych" class="footer-logo-img">
</a>
```

Uwaga: używamy `mb-4` (nie `mb-3`) aby zachować oryginalne odstępy w tym layoucie.

- [ ] **Krok 3: Weryfikacja**

```bash
grep -n "footer-logo-link" index.html
```

Oczekiwane: 1 wynik.

- [ ] **Krok 4: Commit**

```bash
git add index.html
git commit -m "feat: replace CSS text logo with PNG img in index.html footer"
```

---

## Task 5: Footer logo — subpages i blog/index.html (14 plików)

Wzorzec w tych plikach jest na **jednej linii** (wynik poprzednich mass-replace):
```
<div class="mb-3"><div class="font-bold text-white" style="letter-spacing:0.12em;font-size:1.05rem">LEXPERIENS</div><div class="font-medium" style="letter-spacing:0.18em;font-size:0.5rem;color:#29ABE2">KANCELARIA RADC&#211;W PRAWNYCH</div></div>
```

**Files:**
- Modify: 13 subpages + `blog/index.html`

- [ ] **Krok 1: Potwierdź wzorzec**

```bash
grep -c "mb-3.*LEXPERIENS" jak-dzialamy.html
```

Oczekiwane: `1`.

- [ ] **Krok 2: Mass replace — literalne dopasowanie całej linii**

```powershell
$old = '<div class="mb-3"><div class="font-bold text-white" style="letter-spacing:0.12em;font-size:1.05rem">LEXPERIENS</div><div class="font-medium" style="letter-spacing:0.18em;font-size:0.5rem;color:#29ABE2">KANCELARIA RADC&#211;W PRAWNYCH</div></div>'
$new = '<a href="/" class="footer-logo-link mb-3"><img src="/images/lexperiens-logo.png" alt="Lexperiens" class="footer-logo-img"></a>'

$files = @(
    'jak-dzialamy.html','kontakt.html','kalkulator.html',
    'odszkodowania-bledy-medyczne.html','odszkodowania-komunikacyjne.html',
    'odszkodowania-smierc-bliskiej-osoby.html','odszkodowania-wypadki-przy-pracy.html',
    'odszkodowania-wypadki-rolnicze.html','opinie.html','polityka-prywatnosci.html',
    'sukcesy.html','uslugi.html','404.html','blog/index.html'
)
foreach ($file in $files) {
    $c = Get-Content $file -Raw -Encoding UTF8
    $c = $c.Replace($old, $new)
    Set-Content $file -Value $c -Encoding UTF8 -NoNewline
    Write-Host "done: $file"
}
```

- [ ] **Krok 3: Weryfikacja**

```powershell
Select-String -Pattern 'mb-3.*LEXPERIENS' -Path "jak-dzialamy.html","kontakt.html","kalkulator.html"
```

Oczekiwane: brak wyników (stary wzorzec zniknął).

```powershell
Select-String -Pattern 'footer-logo-link' -Path "jak-dzialamy.html","kontakt.html","kalkulator.html"
```

Oczekiwane: po 1 wyniku na plik.

- [ ] **Krok 4: Commit**

```bash
git add jak-dzialamy.html kontakt.html kalkulator.html odszkodowania-*.html opinie.html polityka-prywatnosci.html sukcesy.html uslugi.html 404.html blog/index.html
git commit -m "feat: replace CSS text logo with PNG img in subpage footers"
```

---

## Task 6: Footer logo — artykuły bloga (20 plików)

Artykuły bloga mają stary span `<span...>Odszkodowania</span>` w footerze.

**Files:**
- Modify: `blog/*.html` (20 artykułów)

- [ ] **Krok 1: Sprawdź wzorzec**

```bash
grep -n "font-bold.*Odszkodowania\|Odszkodowania.*font-bold" blog/co-robic-po-wypadku.html
```

- [ ] **Krok 2: Mass replace footer w artykułach**

```powershell
$footerNew = '<a href="/" class="footer-logo-link mb-3"><img src="/images/lexperiens-logo.png" alt="Lexperiens" class="footer-logo-img"></a>'

$files = Get-ChildItem "blog/*.html" | Where-Object { $_.Name -notmatch "^_szablon" }
foreach ($file in $files) {
    $c = Get-Content $file.FullName -Raw -Encoding UTF8
    # Footer standalone span (nie anchor)
    $c = $c -replace '<span class="text-white font-heading text-lg font-bold">Odszkodowania</span>', $footerNew
    Set-Content $file.FullName -Value $c -Encoding UTF8 -NoNewline
    Write-Host "footer done: $($file.Name)"
}
```

- [ ] **Krok 3: Weryfikacja**

```powershell
Select-String -Pattern 'font-bold.*Odszkodowania|Odszkodowania.*font-bold' -Path "blog/*.html" | Where-Object { $_.Filename -notmatch "_szablon" }
```

Oczekiwane: brak wyników.

- [ ] **Krok 4: Commit**

```bash
git add blog/
git commit -m "feat: replace CSS text logo with PNG img in blog article footers"
```

---

## Task 7: Weryfikacja wizualna

- [ ] **Krok 1: Uruchom serwer**

```bash
python3 -m http.server 1111
```

- [ ] **Krok 2: index.html — transparent nav (ciemny hero)**

Otwórz `http://localhost:1111` bez scrollowania:
- Logo jasne (białe/szare + cyan) na ciemnym tle ✓
- Brak białego prostokąta ✓

- [ ] **Krok 3: index.html — po scrollu (biały nav)**

Przewiń w dół:
- Logo oryginalne (ciemny charcoal + cyan) na białym navie ✓

- [ ] **Krok 4: Subpage nav**

Otwórz `http://localhost:1111/kontakt.html`:
- Logo jasne/białe na ciemnym navy navie (nav-solid + v2-subpage) ✓

- [ ] **Krok 5: Footer na każdej stronie**

Przewiń do stopki na `index.html`, `kontakt.html`, `blog/co-robic-po-wypadku.html`:
- Logo białe/jasne na ciemnym `#1a1a2e` tle ✓
- Brak białego prostokąta ✓
- Kliknięcie logo → przekierowuje na `/` ✓
