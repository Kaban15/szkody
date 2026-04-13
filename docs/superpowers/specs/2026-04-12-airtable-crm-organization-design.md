# Airtable CRM Organization — Design Spec

**Data:** 2026-04-12
**Status:** Approved
**Projekt:** szkody.vercel.app — kancelaria odszkodowawcza

---

## 1. Cel

Zorganizować tabelę "Leady" w Airtable CRM tak, aby:
- Był jasny pipeline (statusy od "Nowy" do "Wygrany/Odrzucony")
- Leady miały automatyczny priorytet (scoring po typie sprawy i kanale)
- Współpracownik bez dostępu do Airtable mógł aktualizować statusy z poziomu maila
- Zapomniane leady generowały codzienny reminder
- Widoki dawały szybki przegląd sytuacji (Kanban, filtry)

## 2. Kontekst

### Stan obecny
- Airtable "Szkody CRM" (appUoXROWqjxiwjrT), tabela "Leady" (tbl2PKbbli14WgqYo)
- Istniejące pola: Imię, Telefon, Email, Kanał źródłowy, Typ zdarzenia, Kwalifikacja, Status, Źródło strony, URL źródłowy, Notatki, Przypisany do, Data utworzenia
- Pole "Status" istnieje ale bez zdefiniowanych wartości pipeline
- Brak priorytetyzacji, brak widoków, brak follow-up tracking
- ~20-100 testowych rekordów (będą wyczyszczone)

### Operator
- Obecnie 1 osoba, planowane rozszerzenie o współpracownika
- Współpracownik NIE będzie miał dostępu do Airtable — obsługuje leady z poziomu emaila

### Istniejące workflow n8n
- "Szkody - Formularz - Airtable CRM" — zapis formularzy do Airtable
- "Szkody - Chat AI" — chat widget → n8n → Airtable
- "Szkody - Powiadomienie Email o Leadzie" (cV3BK9CU6S9wucuF) — polling 1 min, email do piotrtokeny@gmail.com

## 3. Pipeline — statusy leada

### Etapy

| Status | Znaczenie | Przejście dalej | Kolor (Airtable) |
|--------|-----------|-----------------|-------------------|
| **Nowy** | Właśnie wpłynął, nikt nie dzwonił | Po pierwszym kontakcie telefonicznym | Niebieski |
| **Kontakt** | Dodzwoniłeś się, rozmawialiście | Po umówieniu spotkania/konsultacji | Żółty |
| **Konsultacja** | Spotkanie/rozmowa szczegółowa odbyła się | Po decyzji klienta | Pomarańczowy |
| **Umowa** | Klient podpisał umowę, sprawa w toku | Po zakończeniu sprawy | Zielony |
| **Wygrany** | Sprawa zakończona sukcesem, wypłata | Koniec | Ciemnozielony |
| **Odrzucony** | Nie kwalifikuje się (za stara sprawa, brak podstaw) | Koniec | Szary |
| **Brak kontaktu** | Nie odbiera, nie odpisuje — operator decyduje kiedy oznaczyć | Koniec lub wraca do "Nowy" jeśli się odezwie | Czerwony |

### Logika
- Nowe leady automatycznie dostają status **"Nowy"** (n8n ustawia przy zapisie)
- Reszta statusów — ręcznie (Kanban drag & drop lub przyciski w mailu)
- "Brak kontaktu" to osobna ślepa uliczka, nie "Odrzucony" — klient może wrócić
- Decyzja o "Brak kontaktu" jest ręczna — operator sam ocenia ile prób wystarczy

## 4. Scoring — automatyczny priorytet

### Dwa sygnały

Świeżość usunięta ze scoringu — leady trafiają do Airtable w sekundy po submisji, więc świeżość byłaby zawsze maksymalna (+3) i nie różnicowałaby priorytetów.

| Sygnał | Wysoki (+3) | Średni (+2) | Niski (+1) |
|--------|------------|-------------|------------|
| **Typ sprawy** | Komunikacyjne, Śmierć bliskiej | Przy pracy, Błąd medyczny | Rolnicze, Inne/nieokreślony |
| **Kanał** | Chat AI (zaangażowany, rozmawiał) | Formularz kontaktowy | Quiz, Kalkulator (wczesna faza) |

### Priorytet (suma punktów)

