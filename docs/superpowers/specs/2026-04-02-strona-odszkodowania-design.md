# Strona internetowa firmy odszkodowawczej — Spec

## Podsumowanie

Strona leadowa + edukacyjna dla firmy odszkodowawczej (pełen zakres usług). Wyróżnik: interaktywny quiz diagnostyczny jako główne narzędzie konwersji, kalkulator odszkodowań, case studies z mnożnikami. Siedziba: Poznań, zasięg: cała Polska. Branding do ustalenia później.

## Cele

- **Priorytet**: generowanie leadów (formularze, telefon)
- **Drugorzędny**: edukacja klientów (blog, FAQ, baza wiedzy)
- **Model biznesowy**: bezpłatna konsultacja + prowizja od sukcesu

## Analiza konkurencji

Przeanalizowano 6 stron konkurencji:
- kancelaria-effect.pl, tuodszkodowania.pl, kompensja.pl, pomocpowypadkowa.com, codex.org.pl, auxilia.pl

### Wspólne wzorce (do uniknięcia):
- Generyczne hero z hasłem "najwyższe odszkodowanie"
- Stockowe zdjęcia wypadków
- Korporacyjne kolory (niebieski/zielony/bordowy)
- Ściany tekstu SEO
- Statyczne formularze kontaktowe

### Luki (nasze szanse):
- Brak interaktywnego prowadzenia użytkownika (quiz)
- Brak transparentności procesu (timeline)
- Generyczny design wszędzie
- Słaby mobile UX

## Architektura strony

### Strona główna (one-page z sekcjami):

1. **Nawigacja (sticky)** — Logo | Usługi | Jak działamy | Kalkulator | Case studies | Blog | Kontakt + numer telefonu + CTA "Bezpłatna konsultacja"
2. **Hero + Quiz** — headline emocjonalny + quiz krokowy (5 kroków) wbudowany w hero
3. **Social proof bar** — liczniki: sprawy, kwota uzyskana, lata doświadczenia
4. **Jak działamy** — timeline 4 kroków: Konsultacja → Analiza → Negocjacje → Wypłata
5. **Kalkulator odszkodowań** — interaktywne narzędzie z suwakami i orientacyjną wyceną
6. **Usługi** — karty z ikonami, każda linkuje do podstrony SEO
7. **Case studies** — karty przed/po z mnożnikiem, filtr po typie
8. **Dlaczego my** — 4 bloki: bezpłatna konsultacja, płacisz za sukces, doświadczony zespół, cała Polska
9. **Opinie klientów** — karuzela cytatów
10. **Blog** — 3 najnowsze artykuły
11. **FAQ** — accordion
12. **Kontakt + footer** — formularz, mapa Poznań, godziny, social media

### Podstrony SEO:
- `/odszkodowania-komunikacyjne`
- `/odszkodowania-wypadki-przy-pracy`
- `/odszkodowania-bledy-medyczne`
- `/odszkodowania-smierc-bliskiej-osoby`
- `/odszkodowania-wypadki-rolnicze`
- `/kalkulator`
- `/blog`
- `/kontakt`
- `/jak-dzialamy`

Każda podstrona usługowa: Hero + opis problemu + co uzyskujemy + mini case study + FAQ + CTA.

## Quiz diagnostyczny

### Flow:

**Krok 1: "Co się wydarzyło?"**
- Wypadek samochodowy / motocyklowy / potrącenie pieszego / wypadek przy pracy / błąd medyczny / śmierć bliskiej osoby / wypadek w rolnictwie / inne

**Krok 2: "Kiedy to się stało?"**
- W ciągu 30 dni / 1-6 mies. / 6-12 mies. / 1-3 lata / ponad 3 lata (info o przedawnieniu)

**Krok 3: "Jakie były skutki?"**
- Pobyt w szpitalu / leczenie ambulatoryjne / trwały uszczerbek / niezdolność do pracy / śmierć osoby bliskiej / szkoda materialna

**Krok 4: "Jaki jest obecny status sprawy?"**
- Nic nie zgłaszałem / czekam na decyzję / wypłacono za mało / odmowa / nie wiem co robić

**Krok 5: Formularz kontaktowy**
- Imię, telefon, (opcjonalnie) email → "Otrzymaj bezpłatną wycenę"
- Podsumowanie wyborów z kroków 1-4
- "Oddzwonimy w ciągu 30 minut"

