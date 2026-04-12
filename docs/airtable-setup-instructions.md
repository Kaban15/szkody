# Instrukcje konfiguracji Airtable CRM

Przewodnik krok po kroku do skonfigurowania pola statusu, priorytetu i widoków w bazie "Szkody CRM".

**Baza:** Szkody CRM (appUoXROWqjxiwjrT)
**Tabela:** Leady (tbl2PKbbli14WgqYo)

---

## 1. Konfiguracja pola "Status"

Pole "Status" już istnieje jako Single Select. Dodaj następujące wartości z kolorami:

| Wartość | Kolor | Opis |
|---------|-------|------|
| Nowy | Niebieski (Blue) | Nowy lead, bez kontaktu |
| Kontakt | Żółty (Yellow) | Pierwszy kontakt nawiązany |
| Konsultacja | Pomarańczowy (Orange) | W trakcie konsultacji |
| Umowa | Zielony (Green) | Umowa podpisana |
| Wygrany | Ciemnozielony (Teal) | Sprawa wygrana |
| Odrzucony | Szary (Gray) | Lead odrzucony |
| Brak kontaktu | Czerwony (Red) | Brak możliwości kontaktu |

### Kroki:
1. Otwórz tabelę "Leady"
2. Kliknij na pole "Status" w nagłówku
3. Wybierz "Customize field"
4. W sekcji "Options" dodaj/edytuj każdą wartość:
   - Kliknij ikonę koloru obok każdej wartości
   - Wybierz odpowiedni kolor z palety
5. Kliknij "Save"

---

## 2. Dodanie pola "Priorytet"

### Kroki:
1. Otwórz tabelę "Leady"
2. Kliknij "+" w nagłówku kolumn (na końcu istniejących pól)
3. Wpisz nazwę: **Priorytet**
4. Wybierz typ pola: **Single select**
5. Dodaj wartości:

| Wartość | Kolor |
|---------|-------|
| Gorący | Czerwony (Red) |
| Ciepły | Żółty (Yellow) |
| Zimny | Niebieski (Blue) |

6. Kliknij "Save field"

---

## 3. Dodanie pola "Data follow-up"

### Kroki:
1. Otwórz tabelę "Leady"
2. Kliknij "+" w nagłówku kolumn
3. Wpisz nazwę: **Data follow-up**
4. Wybierz typ pola: **Date**
5. W opcjach pola:
   - Ustaw format na: **DD/MM/YYYY** (europejski format)
   - Wyłącz czas (opcja "Include time" OFF)
6. Kliknij "Save field"

---

## 4. Tworzenie widoku "🔥 Pipeline"

Kanban do zarządzania leadami po statusach.

### Kroki:
1. W prawym górnym rogu kliknij przycisk z widokami (grid icon)
2. Kliknij "+" aby dodać nowy widok
3. Wybierz **Kanban** jako typ widoku
4. Nazwa widoku: **🔥 Pipeline**
5. Konfiguracja:
   - **Group by:** Status
   - **Sort by:** Priorytet (ascending: Gorący → Ciepły → Zimny)
6. Ukryj kolumny statusu:
   - Kliknij na trzy kreski ☰ (menu widoku)
   - Wybierz "Hide fields"
   - Zaznacz: "Odrzucony", "Brak kontaktu"
   - Potwierdź
7. Kliknij "Save"

---

## 5. Tworzenie widoku "📋 Wszystkie leady"

Grid ze wszystkimi leadami, posortowanymi od najnowszych.

### Kroki:
1. Dodaj nowy widok (+)
2. Wybierz **Grid** jako typ widoku
3. Nazwa widoku: **📋 Wszystkie leady**
4. Konfiguracja:
   - **Sort by:** Data utworzenia (descending - najnowsze najpierw)
5. Kliknij "Save"

---

## 6. Tworzenie widoku "⚡ Nowe dziś"

Grid wyświetlający leady utworzone dzisiaj ze statusem "Nowy".

### Kroki:
1. Dodaj nowy widok (+)
2. Wybierz **Grid** jako typ widoku
3. Nazwa widoku: **⚡ Nowe dziś**
4. Konfiguracja filtru:
   - Kliknij na ikonę filtera (funnel icon)
   - Dodaj filtry:
     - **Warunek 1:** Status = Nowy
     - **Warunek 2 (AND):** Data utworzenia = Today
   - Potwierdź filtry
5. Konfiguracja sortowania:
   - **Sort by:** Priorytet (ascending: Gorący → Ciepły → Zimny)
6. Kliknij "Save"

---

## 7. Tworzenie widoku "💀 Zapomniane"

Grid wyświetlający leady nieaktywne, które wymagają follow-up.

### Kroki:
1. Dodaj nowy widok (+)
2. Wybierz **Grid** jako typ widoku
3. Nazwa widoku: **💀 Zapomniane**
4. Konfiguracja filtru:
   - Kliknij na ikonę filtera (funnel icon)
   - Dodaj logikę OR dla dwóch warunków:
     
     **Warunek 1 (LUB):**
     - Status = Nowy
     - AND Data utworzenia is before today minus 1 day (czyli więcej niż 24h temu)
     
     **Warunek 2 (LUB):**
     - Status = Kontakt
     - AND Data utworzenia is before today minus 7 days (czyli więcej niż 7 dni temu)
   
   Alternatywnie, jeśli Airtable nie wspiera łatwo "today minus X days":
   - Status = Nowy AND Data utworzenia < [wstaw datę z 24h temu]
   - Status = Kontakt AND Data utworzenia < [wstaw datę z 7 dni temu]

