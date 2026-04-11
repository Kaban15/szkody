# Chat Widget + AI Bot — Design Spec

**Data:** 2026-04-11
**Status:** Draft
**Projekt:** szkody.vercel.app — kancelaria odszkodowawcza
**Zależność:** CRM Phase 1 (n8n webhook → Airtable) — zrealizowane

---

## 1. Cel

Wdrożyć widget czatu AI na stronie, który:
- Prowadzi głębokie rozmowy z potencjalnymi klientami 24/7
- Odpowiada na pytania z bazy wiedzy (FAQ, procedury, typy spraw)
- Odczytuje emocje rozmówcy i dostosowuje ton
- Zbiera dane kontaktowe (imię, telefon) naturalnie w toku rozmowy
- Zachęca do bezpłatnej konsultacji telefonicznej
- Automatycznie zapisuje leady do Airtable CRM + wysyła email powiadomienie

## 2. Architektura

```
Widget (js/chat-widget.js + css/chat-widget.css)
    ↕ POST JSON (synchroniczny)
n8n webhook /szkody-chat
    │
    ├→ Code: Buduj prompt (system + knowledge base + historia)
    ├→ HTTP Request: OpenAI GPT-4o-mini
    ├→ Code: Ekstrakcja danych (imię, telefon, typ sprawy)
    ├→ [jeśli ma dane] Airtable: Utwórz lead + Email
    │
    └→ Respond to Webhook (odpowiedź bota → widget)
```

### Stack

- **Widget:** Vanilla JS + CSS, inline SVG ikona, zero zależności
- **Backend:** n8n workflow (osobny od formularzy)
- **AI:** OpenAI GPT-4o-mini (temperature 0.7)
- **CRM:** Airtable (istniejący base "Szkody CRM", tabela "Leady")
- **Powiadomienia:** Email (istniejący SMTP w n8n)

## 3. Persona bota

### Tożsamość

"Asystent kancelarii" — nie mówi że jest AI, nie mówi że jest człowiekiem. Zwraca się od kancelarii ("nasz zespół", "nasi specjaliści"). Bez imienia własnego.

### Ton

- Empatyczny — "Rozumiem, to musiała być trudna sytuacja"
- Ciepły ale profesjonalny — nie prawniczy żargon, nie potoczny
- Krótkie odpowiedzi — 2-4 zdania max
- Proaktywnie zachęca do kontaktu telefonicznego po zebraniu informacji

### Wykrywanie emocji

| Sygnał | Reakcja |
|--------|---------|
| Śmierć bliskiej osoby | Kondolencje przed pytaniami, delikatne podejście |
| Frustracja ("nikt mi nie pomaga") | Walidacja emocji + zapewnienie o pomocy |
| Strach ("nie wiem co robić") | Uspokojenie + proste kroki |
| Złość na ubezpieczyciela | Zrozumienie, profesjonalizm (nie podsycanie) |
| Pilność ("to pilne") | Priorytet na zebranie telefonu → natychmiastowy callback |

### Granice

**NIE:** podaje kwot, nie udziela porad prawnych, nie obiecuje wyników, nie krytykuje ubezpieczycieli z nazwy, nie pyta o szczegóły medyczne (RODO)

**TAK:** wyjaśnia procedury, odpowiada na FAQ, zachęca do konsultacji, zbiera dane kontaktowe, informuje o godzinach pracy

### Knowledge base (wstrzykiwany w system prompt)

- 5 typów spraw: komunikacyjne, przy pracy, błąd medyczny, śmierć bliskiej, rolnicze
- Procedura: zgłoszenie → dokumentacja → wycena → negocjacje → wypłata
- Terminy przedawnienia: 3 lata (ogólne), 20 lat (przestępstwo)
- Model biznesowy: bezpłatna konsultacja, prowizja od sukcesu
- Godziny pracy: pon-pt 8-18, sob 9-14

## 4. Widget UI

### Bąbelek (zamknięty)

- Pozycja: prawy dolny róg, fixed
- Rozmiar: 56×56px, border-radius: 50%
- Kolor: #1a6b3c (brand green)
- Ikona: chat bubble SVG inline
- Animacja: pulse-ring (jak istniejący WhatsApp button)
- Tekst powitalny: "Porozmawiaj z nami" — pojawia się po 3s, znika po 8s
- Zastępuje obecny placeholder WhatsApp button

### Okienko czatu (otwarte)

