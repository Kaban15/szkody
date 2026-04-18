# Do zrobienia — po debrandingu 2026-04-18

Lista zadań, które musisz wykonać **ręcznie** przed wdrożeniem prawdziwej firmy. Strona jest czysta z brandu Lexperiens, ale zawiera placeholdery — bez ich uzupełnienia klient zobaczy `[NAZWA FIRMY]` / `+48 000 000 000` / `kontakt@example.pl`.

---

## 1. Globalna wymiana placeholderów (gdy poznasz prawdziwe dane)

W każdym z poniższych przypadków użyj znajdź+zamień (Find & Replace) w całym projekcie. Kolejność nie ma znaczenia.

| Placeholder | Zamień na |
|-------------|-----------|
| `[NAZWA FIRMY]` | rzeczywista nazwa firmy (PL wariant) |
| `[COMPANY NAME]` | nazwa angielska (lub ta sama jeśli międzynarodowa) |
| `[НАЗВА КОМПАНІЇ]` | nazwa po ukraińsku |
| `+48 000 000 000` | prawdziwy telefon z międzynarodowym prefiksem |
| `tel:+48000000000` | tel-link (spójny z telefonem wyżej, bez spacji) |
| `kontakt@example.pl` | prawdziwy email |
| `[ul. Przykładowa 1, 00-000 Miasto]` | pełny adres (PL) |
| `[Street 1, 00-000 City]` | adres (EN) |
| `[вул. Прикладова 1, 00-000 Місто]` | adres (UA) |
| `[Miasto]` (w `footer.address`) | miasto PL (np. `Poznań`) |
| `[City]` (w EN i18n) | miasto EN |
| `[Місто]` (w UA i18n) | miasto UA |
| `[ul. Przykładowa 1]` / `[Street 1]` / `[вул. Прикладова 1]` | sama ulica (footer company street) |
| `[00-000 Miasto]` / `[00-000 City]` / `[00-000 Місто]` | sam kod pocztowy + miasto |
| `0000000000` (w `polityka-prywatnosci.html`) | NIP (10 cyfr) |

**Gdzie szukać:** pliki HTML w roocie + `blog/`, pliki `lang/en.json` + `lang/ua.json`, `js/chat-widget.js`, `CLAUDE.md`.

**Komenda pomocnicza (zliczenie trafień):**
```bash
grep -r "NAZWA FIRMY\|+48 000 000 000\|kontakt@example.pl\|ul. Przykładowa" \
  --include="*.html" --include="*.json" --include="*.js" --include="*.md" .
```

---

## 2. Airtable — nowy system prompt v3 dla chatbota

**Status aktualny:** Chat używa dynamicznego promptu ładowanego z Airtable `Prompt Historia` (record `reckEZDFyl61zJhF7` = Status `Aktywny`). Stary prompt v2 referuje „Lexperiens" i „kancelarię". Trzeba to wymienić, inaczej bot będzie się przedstawiać starą firmą mimo zmian na stronie.

