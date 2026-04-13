# Chat AI Evolution — Design Spec

**Data:** 2026-04-13
**Status:** Implemented (2026-04-13)
**Cel:** Rozbudowa chat widgetu o adaptację do typu klienta, zbieranie ratingu, archiwizację transkryptów i on-demand analizę rozmów z automatyczną ewolucją promptu systemowego.

## 1. Problem

Bot prowadzi rozmowy jednakowo niezależnie od kontekstu — ten sam ton, tempo i strategia dla klienta emocjonalnego po śmierci bliskiej osoby co dla rzeczowego klienta z kolizją drogową. Brak feedbacku oznacza brak wiedzy co działa a co nie. Prompt jest statyczny — nie ewoluuje.

## 2. Rozwiązanie

Podejście "Prompt Evolution" — cztery warstwy:

1. **Archiwizacja** — pełne transkrypty rozmów w Airtable
2. **Rating** — thumbs up/down od klientów w widgecie
3. **Adaptacja real-time** — reguły rozpoznawania typu klienta w system prompcie
4. **Analiza on-demand** — workflow analizujący rozmowy i proponujący zmiany promptu

Stack: n8n + Airtable + GPT-4o-mini (bez nowych serwisów).

## 3. Archiwizacja rozmów

### 3.1 Nowe pole w tabeli "Leady"

| Pole | Typ Airtable | Opis |
|------|-------------|------|
| `Transkrypt` | Long Text | Pełny JSON `[{role, content}, ...]` z sesji. Limit Airtable: 100k znaków. Jeśli transkrypt przekracza 80k znaków — obcinamy najstarsze wiadomości zachowując ostatnie 30 tur. |
| `Rating` | Number | `1` (thumbs up) lub `-1` (thumbs down), null jeśli brak |
| `Session ID` | Single Line Text | UUID sesji chatowej — dedykowane pole do wyszukiwania (zamiast parsowania z Notatki) |
| `Data analizy` | Date | Kiedy rozmowa została uwzględniona w analizie. Null = jeszcze nie analizowana. |

### 3.2 Zapis transkryptu

Workflow "Szkody - Chat AI" — w momencie zapisu leada do Airtable (gdy lead_saved: true), pole `Transkrypt` wypełniane pełną historią z payloadu `history`. Dane już dziś docierają do n8n w każdym request — wystarczy je zapisać.

Transkrypt zapisywany jako JSON string, np.:
```json
[
  {"role": "assistant", "content": "Dzień dobry! Jak mogę pomóc?"},
  {"role": "user", "content": "Miałem wypadek samochodowy"},
  {"role": "assistant", "content": "Przykro mi to słyszeć. Kiedy to się wydarzyło?"}
]
```

## 4. Rating widget

### 4.1 UX w chat widgecie

Po komunikacie "Dane przekazane specjaliście ✓" (`lead_saved: true`) pojawia się pasek ratingu:

```
Czy rozmowa była pomocna?  [👍]  [👎]
```

Po kliknięciu:
- Wybrany przycisk podświetla się, drugi znika
- Pojawia się tekst: "Dziękujemy za opinię"
- Rating wysyłany na webhook

Ograniczenia:
- Jeden rating per sesja (flaga `szkody_chat_rated` w sessionStorage)
- Nie wyświetla się jeśli lead nie został zapisany
- Wielojęzyczny — PL hardcoded w HTML (jak reszta widgetu), klucze i18n `chat.rate_question` i `chat.rate_thanks` w `en.json`/`ua.json` + atrybuty `data-i18n` na elementach

### 4.2 Klucze i18n

| Klucz | PL | EN | UA |
|-------|----|----|-----|
| `chat.rate_question` | Czy rozmowa była pomocna? | Was this conversation helpful? | Чи була ця розмова корисною? |
| `chat.rate_thanks` | Dziękujemy za opinię | Thank you for your feedback | Дякуємо за відгук |

### 4.3 Webhook i workflow

**Endpoint:** `POST /webhook/szkody-chat-rating`

**Payload:**
```json
{
  "session_id": "abc123",
  "rating": 1
}
```