5. Konfiguracja sortowania:
   - **Sort by:** Data utworzenia (ascending - najstarsze najpierw)
6. Kliknij "Save"

---

## Podsumowanie zmian

| Typ zmiany | Nazwa | Status |
|-----------|-------|--------|
| Edycja pola | Status (dodanie kolorów) | ✓ |
| Nowe pole | Priorytet (Single Select) | ✓ |
| Nowe pole | Data follow-up (Date) | ✓ |
| Nowy widok | 🔥 Pipeline (Kanban) | ✓ |
| Nowy widok | 📋 Wszystkie leady (Grid) | ✓ |
| Nowy widok | ⚡ Nowe dziś (Grid) | ✓ |
| Nowy widok | 💀 Zapomniane (Grid) | ✓ |

---

## Notatki

- **Kolory w Airtable:** Domyślna paleta zawiera: Blue, Purple, Pink, Red, Orange, Yellow, Green, Teal, Gray, Brown
- **Sortowanie i filtry:** Mogą być edytowane w dowolnym momencie — kliknij ikonę filtera/sortowania w widoku
- **Emoji w nazwach widoków:** Można kopią-wkleić emoji bezpośrednio do pola nazwy widoku
- **Kanban — order kartek:** Domyślnie sortuje się po polu "Sort by" — zmiana sortowania zmienia rozmieszczenie kartek
- **Dynamiczne filtry z datami:** Jeśli Airtable wyświetla "Static date" zamiast "Today minus X", można ręcznie wpisać datę i aktualizować ją okresowo, lub użyć automatyzacji Airtable do tego celu

---

## Przydatne linki

- [Airtable Help — Single select](https://support.airtable.com/hc/en-us/articles/202904199-Single-select)
- [Airtable Help — Date fields](https://support.airtable.com/hc/en-us/articles/202904089-Date-fields)
- [Airtable Help — Kanban views](https://support.airtable.com/hc/en-us/articles/202900839-Introduction-to-Kanban-views)
- [Airtable Help — Filtering and sorting](https://support.airtable.com/hc/en-us/articles/203255215-Filtering-and-sorting-records)

---

## Deployment Checklist

### Airtable (manual, ~5 min)
- [ ] Dodaj wartości do pola Status (7 wartości z kolorami)
- [ ] Utwórz pole Priorytet (Single Select, 3 wartości)
- [ ] Utwórz pole Data follow-up (Date)
- [ ] Zanotuj Field ID nowego pola Priorytet (potrzebne w n8n)
- [ ] Zanotuj Field ID nowego pola Data follow-up (potrzebne w n8n)
- [ ] Utwórz widok 🔥 Pipeline (Kanban)
- [ ] Utwórz widok 📋 Wszystkie leady (Grid)
- [ ] Utwórz widok ⚡ Nowe dziś (Grid z filtrem)
- [ ] Utwórz widok 💀 Zapomniane (Grid z filtrem)

### n8n — modyfikacja istniejących workflow
- [ ] "Szkody - Formularz": dodaj Code node ze scoringiem (skopiuj z `n8n/scoring-code-node.js`) PRZED Airtable Create Record. W Airtable node dodaj mapowanie pól: Status ← `{{ $json.status }}`, Priorytet ← `{{ $json.priority }}`
- [ ] "Szkody - Chat AI": dodaj analogiczny Code node ze scoringiem
- [ ] "Szkody - Powiadomienie Email": zaimportuj zaktualizowany `n8n/lead-email-notification-workflow.json` LUB ręcznie zaktualizuj Code node "Formatuj Email"

### n8n — nowe workflow
- [ ] Import `n8n/lead-action-workflow.json`
- [ ] Zamień `DATA_FOLLOWUP_FIELD_ID` na rzeczywiste Field ID pola "Data follow-up" (1 miejsce w pliku)
- [ ] Podłącz credentials: Airtable, Gmail
- [ ] Aktywuj workflow
- [ ] Import `n8n/follow-up-reminder-workflow.json`
- [ ] Zamień `DATA_FOLLOWUP_FIELD_ID` na rzeczywiste Field ID (1 miejsce — filterByFormula w "Follow-up dziś")
- [ ] Zamień `PRIORITY_FIELD_ID` na rzeczywiste Field ID (1 miejsce — formatLead w "Buduj email")
- [ ] Podłącz credentials: Airtable, Gmail
- [ ] Ustaw timezone na Europe/Warsaw w Cron Trigger
- [ ] Aktywuj workflow

### Test end-to-end
- [ ] Wyślij formularz na stronie → sprawdź: rekord w Airtable ma Status=Nowy, Priorytet=Ciepły/Gorący/Zimny
- [ ] Sprawdź email: ma przyciski Zadzwoniłem/Nie odbiera/Follow-up
- [ ] Kliknij "✅ Zadzwoniłem" → otwiera stronę potwierdzenia, status w Airtable zmienia się na "Kontakt"
- [ ] Kliknij "📅 Follow-up jutro" → pole Data follow-up ustawione na jutro
- [ ] Poczekaj na 8:00 następnego dnia (lub ręcznie odpal workflow) → sprawdź email z podsumowaniem
