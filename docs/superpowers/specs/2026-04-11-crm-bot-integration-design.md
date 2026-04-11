# CRM + AI Bot Integration — Design Spec

**Data:** 2026-04-11
**Status:** Draft
**Projekt:** szkody.vercel.app — kancelaria odszkodowawcza

---

## 1. Cel

Zbudować system CRM z botem AI obsługującym kanały pisane (chat, WhatsApp, IG, Messenger, email), który:
- Automatycznie kwalifikuje leady (A/B/C)
- Zbiera informacje od klientów 24/7
- Zapisuje dane do CRM z pełną historią kontaktu
- Powiadamia właściciela o gorących leadach
- Wysyła przypomnienia o wizytach i follow-upy
- Integruje się z istniejącą stroną szkody.vercel.app

Właściciel obsługuje telefony osobiście. Bot obsługuje wyłącznie kanały pisane.

## 2. Architektura

### 2.1 Przegląd

```
KANAŁY WEJŚCIOWE
  Strona (widget + formularze) | WhatsApp | IG | Messenger | Email
                       │
                       ▼
              CHATWOOT (VPS)
         Unified inbox — wszystkie
         kanały w jednym panelu
                       │ webhook
                       ▼
                 n8n (VPS)
         Automatyzacje:
         • Nowa wiadomość → AI bot
         • Kwalifikacja → CRM
         • Przypomnienie → SMS/email
                       │
              ┌────────┴────────┐
              ▼                 ▼
         Claude API        NocoDB (VPS)
         (AI bot)          CRM — leady,
                           sprawy, pipeline
```

### 2.2 Stack techniczny (Docker Compose na VPS Hostinger KVM 2)