**Workflow "Szkody - Chat Rating":**
1. Webhook POST → walidacja (rating = 1 lub -1, session_id niepusty)
2. Airtable Search — szukaj rekordu po dedykowanym polu `Session ID` = `abc123`
3. Airtable PATCH — ustaw pole Rating na wartość z payloadu
4. Respond to Webhook — `{"status": "ok"}`

## 5. Adaptacja real-time

### 5.1 Reguły rozpoznawania typu klienta

Nowa sekcja w system prompcie bota (~300 słów). Bot rozpoznaje typ rozmówcy po pierwszych 2-3 wiadomościach i adaptuje strategię.

| Typ klienta | Sygnały rozpoznawcze | Strategia bota |
|-------------|---------------------|----------------|
| **Emocjonalny** | Długie wiadomości, słowa: "nie mogę", "strata", "ból", "śmierć", "tragedia", wykrzykniki, wielokropki | Wolniejsze tempo, więcej empatii ("rozumiem jak trudna to sytuacja"), nie pytaj o szczegóły od razu, waliduj emocje przed pytaniami |
| **Rzeczowy** | Krótkie wiadomości (<20 słów), podaje fakty (daty, kwoty, typ wypadku), brak emocji | Szybszy wywiad, pomiń pytania na które już odpowiedział, bardziej konkretny język, szybciej do sedna |
| **Sceptyczny** | Pytania o koszty, "czy to darmowe?", "dlaczego miałbym", "nie wierzę", "a jakie macie doświadczenie" | Social proof (kwoty wygranych, "ponad 500 wygranych spraw"), transparentność kosztów ("płacisz tylko za sukces"), nie naciskaj na telefon zbyt wcześnie |
| **Obcojęzyczny** | Krótkie zdania, błędy gramatyczne, mieszanka języków, lang != "pl" | Prostsze słownictwo, krótsze zdania, potwierdzanie zrozumienia ("czy dobrze rozumiem — ...?"), brak idiomów |
| **Szczegółowy** | Pierwsza wiadomość >50 słów z typem wypadku + obrażeniami + datą + okolicznościami | Podsumuj co już wiesz ("Rozumiem — wypadek komunikacyjny z dnia X, obrażenia Y"), przejdź do brakujących informacji, pomiń pytania już odpowiedziane |

### 5.2 Implementacja

Reguły dodawane jako sekcja `## ADAPTACJA DO ROZMÓWCY` w system prompcie wewnątrz n8n Code node "Przygotuj prompt" w workflow "Szkody - Chat AI".

Format w prompcie:
```
## ADAPTACJA DO ROZMÓWCY

Rozpoznaj typ klienta po pierwszych 2-3 wiadomościach i dostosuj podejście:

EMOCJONALNY (sygnały: długie wiadomości, słowa bólu/straty, wykrzykniki):
→ Wolniej. Waliduj emocje. Nie pytaj o szczegóły od razu.

RZECZOWY (sygnały: krótkie, fakty, brak emocji):
→ Szybciej do sedna. Pomiń pytania na które odpowiedział.

[... itd.]
```

Te reguły stanowią punkt startowy — ewoluują przez mechanizm analizy (Sekcja 6).

## 6. Analiza rozmów i ewolucja promptu

### 6.1 Trigger

Na żądanie — manual trigger w n8n lub GET na `/webhook/szkody-analyze`.

### 6.2 Pipeline (workflow "Szkody - Analiza Rozmów")

```
Manual Trigger / Webhook GET
    ↓
Airtable: pobierz leady z Transkryptem gdzie Ostatnia analiza = false
    ↓
Code: przygotuj dane do analizy
    - transkrypty + rating + status leada + priorytet + typ sprawy
    ↓
GPT-4o: analiza wzorców (max 10 transkryptów per call; jeśli więcej — chunked w pętli, wyniki łączone)
    ↓
Code: sformatuj raport HTML + propozycję zmian promptu
    ↓
Airtable: zapisz propozycję do tabeli "Prompt Historia" (Status: Draft)
    ↓
Airtable: oznacz przeanalizowane leady (Ostatnia analiza = true)
    ↓
Gmail: wyślij raport z przyciskami akcji
```