| Suma | Priorytet | Kolor | Znaczenie |
|------|-----------|-------|-----------|
| 5-6 | **Gorący** | Czerwony | Dzwoń natychmiast |
| 3-4 | **Ciepły** | Żółty | Dzwoń dziś |
| 1-2 | **Zimny** | Niebieski | Może poczekać |

### Implementacja
- n8n Code node oblicza scoring w momencie zapisu do Airtable
- Priorytet zapisywany jako Single Select ("Gorący" / "Ciepły" / "Zimny")
- Scoring statyczny (nie aktualizuje się z czasem)
- Operator może ręcznie zmienić priorytet w Airtable

### Mapowanie typów sprawy
Wartości z formularzy HTML (`event_type`) → scoring:
- `komunikacyjne` → +3
- `smierc` → +3
- `praca` → +2
- `medyczne` → +2
- `rolnicze` → +1
- inne/puste → +1

### Mapowanie kanałów
Wartości z `tag` pola w webhook → scoring:
- `chat-ai` → +3
- `kontakt`, `kontakt-*` → +2
- `quiz`, `kalkulator` → +1

## 5. Akcje z poziomu maila

### Przyciski w emailu z leadem

Email z nowego leada (workflow "Powiadomienie Email") dostaje dodatkowe przyciski:

```html
[✅ Zadzwoniłem]  [❌ Nie odbiera]  [📅 Follow-up jutro]
```

Każdy przycisk = link do n8n webhook:
```
GET https://n8n.kaban.click/webhook/szkody-lead-action?id={RECORD_ID}&action=contacted
GET https://n8n.kaban.click/webhook/szkody-lead-action?id={RECORD_ID}&action=no_answer
GET https://n8n.kaban.click/webhook/szkody-lead-action?id={RECORD_ID}&action=followup
```

### Nowy workflow: "Szkody - Lead Action"

```
Klik w link (GET webhook)
    │
    ▼
Odczytaj parametry: id, action
    │
    ├── action=contacted  → Status = "Kontakt"
    ├── action=no_answer  → Status = "Brak kontaktu"
    ├── action=followup   → Data follow-up = jutro (today + 1 day)
    │
    ▼
Airtable Update Record (zmień status / data follow-up)
    │
    ▼
Respond with HTML: "✅ Status zaktualizowany"
(prosta strona potwierdzenia w przeglądarce)
```

### Bezpieczeństwo i idempotentność
- Record ID Airtable nie jest zgadywalny (format `recXXXXXXXXXXXXXX`)
- Brak auth — akceptowalne dla 1-2 osób na MVP
- Przy skalowaniu → dodać jednorazowy token do linku
- **Idempotentność:** GET użyty zamiast POST (ograniczenie email `<a href>`). Webhook musi być idempotentny — jeśli status jest już ustawiony na żądaną wartość, zwraca sukces bez zmian. Zapobiega problemom z prefetch przeglądarki, podglądem linków w klientach email, i wielokrotnym kliknięciem.

## 6. Przypomnienia o follow-upach

### Nowy workflow: "Szkody - Follow-up Reminder"

```
Cron Trigger (codziennie o 8:00)
    │
    ▼
Airtable Search Records (3 zapytania):
  1. Status = "Nowy" AND Data utworzenia > 24h temu
  2. Status = "Kontakt" AND Data utworzenia > 7 dni temu (1 tydzień roboczy)
  3. Data follow-up = dziś
    │
    ├── 0 wyników → STOP (nie wysyłaj pustego maila)
    │
    ▼ Są zapomniane leady
Code node: grupuj po typie przypomnienia
    │
    ▼
Jeden zbiorczy email o 8:00
```

### Format maila

```
Temat: ⏰ Masz 4 leady do obsłużenia

━━━ NOWE BEZ KONTAKTU (>24h) ━━━
1. Jan Kowalski | 📞 +48 123... | Komunikacyjne | Gorący
   Wpłynął: wczoraj 14:30
   [✅ Zadzwoniłem]  [❌ Nie odbiera]

2. Anna Nowak | 📞 +48 456... | Przy pracy | Ciepły
   Wpłynął: 2 dni temu
   [✅ Zadzwoniłem]  [❌ Nie odbiera]

━━━ FOLLOW-UP NA DZIŚ ━━━
3. Piotr Wiśniewski | 📞 +48 789... | Błąd medyczny
   Notatka: "oddzwonić po 10:00"
   [✅ Zadzwoniłem]  [📅 Przełóż na jutro]
```

