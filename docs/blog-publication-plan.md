# Blog Publication Plan

**Status:** Oczekuje na start
**Data startu:** _do uzupelnienia_
**Strategia:** 2-3 artykuly tygodniowo przez ~7 tygodni

---

## Jak publikowac artykul

1. Zweryfikuj tresc artykulu (otworz lokalnie: `python3 -m http.server 1111`)
2. Gdy gotowy: `git push origin master` (Vercel auto-deploy)
3. Poczekaj 2-3 minuty az Vercel zbuduje strone
4. Sprawdz czy artykul jest dostepny pod publicznym URL-em
5. **GOOGLE SEARCH CONSOLE — nie zapomnij!**
   - Wejdz na https://search.google.com/search-console
   - Wklej URL artykulu w pole "Sprawdz dowolny adres URL" na gorze
   - Kliknij "Popros o zindeksowanie"
   - Powtorz dla KAZDEGO artykulu opublikowanego danego dnia
6. Zaktualizuj ten plik — zmien status na "Opublikowany" i wpisz date

## Rozklad w tygodniu

Artykuly w danym tygodniu rozbij na osobne dni — najlepiej poniedzialek, sroda, piatek.
Nie wrzucaj wszystkich na raz jednego dnia.

Dlaczego:
- Google widzi regularna aktywnosc → lepszy "freshness signal"
- Masz czas zweryfikowac kazdy artykul osobno
- Latwiej sledzic co juz zglosiles w Search Console
- Unikasz sygnalu "content dump" (nagle 3 strony na raz)

Przyklad dla tygodnia z 3 artykulami:
- Poniedzialek: artykul 1 → push → Search Console
- Sroda: artykul 2 → push → Search Console
- Piatek: artykul 3 → push → Search Console

---

## Tydzien 1 — Fundamenty + pierwsze tresci

| # | Plik | Tytul | Kategoria | Status | Data publikacji |
|---|------|-------|-----------|--------|-----------------|
| - | `robots.txt` | — | SEO | Gotowy | _____-____-____ |
| - | `sitemap.xml` | — | SEO | Gotowy | _____-____-____ |
| 1 | `blog/co-robic-po-wypadku.html` | Co robic po wypadku samochodowym? | Poradnik | Gotowy | _____-____-____ |
| 2 | `blog/przedawnienie-roszczen.html` | Przedawnienie roszczen odszkodowawczych | Prawo | Gotowy | _____-____-____ |
| 3 | `blog/ubezpieczyciel-zanizyl-odszkodowanie.html` | Ubezpieczyciel zanizyl odszkodowanie — co dalej? | Poradnik | Gotowy | _____-____-____ |

> PRZYPOMNIENIE: Po opublikowaniu kazdego artykulu wejdz w Google Search Console → wklej URL → "Popros o zindeksowanie". Zrob to osobno dla kazdego artykulu!

## Tydzien 2 — Uzupelnienie placeholderow

| # | Plik | Tytul | Kategoria | Status | Data publikacji |
|---|------|-------|-----------|--------|-----------------|
| 4 | `blog/jak-dokumentowac-obrazenia.html` | Jak dokumentowac obrazenia po wypadku? | Poradnik | Gotowy | _____-____-____ |
| 5 | `blog/wypadek-rolnictwo-krus.html` | Wypadek w rolnictwie — jak zglosic do KRUS? | KRUS | Gotowy | _____-____-____ |
| 6 | `blog/ile-odszkodowania-za-uszczerbek.html` | Ile odszkodowania za uszczerbek na zdrowiu? | Poradnik | Gotowy | _____-____-____ |

> PRZYPOMNIENIE: Google Search Console → wklej URL kazdego nowego artykulu → "Popros o zindeksowanie"

## Tydzien 3 — Klaster wypadki przy pracy

| # | Plik | Tytul | Kategoria | Status | Data publikacji |
|---|------|-------|-----------|--------|-----------------|
| 7 | `blog/jak-zglosic-wypadek-przy-pracy.html` | Jak zglosic wypadek przy pracy — krok po kroku | Poradnik | Gotowy | _____-____-____ |
| 8 | `blog/jednorazowe-odszkodowanie-zus.html` | Jednorazowe odszkodowanie z ZUS — ile wynosi? | Poradnik | Gotowy | _____-____-____ |
| 9 | `blog/odszkodowanie-od-pracodawcy.html` | Odszkodowanie za wypadek przy pracy od pracodawcy | Poradnik | Gotowy | _____-____-____ |

> PRZYPOMNIENIE: Google Search Console → wklej URL kazdego nowego artykulu → "Popros o zindeksowanie"

## Tydzien 4 — Prawo + potracenie

| # | Plik | Tytul | Kategoria | Status | Data publikacji |
|---|------|-------|-----------|--------|-----------------|
| 10 | `blog/zadoscuczynienie-vs-odszkodowanie.html` | Zadoscuczynienie vs. odszkodowanie — jaka roznica? | Prawo | Gotowy | _____-____-____ |
| 11 | `blog/odszkodowanie-za-potracenie.html` | Jak uzyskac odszkodowanie za potracenie pieszego? | Poradnik | Gotowy | _____-____-____ |
| 12 | `blog/jak-udowodnic-blad-medyczny.html` | Jak udowodnic blad medyczny? | Poradnik | Gotowy | _____-____-____ |