### 6.3 Co analizuje GPT-4o

Prompt analizy instruuje model aby zbadał:

1. **Korelacja rating ↔ zachowanie bota** — co bot robił inaczej w rozmowach z 👍 vs 👎?
2. **Korelacja konwersja ↔ podejście** — leady Status: Kontakt/Umowa vs Brak kontaktu/Odrzucony — czym różniły się rozmowy?
3. **Powtarzające się pytania bez odpowiedzi** — czego klienci pytali a bot nie wiedział?
4. **Momenty porzucenia** — w którym punkcie rozmowy klient przestał pisać?
5. **Skuteczność reguł adaptacji** — czy bot poprawnie rozpoznawał typy klientów?
6. **Propozycja zmian** — co dodać/zmienić/usunąć w system prompcie?

### 6.4 Format raportu emailowego

```html
📊 Analiza rozmów ({N} rozmów, {data_od} – {data_do})

WYNIKI:
- 👍 {n_positive} / 👎 {n_negative} / brak ratingu: {n_none}
- Konwersja do Kontakt: {n_kontakt}/{N} ({percent}%)

WZORCE:
- {wzorzec_1}
- {wzorzec_2}
- {wzorzec_3}

PROPOZYCJE ZMIAN W PROMPCIE:
1. {propozycja_1}
2. {propozycja_2}
3. {propozycja_3}

[✅ Zatwierdź zmiany] [❌ Odrzuć] [✏️ Otwórz w n8n]
```

### 6.5 Mechanizm zatwierdzania

Przyciski w emailu linkują do webhook `/webhook/szkody-prompt-update`:

| Akcja | URL params | Efekt |
|-------|-----------|-------|
| Zatwierdź | `?action=approve&version=N` | Workflow oznacza Draft jako Aktywny w "Prompt Historia", dezaktywuje poprzednią wersję. Chat AI Code node czyta aktywny prompt z Airtable na starcie każdej rozmowy. |
| Odrzuć | `?action=reject&version=N` | Oznacza Draft jako Wycofany, loguje decyzję |
| Otwórz w Airtable | link do tabeli Prompt Historia | Umożliwia ręczną edycję Draftu przed zatwierdzeniem |

### 6.6 Prompt jako dane, nie kod

**Kluczowa decyzja:** System prompt NIE jest hardcoded w n8n Code node. Zamiast tego:

1. Aktywny prompt żyje w tabeli "Prompt Historia" (wiersz ze Status = Aktywny)
2. Workflow "Chat AI" na starcie każdej rozmowy pobiera aktywny prompt z Airtable (Airtable Search: Status = "Aktywny", sort by Wersja desc, limit 1)
3. Code node "Przygotuj prompt" buduje final prompt = pobrany prompt + kontekst rozmowy (lang, page_url)

To eliminuje ryzykowne patchowanie workflow przez API i umożliwia:
- Natychmiastowy rollback (zmień Status starej wersji na Aktywny)
- Edycję promptu bezpośrednio w Airtable bez dotykania n8n
- Pełną historię wersji z datami i powodami zmian

**Latency:** Dodatkowy Airtable API call (~200ms) na starcie sesji — akceptowalne przy ogólnym czasie odpowiedzi 2-3s.

### 6.7 Bezpieczniki

- **Limit promptu:** Maks 2000 słów. Jeśli propozycja przekracza — raport flaguje i sugeruje co usunąć.
- **Rollback:** Zmień Status dowolnej poprzedniej wersji na Aktywny w Airtable. Natychmiastowy efekt — następna rozmowa użyje tej wersji.
- **Brak auto-deploy:** Żadna zmiana promptu nie wchodzi bez Twojej akceptacji (email + kliknięcie "Zatwierdź").
- **Fallback:** Jeśli Airtable API nie zwróci aktywnego promptu (timeout/błąd) — Code node używa hardcoded fallback promptu (obecna wersja).

## 7. Tabela "Prompt Historia" (nowa w Airtable)