### Logika
- Jeden mail dziennie o 8:00
- Zawiera przyciski akcji (te same linki webhook co w sekcji 5)
- Jeśli brak zaległych leadów — mail nie idzie
- Progi: "Nowy" >24h, "Kontakt" >7 dni

## 7. Widoki w Airtable

| Widok | Typ | Filtr | Sortowanie |
|-------|-----|-------|------------|
| **🔥 Pipeline** | Kanban (grupowany po Status) | Ukryte: Odrzucony, Brak kontaktu | Priorytet w każdej kolumnie |
| **📋 Wszystkie leady** | Grid | Brak (pełna tabela) | Data utworzenia desc |
| **⚡ Nowe dziś** | Grid | Status = "Nowy" AND Data utworzenia = dziś | Priorytet (Gorący → Zimny) |
| **💀 Zapomniane** | Grid | (Status = "Nowy" AND Data utworzenia > 24h) OR (Status = "Kontakt" AND Data utworzenia > 7 dni) | Data utworzenia asc (najstarsze góra) |

## 8. Zmiany w istniejących systemach

### Zmiany w Airtable (tabela "Leady")

| Pole | Typ | Zmiana |
|------|-----|--------|
| **Status** | Single Select | Dodaj wartości: Nowy, Kontakt, Konsultacja, Umowa, Wygrany, Odrzucony, Brak kontaktu |
| **Priorytet** | Single Select | NOWE — Gorący, Ciepły, Zimny |
| **Data follow-up** | Date | NOWE |

### Zmiany w istniejących workflow n8n

| Workflow | Zmiana |
|----------|--------|
| "Szkody - Formularz - Airtable CRM" | Dodaj Code node ze scoringiem → ustawiaj Priorytet + Status "Nowy" |
| "Szkody - Chat AI" | Dodaj Code node ze scoringiem → ustawiaj Priorytet + Status "Nowy" (kanał = chat-ai → +3) |
| "Szkody - Powiadomienie Email o Leadzie" | Dodaj przyciski akcji HTML na dole maila (Code node "Formatuj Email") |

### Nowe workflow n8n

| Workflow | Trigger | Cel |
|----------|---------|-----|
| "Szkody - Lead Action" | Webhook GET `/webhook/szkody-lead-action` | Obsługa kliknięć przycisków → update statusu |
| "Szkody - Follow-up Reminder" | Cron daily 8:00 | Zbiorczy email o zaległych leadach |

## 9. Deliverables

### Nowe pliki w repo

| Plik | Opis |
|------|------|
| `n8n/lead-action-workflow.json` | JSON workflow "Lead Action" |
| `n8n/follow-up-reminder-workflow.json` | JSON workflow "Follow-up Reminder" |

### Zmiany w istniejących plikach

| Plik | Zmiana |
|------|--------|
| `n8n/lead-email-notification-workflow.json` | Dodane przyciski akcji w HTML |
| `CLAUDE.md` | Nowe workflow, pola, widoki w sekcji CRM |

### BEZ zmian

- Kod strony (JS/HTML/CSS) — zero zmian
- Istniejące pola Airtable — bez zmian (dodajemy nowe, nie modyfikujemy starych)

## 10. Deployment

1. Dodaj/zmodyfikuj pola w Airtable (Status wartości, Priorytet, Data follow-up)
2. Utwórz 4 widoki w Airtable
3. Update workflow "Formularz" — dodaj scoring Code node
4. Update workflow "Email notification" — dodaj przyciski akcji
5. Import nowych workflow (Lead Action, Follow-up Reminder)
6. Uzupełnij credentials, aktywuj workflow
7. Test end-to-end: formularz → scoring → mail z przyciskami → klik → status update → follow-up reminder

## 11. Ograniczenia i przyszłe rozszerzenia

### Ograniczenia MVP
- Scoring statyczny (nie aktualizuje się z czasem)
- Brak auth na linkach akcji w mailu
- Brak deduplication kontaktów (osobny design: baza kontaktów z historią)
- Widoki Airtable tworzone ręcznie (brak API do tworzenia widoków)

### Potencjalne rozszerzenia
- Deduplication + linked records (zaprojektowane wcześniej, czeka na tokeny API)
- Token jednorazowy w linkach akcji (bezpieczeństwo)
- Dynamiczny scoring (degradacja priorytetu z czasem)
- Powiadomienia push (Telegram/Slack zamiast email)
- Dashboard z metrykami (conversion rate per kanał, średni czas do kontaktu)