- Desktop: 380×520px, fixed bottom-right
- Mobile: 100% width × 70vh, fixed bottom
- Header: zielony pasek (#1a6b3c), tekst "Asystent kancelarii", zielona kropka "online", przycisk X
- Ciało: białe tło, scroll, wiadomości bot (szare bąbelki, lewo) / klient (zielone bąbelki, prawo)
- Typing indicator: "..." animowane gdy czeka na odpowiedź
- Input: pole tekstowe + przycisk wyślij, placeholder "Napisz wiadomość..."
- Wysyłanie: Enter lub klik przycisku

### Zachowanie

| Zdarzenie | Reakcja |
|-----------|---------|
| Strona załadowana | Bąbelek po 3s delay (nie irytować) |
| Pierwsze otwarcie | Bot automatycznie: "Dzień dobry! Jestem asystentem kancelarii odszkodowawczej. W czym mogę pomóc?" |
| Klient pisze + Enter | Wiadomość od razu, typing indicator, odpowiedź 1-3s |
| Zamknięcie okienka | Rozmowa zachowana (sessionStorage) |
| Odświeżenie strony | Historia ginie — nowa rozmowa |
| Nawigacja na inną stronę | Historia ginie — nowa rozmowa |
| Bot zebrał imię+telefon | Subtlne "Dane przekazane specjaliście ✓" |
| Błąd sieci / timeout 15s | "Przepraszam, mam chwilowy problem. Proszę zadzwonić: +48 XXX XXX XXX" |
| Poza godzinami | Bot działa 24/7, informuje o godzinach callback |

### Pozycja i z-index

- Z-index: wyższy niż sticky bottom bar (mobile)
- Zastępuje js/chatwoot.js (który jest wyłączony)

## 5. n8n Workflow: "Szkody - Chat AI"

### Request widget → n8n

```json
{
  "message": "Miałem wypadek samochodowy",
  "history": [
    {"role": "assistant", "content": "Dzień dobry! W czym mogę pomóc?"},
    {"role": "user", "content": "Miałem wypadek samochodowy"}
  ],
  "session_id": "abc123",
  "page_url": "/odszkodowania-komunikacyjne.html"
}
```

### Response n8n → widget

```json
{
  "reply": "Przykro mi to słyszeć. Kiedy miał miejsce wypadek?",
  "lead_saved": false
}
```

### Workflow nodes

1. **Webhook** — POST /szkody-chat, responseMode: lastNode
2. **Code: Buduj prompt** — składa system prompt + knowledge base + historia rozmowy → messages array dla OpenAI
3. **HTTP Request: OpenAI** — POST /v1/chat/completions, model: gpt-4o-mini, temperature: 0.7, max_tokens: 300
4. **Code: Ekstrakcja danych** — regex na telefon, heurystyka na imię, mapowanie słów kluczowych na typ sprawy. Jeśli zebrano imię+telefon i session_id nie jest już w Airtable → flaga `save_lead = true`
5. **IF: save_lead?** — branch
6. **[true] HTTP Request: Airtable** — utwórz rekord w Leady (reuse logiki z istniejącego workflow)
7. **[true] Email** — powiadomienie (reuse istniejącego SMTP)
8. **Respond to Webhook** — zwróć `{reply, lead_saved}`

### Ekstrakcja danych (Code node)

```javascript
// Telefon: 9 cyfr w dowolnym formacie
const phoneMatch = fullText.match(/(\d{3}[\s-]?\d{3}[\s-]?\d{3})/);

// Imię: szukaj wzorców "mam na imię X", "jestem X", "X, 600..."
// + ostatnia wiadomość po pytaniu bota o imię

// Typ sprawy: słowa kluczowe
// "wypadek samochod*" → Komunikacyjne
// "praca/zakład/BHP" → Przy pracy
// "lekarz/szpital/operacja/diagnoza" → Błąd medyczny
// "śmierć/zmarł/zginął" → Śmierć bliskiej
// "rolni*/KRUS/pole" → Rolnicze
```

### Deduplikacja

`session_id` (generowany w widgecie jako UUID) → zapisany w Airtable w polu Notatki jako prefix `[session:abc123]`. Przed zapisem: sprawdź czy session_id już istnieje → jeśli tak, skip.

## 6. Pliki

### Nowe pliki w szkody/

```
js/chat-widget.js     — widget: bąbelek, okienko, historia, fetch
css/chat-widget.css   — style widgetu
```

### Modyfikacje w szkody/

```
*.html (wszystkie)    — dodać <link> do chat-widget.css + <script> chat-widget.js
                        (zamiast chatwoot.js lub obok)
vercel.json           — CSP connect-src już ma n8n.kaban.click (OK)
```

### Nowy workflow w n8n

Utworzony via API — "Szkody - Chat AI" — osobny od formularzy.

## 7. Koszty

| Element | Koszt/mies |
|---------|-----------|
| GPT-4o-mini API (~100 rozmów) | ~0.40 zł |
| GPT-4o-mini API (~1000 rozmów) | ~4 zł |
| Infrastruktura (n8n, Airtable) | 0 zł (już opłacone) |
| **Razem** | **< 5 zł/mies** |

## 8. Bezpieczeństwo

- **Rate limiting:** max 30 wiadomości per sesja, max 5 nowych sesji per IP per godzina
- **Prompt injection:** system prompt zawiera instrukcję ignorowania poleceń zmiany roli
- **Dane osobowe:** telefon i imię ekstraowane w n8n Code node, NIE wysyłane do OpenAI (ekstrakcja post-hoc z odpowiedzi bota, nie z raw user input)
- **Timeout:** widget czeka max 15s, potem fallback z numerem telefonu
- **Honeypot:** widget nie ma formularza HTML — bot spamowy musiałby symulować JS fetch

## 9. Przyszłe rozszerzenia (nie w tym scope)

- Chatwoot jako replacement widget (gdy będzie domena)
- WhatsApp / IG / Messenger boty (Faza 3 — oddzielny spec)
- Handoff do live agenta
- Persistent historia rozmów (wymaga backendu)
