# Design: Powiadomienia email o nowych leadach

## Data: 2026-04-12

## Cel

Automatyczne powiadomienie email przy każdym nowym leadzie w Airtable CRM, niezależnie od źródła (formularz, chat, ręczne dodanie). Przygotowane pod przyszły routing — różne osoby dostają powiadomienia w zależności od typu sprawy.

## Architektura

Nowy, osobny workflow w n8n: **"Szkody - Powiadomienie Email o Leadzie"**

```
Airtable Trigger (co 1 min, tabela "Leady")
    │
    ▼
Code node (formatuj treść emaila)
    │
    ▼
Gmail node (wyślij na placeholder email)
```

### Dlaczego osobny workflow?

- Łapie leady z KAŻDEGO źródła (formularze, chat, ręczne dodanie, przyszłe integracje)
- Nie komplikuje istniejących workflow ("Szkody - Formularz - Airtable CRM", "Szkody - Chat AI")
- Łatwiej testować i modyfikować niezależnie
- Routing per typ sprawy będzie czysty w jednym miejscu

## Komponenty

### 1. Airtable Trigger

- **Typ:** Airtable Trigger (polling)
- **Tabela:** "Leady" (tbl2PKbbli14WgqYo)
- **Base:** "Szkody CRM" (appUoXROWqjxiwjrT)
- **Interwał:** co 1 minutę
- **Triggeruje na:** nowe rekordy

### 2. Code node — formatowanie emaila

Wejście: dane rekordu z Airtable Trigger.

Wyjście:
- `subject` — temat emaila
- `body` — treść emaila (plain text)
- `recipientEmail` — adres odbiorcy (na start stały, przygotowany pod routing)

**Temat:** `Nowy lead: {Imię} — {Typ zdarzenia}`

**Treść:**
```
Nowy lead w CRM Szkody

Imię: Jan Kowalski
Telefon: +48 600 123 456
Email: jan@gmail.com (lub "brak")
Typ sprawy: Komunikacyjne
Kwalifikacja: A (gorący)
Źródło: quiz
Data utworzenia: 2026-04-12

Notatki:
Wypadek 3 miesiące temu, złamanie ręki...

---
Link do rekordu: https://airtable.com/appUoXROWqjxiwjrT/tbl2PKbbli14WgqYo/{recordId}
```

**Logika Code node:**
```javascript
// Obsługa wielu rekordów naraz (batch) — Airtable Trigger może zwrócić >1 rekord
const items = $input.all();
const results = [];

for (const item of items) {
  const record = item.json.fields;
  const recordId = item.json.id;

  const name = record['Imię'] || 'Brak imienia';
  const phone = record['Telefon'] || 'Brak';
  const email = record['Email'] || 'Brak';
  const caseType = record['Typ zdarzenia'] || 'Nieokreślony';
  const qualification = record['Kwalifikacja'] || 'Brak';
  const source = record['Kanał źródłowy'] || 'Brak';
  const notes = record['Notatki'] || 'Brak';
  const createdDate = record['Data utworzenia'] || new Date().toISOString().split('T')[0];

  // Guard: jeśli trigger zwraca field IDs zamiast nazw, wszystko będzie "Brak"
  const allEmpty = [name, phone, email, caseType].every(v => v === 'Brak' || v === 'Brak imienia');
  if (allEmpty) {
    console.log('WARNING: Wszystkie pola puste — trigger może zwracać field IDs zamiast nazw. Record ID:', recordId);
  }

  const subject = `Nowy lead: ${name} — ${caseType}`;

  const body = `Nowy lead w CRM Szkody

Imię: ${name}
Telefon: ${phone}
Email: ${email}
Typ sprawy: ${caseType}
Kwalifikacja: ${qualification}
Źródło: ${source}
Data utworzenia: ${createdDate}

Notatki:
${notes}

---
Link do rekordu: https://airtable.com/appUoXROWqjxiwjrT/tbl2PKbbli14WgqYo/${recordId}`;

  // Na start: stały adres. Przyszłość: routing per typ sprawy (Switch node).
  const recipientEmail = 'TWÓJ_EMAIL@gmail.com';

  results.push({ json: { subject, body, recipientEmail } });
}

return results;
```

**Uwaga:** Przy pierwszym teście sprawdź output Airtable Trigger — jeśli zwraca field IDs zamiast nazw (`fldXXXX` jako klucze), trzeba zmapować IDs na nazwy lub użyć nazw z triggera.

### 3. Gmail node

- **Credentials:** konto Gmail (do podpięcia w n8n)
- **To:** `{{ $json.recipientEmail }}`
- **Subject:** `{{ $json.subject }}`
- **Message:** `{{ $json.body }}`
- **Format:** plain text
- **Retry On Fail:** TAK (Settings → Retry On Fail = true, Max Retries = 3) — zabezpieczenie przed utratą powiadomień przy tymczasowych błędach Gmail

## Przyszły routing (faza 2 — nie wdrażane teraz)

Zamiana stałego `recipientEmail` w Code node na Switch node:

```
Switch (Typ zdarzenia)
  ├─ Komunikacyjne → osoba-A@email
  ├─ Przy pracy → osoba-B@email
  ├─ Błąd medyczny → osoba-C@email
  ├─ Śmierć bliskiej → osoba-D@email
  ├─ Rolnicze → osoba-E@email
  └─ default → właściciel@email
```

Alternatywnie: tabela routingu w Airtable (typ → email), odpytywana dynamicznie — zero zmian w workflow przy dodawaniu nowych osób.

## Wdrożenie (krok po kroku)

1. **Utwórz workflow** w n8n jako **NIEAKTYWNY** ("Szkody - Powiadomienie Email o Leadzie")
2. **Podepnij Gmail credentials** — OAuth2 z kontem Google
3. **Podepnij Airtable credentials** — prawdopodobnie już skonfigurowane z istniejących workflow
4. **Zamień placeholder** `TWÓJ_EMAIL@gmail.com` na docelowy adres
5. **Test manualny** — dodaj ręcznie rekord w Airtable, kliknij "Test Workflow" w n8n
6. **Sprawdź output Airtable Trigger** — czy klucze to nazwy pól (`Imię`) czy field IDs (`fldXXX`). Jeśli IDs — dostosuj Code node.
7. **Sprawdź email** — czy przyszedł, czy dane się zgadzają, czy link do Airtable działa
8. **Aktywuj workflow** — przełącz na aktywny

## Wymagania

1. **Gmail credentials w n8n** — podpiąć konto Google (OAuth2)
2. **Airtable credentials w n8n** — API key lub OAuth
3. **Adres email odbiorcy** — uzupełnić placeholder `TWÓJ_EMAIL@gmail.com`

## Ograniczenia

- Airtable Trigger polling = max 1 min opóźnienia (nie real-time webhook)
- Gmail limit: 500 emaili/dzień (więcej niż wystarczy)
- Airtable Trigger po "zobaczeniu" rekordu nie wraca do niego — jeśli Gmail padnie i retry się wyczerpie, powiadomienie jest stracone (widoczne w n8n execution log)
- Airtable field names mogą wymagać dostosowania — trigger może zwracać nazwy lub field IDs w zależności od wersji n8n. Sprawdź przy pierwszym teście.