| Pole | Typ | Opis |
|------|-----|------|
| `Wersja` | Autonumber | 1, 2, 3... |
| `Data` | Date | Kiedy utworzono |
| `Prompt` | Long Text | Pełna treść system promptu |
| `Zmiany` | Long Text | Diff vs poprzednia wersja |
| `Powód` | Long Text | Podsumowanie analizy która wygenerowała tę wersję |
| `Status` | Single Select | Draft / Aktywny / Wycofany |
| `Rozmowy analizowane` | Number | Ile rozmów było podstawą analizy |
| `Średni rating` | Number | Średni rating rozmów w analizowanym okresie |

## 8. Nowe webhooks

| Endpoint | Metoda | Workflow | Cel |
|----------|--------|---------|-----|
| `/webhook/szkody-chat-rating` | POST | Szkody - Chat Rating | Rating od klienta |
| `/webhook/szkody-analyze` | GET | Szkody - Analiza Rozmów | Trigger analizy. Wymaga `?token=SECRET` (shared secret w n8n env var, walidowany w pierwszym Code node). |
| `/webhook/szkody-prompt-update` | GET | Szkody - Prompt Update | Zatwierdź/odrzuć prompt. Wymaga `?token=SECRET&action=approve&version=N`. |

## 9. Nowe n8n workflows

| Workflow | Trigger | Nodes | Cel |
|----------|---------|-------|-----|
| **Szkody - Chat Rating** | Webhook POST | Webhook → Airtable Search → Airtable PATCH → Respond | Zapisz rating do leada |
| **Szkody - Analiza Rozmów** | Manual / Webhook GET | Trigger → Airtable List → Code → OpenAI → Code → Airtable Create (Prompt Historia) → Airtable Update batch → Gmail | Analiza wzorców + propozycja zmian |
| **Szkody - Prompt Update** | Webhook GET | Webhook → Airtable Get (Prompt Historia) → Switch (approve/reject) → n8n API (update workflow) / Airtable PATCH → Respond (HTML confirmation) | Zatwierdzenie/odrzucenie zmian promptu |

## 10. Zmiany w istniejących komponentach

### 10.1 chat-widget.js
- Dodaj UI ratingu po `lead_saved: true`
- Nowy webhook call do `/webhook/szkody-chat-rating`
- Flaga `szkody_chat_rated` w sessionStorage
- Klucze i18n: `chat.rate_question`, `chat.rate_thanks`

### 10.2 lang/en.json, lang/ua.json
- Dodaj klucze `chat.rate_question`, `chat.rate_thanks`

### 10.3 Workflow "Szkody - Chat AI"
- Dodaj zapis `Transkrypt` i `Session ID` przy tworzeniu rekordu leada
- Zamień hardcoded system prompt na dynamiczny fetch z Airtable "Prompt Historia" (Status = Aktywny) + fallback na obecny prompt
- Pierwsza wersja promptu w "Prompt Historia" = obecny prompt + sekcja "Adaptacja do rozmówcy" (Sekcja 5)

### 10.4 css/chat-widget.css
- Style dla paska ratingu (thumbs up/down buttons, selected state)

## 11. Szacowany koszt

| Element | Koszt |
|---------|-------|
| Rating webhook call | $0 (n8n self-hosted) |
| Zapis transkryptu | $0 (Airtable free tier) |
| Analiza on-demand (GPT-4o, ~20 rozmów, chunked po 10) | ~$0.05-0.15 per run |
| Fetch promptu z Airtable per sesja | $0 (Airtable free tier) |
| System prompt z adaptacją (+300 słów) | ~$0.001 extra per rozmowa |

Całkowity koszt miesięczny przy 50 rozmowach i 2 analizach: **< $2**.

## 12. Fazy wdrożenia

| Faza | Zakres | Zależności |
|------|--------|-----------|
| **1** | Archiwizacja transkryptów + pola Airtable + reguły adaptacji w prompcie | Żadne |
| **2** | Rating widget (UI + webhook + workflow) | Faza 1 |
| **3** | Analiza rozmów (workflow + raport email) | Faza 1 + dane w Airtable |
| **4** | Prompt Update (zatwierdzanie z emaila + wersjonowanie) | Faza 3 |