| Usługa | Rola | RAM |
|--------|------|-----|
| Traefik | Reverse proxy + auto SSL (Let's Encrypt) | ~50 MB |
| Chatwoot | Unified inbox (web + worker + Sidekiq) | ~1.5-2 GB |
| NocoDB | CRM (interfejs tabelkowy/kanban, REST API) | ~200 MB |
| PostgreSQL | Baza danych (chatwoot_db, nocodb_db, n8n_db) | ~500 MB |
| Redis | Cache + queue (Chatwoot, Sidekiq) | ~200 MB |
| n8n | Automatyzacje (już zainstalowane) | ~300 MB |
| **Razem nowe** | | **~2.5-3 GB** |

### 2.3 Subdomeny

```
chat.domena.pl   → Chatwoot (widget + panel agenta)
crm.domena.pl    → NocoDB (dashboard CRM)
n8n.domena.pl    → n8n (już skonfigurowane)
```

## 3. Bot AI — scenariusze

### 3.1 Persona

Asystent kancelarii odszkodowawczej (NIE prawnik). Ton: profesjonalny, empatyczny, po polsku. Nigdy nie udziela porad prawnych, nie podaje kwot, nie obiecuje wyników.

### 3.2 Flow 1: Kwalifikacja nowego leada (główny)

Bot zbiera po kolei:
1. Typ zdarzenia (komunikacyjne / przy pracy / błąd medyczny / śmierć bliskiej / rolnicze / inne)
2. Data zdarzenia (lub przybliżenie)
3. Obrażenia ciała / hospitalizacja
4. Zgłoszenie na policję / do ubezpieczyciela
5. Czy klient ma już prawnika
6. Dane kontaktowe (imię, telefon)

Wynik kwalifikacji:
- **A (gorący)** — świeża sprawa, obrażenia, brak prawnika → natychmiastowe powiadomienie właściciela
- **B (ciepły)** — starsza sprawa lub drobne obrażenia → lead w CRM, kontakt w 24h
- **C (zimny)** — przedawnione, ma prawnika, inne → grzeczna odmowa z wyjaśnieniem

### 3.3 Flow 2: FAQ / pytania ogólne

Bot odpowiada na bazie knowledge base (treści ze strony + FAQ). Zawsze kończy propozycją bezpłatnej konsultacji → przekierowuje do Flow 1.

### 3.4 Flow 3: Poza godzinami pracy

Informuje o godzinach pracy (pon-pt 8-18, sob 9-14). Zbiera dane jak w Flow 1. Flaguje w CRM: "callback rano".

### 3.5 Flow 4: Powrót istniejącego klienta

Bot rozpoznaje numer (WhatsApp) lub email → sprawdza w CRM → nawiązuje do poprzedniej rozmowy. Notatka do CRM, powiadomienie jeśli pilne.

### 3.6 Knowledge base

Źródła kontekstu branżowego:
- Treści strony (usługi, FAQ, case studies)
- Podstawowe terminy prawne (przedawnienie, OC, NNW, zadośćuczynienie vs odszkodowanie)
- **Granica:** bot NIGDY nie udziela porad prawnych, nie podaje kwot, nie obiecuje wyników

### 3.7 Handoff do człowieka

Bot eskaluje rozmowę do live agenta (Ty w panelu Chatwoot) gdy:
- Klient wprost prosi o rozmowę z człowiekiem ("chcę rozmawiać z prawnikiem", "połącz mnie z kimś")
- Bot nie potrafi odpowiedzieć po 2 próbach (pętla / niezrozumiałe zapytanie)
- Wykryty stres / emocje (słowa kluczowe: "nie żyje", "desperacja", "pilne", "proszę o pomoc")
- Lead kwalifikowany jako A (gorący) — bot zbiera dane, ale flaguje do natychmiastowego kontaktu ludzkiego
- Klient pyta o szczegóły prawne wykraczające poza FAQ

Mechanizm: Chatwoot conversation label `handoff` + assign do agenta + powiadomienie Telegram/SMS.

### 3.8 Dostosowanie tonu per kanał

| Kanał | Styl | Długość |
|-------|------|---------|
| Chat na stronie | Formalny, szybki | 2-3 zdania |
| WhatsApp | Lekko mniej formalny | Krótkie, emoji OK |
| IG / Messenger | Przyjazny | Krótkie, emotikony |
| Email | Formalny, pełne zdania | Dłuższe, ustrukturyzowane |

## 4. CRM — struktura danych

### 4.1 Tabela: Leady

| Pole | Typ | Opis |
|------|-----|------|
| ID | auto | #0042 |
| Imię | text | Jan Kowalski |
| Telefon | text | +48 600 123 456 |
| Email | text | jan@gmail.com |
| Kanał źródłowy | select | WhatsApp / IG / Chat / Formularz / Messenger / Email |
| Typ zdarzenia | select | Komunikacyjne / Przy pracy / Błąd med. / Śmierć / Rolnicze / Inne |
| Data zdarzenia | date | 2026-03-15 |
| Kwalifikacja | select | A (gorący) / B (ciepły) / C (zimny) |
| Status | select | Nowy lead / Kwalifikowany / Kontakt umówiony / Dokumenty zebrane / W toku / Zamknięte |
| Przypisany do | text | Właściciel |
| Notatki | long text | Wolny tekst |
| Utworzono | datetime | auto |
| Ostatni kontakt | datetime | auto (aktualizowany przez n8n) |
| Źródło strony | text | quiz / kalkulator / kontakt / chat |

### 4.2 Tabela: Interakcje

| Pole | Typ | Opis |
|------|-----|------|
| Lead ID | link | → Leady |
| Data | datetime | auto |
| Kanał | select | WhatsApp / Telefon / Email / Chat |
| Typ | select | Bot / Ręczny |
| Treść/notatka | long text | Zapis rozmowy lub notatka |

### 4.3 Tabela: Przypomnienia

| Pole | Typ | Opis |
|------|-----|------|
| Lead ID | link | → Leady |
| Data przypomnienia | datetime | Kiedy |
| Typ | select | Callback / Follow-up / Wizyta / Dokument |
| Treść | text | Co zrobić |
| Wykonano | checkbox | Status |

### 4.4 Pipeline (Kanban)

```
Nowy lead → Kwalifikowany (A/B/C) → Kontakt umówiony → Dokumenty zebrane → W toku → Zamknięte (Wygrana/Przegrana/Odmowa)
```

### 4.5 Deduplikacja leadów

Klient może napisać na chacie, potem wypełnić quiz, potem napisać na WhatsApp — to ten sam lead.

Logika deduplikacji w n8n:
1. Nowy kontakt → szukaj w NocoDB po telefonie (unikalny identyfikator)
2. Jeśli znaleziony → dopisz interakcję do istniejącego leada, NIE twórz nowego
3. Jeśli nie znaleziony → sprawdź email
4. Jeśli nadal nie → utwórz nowy lead
5. Merge kanałów: lead.kanał_źródłowy przechowuje pierwszy kanał, interakcje logują wszystkie

### 4.6 Aktualizacja knowledge base

- Knowledge base bota = pliki markdown w `bot/knowledge/` w repo `szkody-crm/`
- Przy zmianie treści na stronie (FAQ, usługi) → ręczna aktualizacja odpowiedniego pliku
- n8n workflow: co 24h sprawdza sitemap strony pod kątem nowych/zmienionych stron (opcjonalnie, faza 4)

## 5. Automatyzacje n8n

| Trigger | Akcja |
|---------|-------|
| Bot zakończył kwalifikację | Utwórz lead w NocoDB, ustaw status + kwalifikację |
| Lead A (gorący) | SMS/Telegram do właściciela: "Gorący lead: [imię], [typ], [telefon]" |
| Lead B bez kontaktu >24h | Przypomnienie + bot wysyła "Czy mogę w czymś pomóc?" |
| Lead C (zimny) | Tylko zapis, bez powiadomienia |
| Formularz ze strony | Utwórz lead z tagiem źródła (quiz/kalkulator/kontakt) |
| Przypomnienie o wizycie -24h | SMS do klienta |
| Brak aktywności >7 dni | Alert do właściciela |

## 6. Integracja ze stroną szkody.vercel.app

### 6.1 Zmiany w kodzie strony

| Plik | Zmiana |
|------|--------|
| `js/form-validation.js` | `submitForm()` — zastąpić `setTimeout` blokiem `fetch` do Chatwoot Contact API |
| `js/quiz.js` | Submit handler — dane quizu → Chatwoot jako nowa konwersacja z tagiem `quiz` |
| `js/calculator.js` | Submit handler — wynik kalkulatora + dane → Chatwoot z tagiem `kalkulator` |
| Wszystkie HTML | Dodać Chatwoot widget script w `<head>` (wyekstrahować do `js/chatwoot.js` — jedna zmiana, ładowane wszędzie) |
| `vercel.json` | Dodać domenę Chatwoot do CSP `connect-src` i `script-src` |

### 6.2 Floating buttons

- Usunąć placeholder WhatsApp button
- Chatwoot widget → prawy dolny róg (desktop + mobile)
- Telefon → floating button obok czatu (desktop) / sticky bar (mobile, bez zmian)

### 6.3 Dane z formularzy → CRM

| Źródło | Dane | Tag CRM |
|--------|------|---------|
| Quiz | Typ zdarzenia, data, obrażenia, status, imię, telefon, email | `quiz` |
| Kalkulator | Typ obrażeń, dni, wynik kwotowy, imię, telefon | `kalkulator` |
| Kontakt (główna) | Imię, telefon, email, typ sprawy, wiadomość | `kontakt` |
| Kontakt (podstrony) | Imię, telefon, email, wiadomość + nazwa podstrony | `kontakt-[usługa]` |
| Chat widget | Pełna rozmowa z botem + zebrane dane | `chat` |

## 7. Koszty miesięczne

| Pozycja | Koszt | Uwagi |
|---------|-------|-------|
| VPS Hostinger KVM 2 | ~60 zł | Już opłacany |
| Claude API (bot) | ~50-150 zł | Zależne od ruchu |
| WhatsApp Business API | 0-50 zł | Przez 360dialog, darmowe do 1000 rozm./mies |
| Meta API (IG/Messenger) | 0 zł | Darmowe |
| Chatwoot | 0 zł | Self-hosted |
| NocoDB | 0 zł | Self-hosted |
| n8n | 0 zł | Self-hosted |
| **Razem nowe koszty** | **~50-200 zł/mies** | |

## 8. Fazy wdrożenia

| Faza | Zakres | Czas |
|------|--------|------|
| 1. Fundament | Chatwoot + NocoDB + PostgreSQL na VPS, widget na stronie, formularze → API | Tydzień 1-2 |
| 2. AI Bot | n8n workflow: Chatwoot webhook → Claude API → odpowiedź, knowledge base, kwalifikacja | Tydzień 2-3 |
| 3. Sociale | WhatsApp Business API + IG + Messenger w Chatwoot | Tydzień 3-4 |
| 4. Automatyzacje | Przypomnienia, follow-upy, alerty, raporty dzienne | Tydzień 4-5 |
| 5. Opcjonalnie | Cal.com (wizyt), dashboard analityczny | Później |

## 9. Bezpieczeństwo i RODO

### 9.1 Infrastruktura
- Dane na VPS w EU (Hostinger — europejskie DC)
- PostgreSQL z szyfrowanymi backupami (cron co 6h, retencja 30 dni, testowy restore co miesiąc)
- Chatwoot + NocoDB za Traefik z SSL
- Brak danych wrażliwych w repo strony (tokeny API w zmiennych środowiskowych na VPS)
- Docker `mem_limit` per kontener (Chatwoot 2GB, PostgreSQL 1GB, Redis 256MB, NocoDB 256MB)
- Swap 2GB skonfigurowany na VPS jako bufor bezpieczeństwa
- Uptime Kuma (self-hosted) — monitoring dostępności wszystkich usług + alerty email/Telegram

### 9.2 RODO — dane szczególnej kategorii (Art. 9 GDPR)

Dane odszkodowawcze (obrażenia, hospitalizacja, błędy medyczne) to **dane dotyczące zdrowia** — szczególna kategoria RODO.

- **Podstawa prawna:** Art. 6(1)(b) — wykonanie umowy/podjęcie działań na żądanie osoby + Art. 9(2)(a) — wyraźna zgoda na przetwarzanie danych zdrowotnych
- **DPIA (Data Protection Impact Assessment):** wymagane — dokument do przygotowania przed uruchomieniem produkcyjnym
- **DPA z Hostinger:** zweryfikować i podpisać Data Processing Agreement
- **Retencja danych:** Lead zimny (C) → usunięcie po 6 miesiącach. Sprawa zamknięta → archiwum 10 lat (termin przedawnienia roszczeń). Rozmowy z botem → 12 miesięcy.
- **Audit log:** n8n loguje kto/kiedy/co zmodyfikował w CRM (zapis do osobnej tabeli NocoDB)
- **Bot informuje** o przetwarzaniu danych na początku rozmowy (link do polityki prywatności)
- **Prawo do usunięcia** — endpoint w n8n do czyszczenia leada z CRM + Chatwoot + historii rozmów

### 9.3 Claude API — transfer danych do USA

Anthropic (dostawca Claude API) przetwarza dane w USA. Wymagane:
- **Zweryfikować DPA Anthropic** — czy obejmuje dane zdrowotne z EU
- **Standard Contractual Clauses (SCCs)** — sprawdzić czy Anthropic je oferuje (Schrems II)
- **Minimalizacja danych:** prompt do Claude API wysyła TYLKO informacje niezbędne do kwalifikacji — bez pełnych danych osobowych (imię, telefon zapisywane bezpośrednio do CRM, NIE przez API)
- **Fallback:** jeśli DPA Anthropic nie pokrywa Art. 9 danych — alternatywa: Mistral API (EU) lub self-hosted LLM (wymaga upgrade VPS do 32GB+ RAM)

### 9.4 Ochrona przed nadużyciami
- Rate limiting w Traefik: max 10 req/min per IP na widget czatu
- Honeypot field w formularzach na stronie (ukryte pole — boty spamowe je wypełniają)
- n8n workflow: jeśli >5 konwersacji z jednego IP w 10 min → blokada + alert

## 10. Oddzielne repo

System CRM/bot żyje w **osobnym repozytorium** (np. `szkody-crm/`), NIE w repo strony. Zawiera:
- `docker-compose.yml` — definicja stacka
- `n8n-workflows/` — eksporty workflow n8n (JSON)
- `bot/` — prompt systemowy, knowledge base, konfiguracja
- `docs/` — dokumentacja setupu
- `.env.example` — template zmiennych środowiskowych

Strona (`szkody/`) tylko wysyła dane do API Chatwoot — luźne powiązanie przez URL endpointu.