> PRZYPOMNIENIE: Google Search Console → wklej URL kazdego nowego artykulu → "Popros o zindeksowanie"

## Tydzien 5 — Klaster smierc + bledy medyczne

| # | Plik | Tytul | Kategoria | Status | Data publikacji |
|---|------|-------|-----------|--------|-----------------|
| 13 | `blog/ile-kosztuje-prawnik-odszkodowania.html` | Ile kosztuje prawnik od odszkodowan? | Poradnik | Gotowy | _____-____-____ |
| 14 | `blog/zadoscuczynienie-smierc-bliskiej-osoby.html` | Zadoscuczynienie po smierci bliskiej osoby | Poradnik | Gotowy | _____-____-____ |
| 15 | `blog/odszkodowanie-smierc-rodzica.html` | Odszkodowanie po smierci rodzica — kto i ile? | Poradnik | Gotowy | _____-____-____ |

> PRZYPOMNIENIE: Google Search Console → wklej URL kazdego nowego artykulu → "Popros o zindeksowanie"

## Tydzien 6 — Ostatnie poradniki

| # | Plik | Tytul | Kategoria | Status | Data publikacji |
|---|------|-------|-----------|--------|-----------------|
| 16 | `blog/odszkodowanie-blad-przy-porodzie.html` | Odszkodowanie za blad przy porodzie | Poradnik | Gotowy | _____-____-____ |
| 17 | `blog/odszkodowanie-krus-ile.html` | Odszkodowanie z KRUS — ile mozna uzyskac? | KRUS | Gotowy | _____-____-____ |

> PRZYPOMNIENIE: Google Search Console → wklej URL kazdego nowego artykulu → "Popros o zindeksowanie"

## Tydzien 7 — Case studies

| # | Plik | Tytul | Kategoria | Status | Data publikacji |
|---|------|-------|-----------|--------|-----------------|
| 18 | `blog/120000-za-wypadek-na-drodze-krajowej.html` | 120 000 zl za wypadek na drodze krajowej | Case study | Gotowy | _____-____-____ |
| 19 | `blog/85000-za-wypadek-w-zakladzie-produkcyjnym.html` | 85 000 zl za wypadek w zakladzie produkcyjnym | Case study | Gotowy | _____-____-____ |
| 20 | `blog/200000-za-bledna-diagnoze.html` | 200 000 zl za bledna diagnoze | Case study | Gotowy | _____-____-____ |

> PRZYPOMNIENIE: Google Search Console → wklej URL kazdego nowego artykulu → "Popros o zindeksowanie". To ostatni tydzien — po nim warto sprawdzic w Search Console zakladke "Skutecznosc" i zobaczyc ktore artykuly zaczely generowac wyswietlenia.

---

## Po kazdej publikacji — Google Search Console

### Czym jest Google Search Console?
Darmowe narzedzie Google do monitorowania widocznosci strony w wynikach wyszukiwania. Pozwala:
- Zglosic nowe URL-e do indeksacji (Google "odkryje" je w godzinach zamiast tygodni)
- Sprawdzic ktore frazy generuja klikniecia
- Wykryc bledy indeksowania

### Ile kosztuje?
**Zero.** Google Search Console jest calkowicie darmowe.

### Jak skonfigurowac (jednorazowo)?
1. Wejdz na https://search.google.com/search-console
2. Zaloguj sie kontem Google
3. Kliknij "Dodaj usluge" → "Prefiks adresu URL"
4. Wpisz adres strony (np. `https://szkody.vercel.app/` lub docelowa domena)
5. Zweryfikuj wlasnosc — najlatwiej przez plik HTML:
   - Google da Ci plik typu `google1234567890.html`
   - Wrzuc go do roota projektu (`C:\Users\piotr\CascadeProjects\szkody\`)
   - Push na Vercel
   - Kliknij "Zweryfikuj" w Search Console
6. Po weryfikacji dodaj sitemap: Menu → Mapy witryn → wpisz `sitemap.xml` → Przeslij

### Jak zglosic URL po publikacji artykulu?
1. Wejdz w Google Search Console
2. Na gorze jest pole "Sprawdz dowolny adres URL"
3. Wklej pelny URL artykulu (np. `https://twojadomena.pl/blog/co-robic-po-wypadku.html`)
4. Kliknij Enter
5. Kliknij "Popros o zindeksowanie"
6. Gotowe — Google zazwyczaj indeksuje w ciagu 24-48h

### Limit
Mozesz zglosic ~10-12 URL-i dziennie. Przy 2-3 artykulach tygodniowo to nie problem.

---

## Notatki
- Artykuly sa gotowe lokalnie, ale NIE wypchnięte na Vercel
- Przed publikacja kazdy artykul powinien byc zweryfikowany pod wzgledem tresci i SEO
- Sitemap.xml juz zawiera wszystkie 20 artykulow — Google nie zaindeksuje ich dopoki strona nie bedzie dostepna publicznie
- Gdy domena zostanie kupiona: zamien `example.pl` na prawdziwa domene we WSZYSTKICH plikach (canonical, OG, schema, sitemap, robots.txt)