**Co zrobić:**
1. Otwórz Airtable → baza „Szkody CRM" → tabela „Prompt Historia" (`tblet0tFXTXykdtcX`)
2. Utwórz nowy rekord:
   - **Data:** dzisiejsza
   - **Prompt:** skopiuj treść z pliku `docs/airtable-prompt-v3-posrednik-draft.md` (sekcja „Treść promptu")
   - **Zmiany:** „Przejście na model pośrednika — usunięcie brand Lexperiens"
   - **Powód:** „Rebranding — firma pośrednicząca, nie kancelaria"
   - **Status:** `Draft`
3. **Przed wklejeniem** — zamień `[NAZWA FIRMY]`, `+48 000 000 000`, `kontakt@example.pl`, `[ul. Przykładowa 1, 00-000 Miasto]` w treści promptu na prawdziwe dane (inaczej bot zacytuje tokeny)
4. Otwórz emaila z workflow „Szkody - Analiza Rozmów" lub aktywuj przez UI:
   - Zmień Status obecnego `Aktywny` rekordu na `Wycofany`
   - Zmień Status nowego Draft na `Aktywny`
5. Efekt: następna sesja chatu pobierze nowy prompt

**Rollback:** zmień Status dowolnego `Wycofany` rekordu z powrotem na `Aktywny`. Natychmiastowo.

---

## 3. n8n — weryfikacja workflow

Workflow produkcyjne nie zostały ruszone. Ale sprawdź ręcznie:
- **Szkody - Powiadomienie Email o Leadzie** (`cV3BK9CU6S9wucuF`) — template emaila może hardcodować nazwę firmy. Otwórz Gmail node, popraw stopkę jeśli trzeba.
- **Szkody - Follow-up Reminder** (`s13xEwD2mBwimQ7y`) — Code node „Buduj email" może mieć „Lexperiens" w headerze maila. Popraw.
- **Szkody - Lead Action** (`5KrTzeOBFlTyAWBo`) — HTML confirmation pages mogą mieć brand. Popraw.

**Komenda:** nie ruszaj plików `n8n/*.json` w repo (to są historyczne backupy z datą sprzed debrandingu). Zmień workflow bezpośrednio w UI n8n (n8n.kaban.click).

---

## 4. Logo

**Aktualny stan:** w `<nav>` i `<footer>` jest TEKSTOWY placeholder `[NAZWA FIRMY]`. Obrazki `lexperiens-logo*.png` leżą w `images/` ale NIE są referencjonowane w HTML.

**Decyzja przed launchem:**

- **Opcja A — zostać przy tekście** (najprostsza): wstaw prawdziwą nazwę firmy przez globalną wymianę tokena `[NAZWA FIRMY]` (punkt 1). Tekst auto-dopasuje się do nav/footer. Skaluje się automatycznie.
- **Opcja B — wrócić do grafiki**:
  1. Umieść nowe logo w `images/` (preferencja: PNG z transparentnym tłem, wysokość ~80px dla nav, ~68px dla footer)
  2. W każdym HTMLu zastąp `<a class="nav-logo-link nav-logo-text">[NAZWA FIRMY]</a>` na `<a class="nav-logo-link"><img src="/images/TWOJE-LOGO.png" alt="..." class="nav-logo-img"></a>` (to samo dla footer — klasa `footer-logo-link` + `footer-logo-img`)
  3. Usuń klasy `.nav-logo-text` i `.footer-logo-text` z `css/styles.css` (niepotrzebne)
  4. CSS dla `.nav-logo-link` z `filter: invert(1) hue-rotate(180deg)` jest już gotowy — działa z każdym PNG

---

## 5. Pliki `images/lexperiens-logo*.png`

Zostały jako backup na dysku. Po potwierdzeniu nowego brandu:
```bash
rm images/lexperiens-logo.png images/lexperiens-logo-original.png
```

---

## 6. Weryfikacja wizualna

Po debrandingu strona nie była testowana w przeglądarce (trudny do automatyzacji). Odpal lokalnie:
```bash
python3 -m http.server 1111
# Otwórz http://localhost:1111
```
Sprawdź:
- [ ] Nav na `index.html` (najpierw transparent, potem biały po scrollu) — tekst `[NAZWA FIRMY]` czytelny w obu stanach
- [ ] Nav na każdej subpage (dark bg) — tekst widoczny
- [ ] Footer (zawsze dark) — tekst biały
- [ ] `kontakt.html` — szary placeholder w miejscu mapy, OK
- [ ] Chat widget — kliknij bąbelek, czy greeting się wyświetla z nową treścią
- [ ] Przełącz język EN/UA (flaga w nav) — tłumaczenia działają bez błędów
- [ ] `polityka-prywatnosci.html` — ADO widoczne z placeholderami

---

## 7. Dodatkowe placeholdery (NIE związane z debrandingiem — już były wcześniej)

- **GA4 ID:** `G-XXXXXXXXXX` w `js/cookie-consent.js` → prawdziwy Measurement ID
- **Insurance logos:** obecnie tekst w pasku ubezpieczycieli — podmienić na SVG/PNG
- **Team member bios, testimonials, case studies** — placeholder content do napisania od prawdziwych klientów/ekspertów
- **Schema.org URLs:** `https://example.pl` w JSON-LD — zmienić na prawdziwy URL produkcji (np. `https://twojafirma.pl`)

---

## 8. Gdy wszystko gotowe — wdrożenie

```bash
git add -A
git commit -m "feat: replace all placeholders with real brand data"
git push origin master       # Vercel auto-deploy
```

Po deployu — przetestuj https://szkody.vercel.app (lub twoją prawdziwą domenę) w realnej przeglądarce. Zwróć szczególną uwagę na formularze kontaktowe — czy lead faktycznie trafia do Airtable z nową nazwą firmy w notatkach.
