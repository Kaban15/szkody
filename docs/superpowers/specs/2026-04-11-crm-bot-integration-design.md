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

### 3.7 Dostosowanie tonu per kanał

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
| Wszystkie HTML | Dodać Chatwoot widget script w `<head>` |
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

- Dane na VPS w EU (Hostinger — europejskie DC)
- PostgreSQL z szyfrowanymi backupami
- Chatwoot + NocoDB za Traefik z SSL
- Brak danych wrażliwych w repo strony (tokeny API w zmiennych środowiskowych na VPS)
- Bot informuje o przetwarzaniu danych na początku rozmowy (link do polityki prywatności)
- Prawo do usunięcia danych — endpoint w n8n do czyszczenia leada z CRM + Chatwoot

## 10. Oddzielne repo

System CRM/bot żyje w **osobnym repozytorium** (np. `szkody-crm/`), NIE w repo strony. Zawiera:
- `docker-compose.yml` — definicja stacka
- `n8n-workflows/` — eksporty workflow n8n (JSON)
- `bot/` — prompt systemowy, knowledge base, konfiguracja
- `docs/` — dokumentacja setupu
- `.env.example` — template zmiennych środowiskowych

Strona (`szkody/`) tylko wysyła dane do API Chatwoot — luźne powiązanie przez URL endpointu.
