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

## Walidacja formularzy i stany błędów

### Quiz — walidacja:
- Kroki 1-4: użytkownik musi wybrać co najmniej jedną opcję, aby przejść dalej (przycisk "Dalej" nieaktywny do momentu wyboru)
- Krok 5 (formularz):
  - **Imię**: wymagane, min. 2 znaki
  - **Telefon**: wymagane, format polski (9 cyfr, opcjonalnie +48), walidacja inline
  - **Email**: opcjonalne, walidacja formatu jeśli wypełnione
- Komunikaty błędów inline pod polem, po polsku ("Podaj prawidłowy numer telefonu")

### Kalkulator — walidacja:
- Krok 1 (typ zdarzenia): wymagany wybór
- Krok 2 (obrażenia): wymagany min. 1 wybór
- Krok 3 (suwaki): domyślnie na 0, wynik aktualizuje się na żywo przy przesuwaniu
- Jeśli wszystko na 0 i brak obrażeń: wyświetl komunikat "Uzupełnij dane, aby zobaczyć szacunek"
- Skrajne przypadki (100% uszczerbek + amputacja): widełki sięgają górnego limitu z disclaimerem "Każda sprawa jest indywidualna"

### Formularz kontaktowy (sekcja 12):
- Pola: imię (wymagane), telefon (wymagane), email (opcjonalne), rodzaj sprawy (dropdown, opcjonalne), wiadomość (textarea, opcjonalne)
- Walidacja jak w quizie

### Stany UI:
- **Ładowanie** (po wysłaniu formularza): przycisk zmienia tekst na "Wysyłanie..." + spinner, disabled
- **Sukces**: ekran potwierdzenia "Dziękujemy! Oddzwonimy w ciągu 30 minut" z podsumowaniem danych + ikoną checkmark
- **Błąd sieci**: komunikat "Coś poszło nie tak. Spróbuj ponownie lub zadzwoń: [numer telefonu]"

### Obietnica "30 minut":
- Wyświetlana tylko w godzinach pracy (Pn-Pt 8:00-18:00, Sb 9:00-14:00)
- Poza godzinami: "Oddzwonimy w następnym dniu roboczym"

## RODO / Ochrona danych

Strona zbiera dane osobowe i informacje o stanie zdrowia — wymagane elementy:

- **Checkbox zgody** przy każdym formularzu: "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu i analizy sprawy. [Polityka prywatności]"
- **Drugi checkbox (opcjonalny)**: "Wyrażam zgodę na kontakt marketingowy"
- Checkboxy niepre-zaznaczone (wymóg RODO)
- **Polityka prywatności**: osobna podstrona `/polityka-prywatnosci` (treść do uzupełnienia przez klienta/prawnika)
- **Cookie consent banner**: prosty baner na dole — "Ta strona używa plików cookie" + "Akceptuję" / "Ustawienia"
- Cookie consent blokuje ładowanie skryptów analitycznych do momentu akceptacji
- **Podstrona**: `/polityka-prywatnosci`

## SEO — Schema markup

Implementacja schema.org (JSON-LD):
- **LocalBusiness** + **LegalService**: nazwa, adres Poznań, telefon, godziny, zasięg
- **FAQPage**: sekcja FAQ na stronie głównej i podstronach
- **BreadcrumbList**: nawigacja breadcrumb na podstronach
- **Article**: artykuły blogowe
- **Review**: opinie klientów (gdy dostępne)
- **Service**: każda podstrona usługowa

## Analityka i tracking

**Narzędzie**: Google Analytics 4 (za cookie consent)

**Eventy do śledzenia:**
- `quiz_step_1` ... `quiz_step_5` — każdy krok quizu osobno (pomiar drop-off)
- `quiz_submitted` — ukończenie quizu
- `calculator_used` — użycie kalkulatora
- `calculator_result_shown` — wyświetlenie wyniku
- `calculator_cta_clicked` — klik CTA po wyniku kalkulatora
- `form_submitted` — formularz kontaktowy
- `phone_clicked` — klik w numer telefonu
- `cta_sticky_bar_clicked` — klik w sticky bar (mobile)
- `case_study_viewed` — otwarcie case study
- `blog_article_read` — scroll >75% artykułu