### Mechanika:
- Pasek postępu (20% → 100%)
- Duże klikalne kafelki z ikonami
- Animowane przejścia (slide left)
- Lead scoring na backendzie (odpowiedzi wpływają na priorytet)

## Kalkulator odszkodowań

**Krok 1:** Typ zdarzenia (kafelki)
**Krok 2:** Rodzaj obrażeń (multi-select): złamania, kręgosłup, głowa, wewnętrzne, blizny, amputacja, PTSD, śmierć bliskiej osoby
**Krok 3:** Suwaki: czas leczenia (0-365+ dni), niezdolność do pracy (0-365+ dni), % uszczerbku (0-100%)

**Wynik:** Widełki kwotowe (np. "45 000 — 120 000 zł") + disclaimer + CTA z formularzem kontaktowym.

Algorytm: proste mnożniki (typ × czas × uszczerbek), do kalibracji z danymi.

Dostępny jako sekcja na stronie głównej + osobna podstrona `/kalkulator`.

## Styl wizualny

### Kolorystyka:
- **Primary**: ciemny granat `#1A1F36`
- **Accent**: złoto/amber `#D4A843`
- **CTA**: intensywny pomarańcz `#E8652D`
- **Tło**: warm gray `#F7F5F2`
- **Tekst**: `#2D2D2D` / biały na ciemnym tle

### Typografia:
- **Nagłówki**: serif (Playfair Display / DM Serif) — premium
- **Body**: sans-serif (Inter / DM Sans) — czytelność

### Ton wizualny:
- Zero stockowych zdjęć wypadków — abstrakcyjne ilustracje, ikony, geometria
- Dużo white space
- Ciemny hero → jasne sekcje
- Mikroanimacje: quiz steps, count-up liczniki, timeline hover, scroll reveal

### Elementy UI:
- Zaokrąglone karty z subtelnym cieniem
- Quiz: duże klikalne ikony
- Kalkulator: suwaki + animowane wykresy
- Case studies: karty z wizualnym "przed → po"

## Technologia

- **HTML/CSS/JS** — statyczna strona
- **Tailwind CSS** — utility-first
- **Vanilla JS** — quiz, kalkulator, animacje
- **Formularze** — statyczne HTML, backend do podpięcia później
- **SEO-ready** — semantic HTML, meta tagi, Open Graph, schema.org

### Responsywność (mobile-first):

**Desktop (1200px+):** 2 kolumny hero, 3 kolumny karty
**Tablet (768-1199px):** 1 kolumna hero, 2 kolumny karty
**Mobile (<768px):** 1 kolumna, sticky bottom bar "Zadzwoń" + "Bezpłatna wycena"

### Detale mobile:
- Sticky bottom bar (zawsze widoczny)
- Touch targets min 48px
- Suwaki kalkulatora przystosowane do palca
- Lazy loading obrazów
- `prefers-reduced-motion` fallback

### Animacje:
- Quiz: slide transitions
- Liczniki: count-up on scroll
- Case study: hover scale
- Timeline: progressive reveal on scroll
- Target Lighthouse: 90+

## Case studies

Karty z wizualnym paskiem "przed/po":
- Kwota ubezpieczyciela vs kwota uzyskana + mnożnik (np. "8x więcej")
- Filtr po typie sprawy
- Na starcie: 3-4 placeholdery do zastąpienia prawdziwymi danymi
- Podstrona każdego case study: pełna historia + timeline + kwota

## Blog / Baza wiedzy

- Kategorie: wypadki komunikacyjne, przy pracy, błędy medyczne, porady prawne, FAQ
- Artykuły SEO (long-tail frazy)
- Każdy artykuł kończy się CTA (quiz/kalkulator)
- Sidebar: formularz + najpopularniejsze artykuły

## Ton komunikacji

Mix:
- **Profesjonalny i empatyczny**: "Rozumiemy przez co przechodzisz"
- **Bojowy**: "Ubezpieczyciele zaniżają wypłaty — nie pozwolimy na to"
- **Nowoczesny**: prosty język, transparentność, brak prawniczego żargonu
- **Premium**: elegancki design, autorytet poprzez dane i wyniki