**Cele konwersji (GA4):**
- Wysłanie quizu
- Wysłanie formularza kontaktowego
- Klik w numer telefonu

## Kalkulator — algorytm (placeholder)

Bazowe kwoty wg typu obrażenia (do kalibracji z prawdziwymi danymi):

| Obrażenie | Kwota bazowa |
|-----------|-------------|
| Złamania kości | 8 000 - 25 000 zł |
| Urazy kręgosłupa/szyi | 15 000 - 60 000 zł |
| Uraz głowy/wstrząs | 10 000 - 50 000 zł |
| Urazy wewnętrzne | 20 000 - 80 000 zł |
| Rany, blizny | 5 000 - 30 000 zł |
| Amputacja | 50 000 - 300 000 zł |
| PTSD/uszczerbek psychiczny | 10 000 - 40 000 zł |
| Śmierć bliskiej osoby | 30 000 - 200 000 zł |

**Mnożniki:**
- Czas leczenia: `1.0 + (dni / 365) * 0.5` (max 1.5x)
- Niezdolność do pracy: `1.0 + (dni / 365) * 0.8` (max 1.8x)
- % uszczerbku: `1.0 + (procent / 100) * 2.0` (max 3.0x)

**Łączenie obrażeń:** sumowanie kwot bazowych poszczególnych obrażeń, mnożniki aplikowane na sumę.

**Wynik:** `suma_bazowa * mnożnik_leczenie * mnożnik_praca * mnożnik_uszczerbek` → wyświetlane jako widełki (wynik * 0.7 — wynik * 1.3).

Disclaimer: "To orientacyjny szacunek. Dokładna kwota zależy od indywidualnych okoliczności sprawy."

## Case studies — struktura danych

Każdy case study zawiera:

```
{
  title: "Odszkodowanie po wypadku na S7",
  event_type: "wypadek-komunikacyjny",
  icon: "car",
  initial_offer: 15000,        // kwota ubezpieczyciela
  final_amount: 120000,         // kwota uzyskana
  multiplier: 8,                // zaokrąglony mnożnik
  duration: "4 miesiące",       // czas trwania sprawy
  short_description: "Po wypadku na S7 ubezpieczyciel zaproponował 15 tys...",
  full_story: "...",            // pełna historia na podstronie
  timeline: [                   // kroki na podstronie
    { date: "Styczeń 2025", label: "Zgłoszenie sprawy" },
    { date: "Luty 2025", label: "Analiza dokumentacji" },
    { date: "Marzec 2025", label: "Negocjacje z ubezpieczycielem" },
    { date: "Kwiecień 2025", label: "Wypłata 120 000 zł" }
  ]
}
```

## Zasoby graficzne

- **Ikony**: Lucide Icons (open source, MIT) — spójne, minimalistyczne
- **Ilustracje**: proste custom SVG w palecie kolorów strony (granat + złoto) — geometryczne, abstrakcyjne
- **Hero background**: gradient granat → ciemniejszy granat, bez zdjęć
- **Case study karty**: ikony Lucide + kolorowy pasek postępu
- **Brak zdjęć stockowych** — jeśli w przyszłości potrzebne zdjęcia zespołu, sesja fotograficzna

## Strona 404

Prosta strona: nagłówek "Nie znaleźliśmy tej strony", krótki tekst, CTA "Wróć na stronę główną" + "Skontaktuj się z nami". Utrzymana w stylu wizualnym strony.

## Mobile — sticky bar vs quiz

Sticky bottom bar ("Zadzwoń" + "Bezpłatna wycena") ukrywa się automatycznie gdy:
- Użytkownik jest w trakcie quizu (krok 1-5)
- Użytkownik korzysta z kalkulatora
- Jakikolwiek formularz jest w viewport

Wraca gdy użytkownik przewinie poza te sekcje.

## Blog — implementacja

Faza 1 (MVP): statyczne pliki HTML — każdy artykuł to osobny plik, lista artykułów hardcoded.
Faza 2 (przyszłość): migracja na headless CMS (np. Strapi, Contentful) lub WordPress jako backend API.

Faza 1 wystarcza na start z 5-10 artykułami. Struktura plików: `/blog/nazwa-artykulu.html`.
