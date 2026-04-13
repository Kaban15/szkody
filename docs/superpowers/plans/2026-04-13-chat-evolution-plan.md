# Chat AI Evolution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conversation archiving, client rating, real-time adaptation rules, and on-demand prompt evolution to the AI chat widget — all within the existing n8n + Airtable stack.

**Architecture:** Four phases building on each other. Phase 1 (archiving + adaptation) modifies the existing n8n Chat AI workflow and creates Airtable infrastructure. Phase 2 (rating widget) adds client-side UI + a new n8n workflow. Phase 3 (analysis) adds an on-demand analysis workflow. Phase 4 (prompt update) adds approval-from-email workflow.

**Tech Stack:** n8n (self-hosted), Airtable API (PAT), GPT-4o / GPT-4o-mini (via n8n httpRequest), vanilla JS chat widget, Gmail (via n8n).

**Spec:** `docs/superpowers/specs/2026-04-13-chat-evolution-design.md`

**Key references:**
- Chat widget: `js/chat-widget.js`, `css/chat-widget.css`
- Chat AI workflow: n8n ID `Km52Gx1aoEJvcXba` (nodes: Webhook → Przygotuj prompt → OpenAI → Ekstrakcja → Zapisac? → Szukaj duplikatu → Duplikat? → Nowy? → Zapisz lead → Odpowiedz - zapisano / Odpowiedz - bez zapisu → Scoring)
- Airtable base: `appUoXROWqjxiwjrT`, table "Leady": `tbl2PKbbli14WgqYo`
- Airtable PAT: in `.env` as `AIRTABLE_PAT`
- n8n API key: in `.env` as `N8N_API_KEY`
- Known field IDs: Status `fldvigglUZz1WCh9w`, Priority `fldLIbFpVcGT4zwFl`, CaseType `fldFvHcaJFi5avKIJ`, Source `fld32SWWh3EpUz3su`, Name `fldBhCi2Mmn2DrjHj`, Phone `flddIaNdaLRS3Cqj1`, Notes `fldRhukW6qHMGPtl7`, CreatedAt `fldQ2B6JLQmit8CQl`, SourceURL `fldZvIeS670c9k2FC`, AssignedTo `fldrOeav9AFscL0eo`
- Scoring node reference: `n8n/scoring-code-node.js`

**Important:** All n8n workflow modifications are done via the n8n REST API (`PUT /api/v1/workflows/{id}`). Use Python with `urllib.request` for API calls (curl has path issues on Windows). The `.env` file contains credentials.

---

## Phase 1: Archiving + Airtable Infrastructure + Adaptation Rules

### Task 1: Create new Airtable fields in "Leady" table

**Context:** The "Leady" table needs 4 new fields for transcript storage, rating, session lookup, and analysis tracking. Use Airtable API to create fields programmatically.

- [ ] **Step 1: Discover existing fields to avoid conflicts**

```bash
python3 -c "
import urllib.request, json, os

pat = '<<AIRTABLE_PAT_FROM_ENV>>'
base_id = 'appUoXROWqjxiwjrT'
table_id = 'tbl2PKbbli14WgqYo'

req = urllib.request.Request(
    f'https://api.airtable.com/v0/meta/bases/{base_id}/tables',
    headers={'Authorization': f'Bearer {pat}'}
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
for table in data['tables']:
    if table['id'] == table_id:
        for f in table['fields']:
            print(f'{f[\"id\"]} | {f[\"name\"]} | {f[\"type\"]}')
"
```

Expected: List of all current fields with IDs and types.

- [ ] **Step 2: Create 4 new fields via Airtable API**

```bash
python3 -c "
import urllib.request, json

pat = '<<AIRTABLE_PAT_FROM_ENV>>'
base_id = 'appUoXROWqjxiwjrT'
table_id = 'tbl2PKbbli14WgqYo'

fields_to_create = [
    {'name': 'Transkrypt', 'type': 'multilineText'},
    {'name': 'Rating', 'type': 'number', 'options': {'precision': 0}},
    {'name': 'Session ID', 'type': 'singleLineText'},
    {'name': 'Data analizy', 'type': 'date', 'options': {'dateFormat': {'name': 'european'}}},
]

for field in fields_to_create:
    body = json.dumps(field).encode()
    req = urllib.request.Request(
        f'https://api.airtable.com/v0/meta/bases/{base_id}/tables/{table_id}/fields',
        data=body,
        headers={
            'Authorization': f'Bearer {pat}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f'Created: {result[\"name\"]} -> {result[\"id\"]}')
    except Exception as e:
        print(f'Error creating {field[\"name\"]}: {e}')
"
```

Expected: 4 new fields created. Save the field IDs for use in later tasks.

- [ ] **Step 3: Commit field ID mapping**

Save the new field IDs to a reference file:

```bash
# After getting IDs from Step 2, update CLAUDE.md with new field IDs
# Add to the "Known field IDs" section under Airtable CRM
```

---

### Task 2: Create "Prompt Historia" table in Airtable

**Context:** A new table to store prompt versions with full history and rollback capability.

- [ ] **Step 1: Create table via Airtable API**

```bash
python3 -c "
import urllib.request, json

pat = '<<AIRTABLE_PAT_FROM_ENV>>'
base_id = 'appUoXROWqjxiwjrT'

table_spec = {
    'name': 'Prompt Historia',
    'fields': [
        {'name': 'Data', 'type': 'date', 'options': {'dateFormat': {'name': 'european'}}},
        {'name': 'Prompt', 'type': 'multilineText'},
        {'name': 'Zmiany', 'type': 'multilineText'},
        {'name': 'Powód', 'type': 'multilineText'},
        {'name': 'Status', 'type': 'singleSelect', 'options': {'choices': [
            {'name': 'Draft', 'color': 'yellowBright'},
            {'name': 'Aktywny', 'color': 'greenBright'},
            {'name': 'Wycofany', 'color': 'grayBright'}
        ]}},
        {'name': 'Rozmowy analizowane', 'type': 'number', 'options': {'precision': 0}},
        {'name': 'Średni rating', 'type': 'number', 'options': {'precision': 2}},
    ]
}

body = json.dumps(table_spec).encode()
req = urllib.request.Request(
    f'https://api.airtable.com/v0/meta/bases/{base_id}/tables',
    data=body,
    headers={
        'Authorization': f'Bearer {pat}',
        'Content-Type': 'application/json'
    },
    method='POST'
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(f'Table created: {result[\"id\"]}')
for f in result['fields']:
    print(f'  {f[\"name\"]} -> {f[\"id\"]}')
"
```

Expected: New table "Prompt Historia" with all fields. Save table ID and field IDs.

- [ ] **Step 2: Seed the first prompt version (v1 = current prompt + adaptation rules)**

This requires extracting the current system prompt from the n8n "Chat AI" workflow's "Przygotuj prompt" Code node, then appending the adaptation rules from the spec (Section 5), and inserting as the first row with Status = "Aktywny".

```bash
python3 -c "
import urllib.request, json

# 1. Fetch current prompt from n8n workflow
n8n_key = '<<N8N_API_KEY_FROM_ENV>>'
req = urllib.request.Request(
    'https://n8n.kaban.click/api/v1/workflows/Km52Gx1aoEJvcXba',
    headers={'X-N8N-API-KEY': n8n_key}
)
resp = urllib.request.urlopen(req)
workflow = json.loads(resp.read())

# Find 'Przygotuj prompt' node and extract its JS code
for node in workflow['nodes']:
    if node['name'] == 'Przygotuj prompt':
        code = node['parameters'].get('jsCode', '')
        print('=== CURRENT PROMPT CODE (first 2000 chars) ===')
        print(code[:2000])
        break
"
```

After reviewing the current prompt, create the v1 entry in Prompt Historia with the full prompt text + adaptation rules appended. The adaptation rules to append are defined in the spec Section 5.1.

- [ ] **Step 3: Insert v1 prompt into Prompt Historia**

```bash
python3 -c "
import urllib.request, json, datetime

pat = '<<AIRTABLE_PAT_FROM_ENV>>'

# ADAPTATION_RULES is the text from spec Section 5.1 formatted for the system prompt
ADAPTATION_RULES = '''

## ADAPTACJA DO ROZMÓWCY

Rozpoznaj typ klienta po pierwszych 2-3 wiadomościach i dostosuj podejście:

EMOCJONALNY (sygnały: długie wiadomości, słowa bólu/straty jak \"nie mogę\", \"strata\", \"ból\", \"śmierć\", \"tragedia\", wykrzykniki, wielokropki):
→ Wolniejsze tempo. Waliduj emocje przed pytaniami (\"rozumiem jak trudna to sytuacja\"). Nie pytaj o szczegóły od razu.

RZECZOWY (sygnały: krótkie wiadomości <20 słów, podaje fakty — daty, kwoty, typ wypadku, brak emocji):
→ Szybciej do sedna. Pomiń pytania na które już odpowiedział. Bardziej konkretny język.

SCEPTYCZNY (sygnały: pytania o koszty, \"czy to darmowe?\", \"dlaczego miałbym\", \"nie wierzę\", \"a jakie macie doświadczenie\"):
→ Social proof (\"ponad 500 wygranych spraw\", konkretne kwoty wygranych). Transparentność kosztów (\"płacisz tylko za sukces\"). Nie naciskaj na telefon zbyt wcześnie.

OBCOJĘZYCZNY (sygnały: krótkie zdania, błędy gramatyczne, mieszanka języków, lang != \"pl\"):
→ Prostsze słownictwo. Krótsze zdania. Potwierdzaj zrozumienie (\"czy dobrze rozumiem — ...?\"). Brak idiomów.

SZCZEGÓŁOWY (sygnały: pierwsza wiadomość >50 słów z typem wypadku + obrażeniami + datą + okolicznościami):
→ Podsumuj co już wiesz (\"Rozumiem — wypadek komunikacyjny z dnia X, obrażenia Y\"). Przejdź do brakujących informacji. Pomiń pytania już odpowiedziane.
'''

# Get current prompt from Step 2 output, append adaptation rules
# CURRENT_PROMPT should be replaced with the actual extracted prompt text
CURRENT_PROMPT = '<<PASTE_CURRENT_PROMPT_HERE>>'

full_prompt = CURRENT_PROMPT + ADAPTATION_RULES

# Insert into Prompt Historia
# Replace TABLE_ID and field names with actual values from Step 1 of this task
body = json.dumps({
    'fields': {
        'Data': datetime.date.today().isoformat(),
        'Prompt': full_prompt,
        'Zmiany': 'Wersja początkowa: obecny prompt + reguły adaptacji do typu klienta',
        'Powód': 'Inicjalizacja systemu Prompt Evolution',
        'Status': 'Aktywny',
        'Rozmowy analizowane': 0,
    },
    'typecast': True
}).encode()

req = urllib.request.Request(
    f'https://api.airtable.com/v0/appUoXROWqjxiwjrT/<<PROMPT_HISTORIA_TABLE_ID>>',
    data=body,
    headers={
        'Authorization': f'Bearer {pat}',
        'Content-Type': 'application/json'
    },
    method='POST'
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(f'Created prompt v1: {result[\"id\"]}')
"
```

---

### Task 3: Modify n8n "Chat AI" workflow — add transcript + session_id saving, dynamic prompt fetch

**Context:** The existing workflow needs 3 changes:
1. "Przygotuj prompt" node: fetch active prompt from Airtable "Prompt Historia" instead of hardcoded prompt, with fallback
2. "Zapisz lead" node: add `Transkrypt` and `Session ID` fields to the Airtable create request
3. No new nodes needed — modifications to existing ones

**Files:** n8n workflow `Km52Gx1aoEJvcXba` (modified via API)

- [ ] **Step 1: Fetch the full workflow JSON**

```bash
python3 -c "
import urllib.request, json

n8n_key = '<<N8N_API_KEY_FROM_ENV>>'
req = urllib.request.Request(
    'https://n8n.kaban.click/api/v1/workflows/Km52Gx1aoEJvcXba',
    headers={'X-N8N-API-KEY': n8n_key}
)
resp = urllib.request.urlopen(req)
workflow = json.loads(resp.read())

# Save full workflow for backup
with open('/tmp/chat-ai-workflow-backup.json', 'w') as f:
    json.dump(workflow, f, indent=2)
print('Backup saved to /tmp/chat-ai-workflow-backup.json')

# Show current node code for reference
for node in workflow['nodes']:
    if node['name'] in ['Przygotuj prompt', 'Zapisz lead', 'Odpowiedz - zapisano']:
        print(f'\\n=== {node[\"name\"]} ===')
        if 'jsCode' in node.get('parameters', {}):
            print(node['parameters']['jsCode'][:1500])
        else:
            print(json.dumps(node['parameters'], indent=2)[:1500])
"
```

Expected: Backup saved + current code of key nodes printed for review.

- [ ] **Step 2: Modify "Przygotuj prompt" node — add dynamic prompt fetch + fallback**

Read the current "Przygotuj prompt" code from the backup. Modify it to:
1. First, fetch the active prompt from Airtable "Prompt Historia" (Status = "Aktywny", sort by Data desc, limit 1)
2. If fetch succeeds, use the fetched prompt text as the system prompt
3. If fetch fails (timeout, error, no active record), use the existing hardcoded prompt as fallback
4. Append conversation context (lang, page_url) as before

The Code node in n8n can make HTTP requests using `$http` or inline `fetch`. Since n8n Code nodes support `await`, use:

```javascript
// At the top of the existing Przygotuj prompt Code node:
const AIRTABLE_PAT = '<<PAT>>';
const PROMPT_HISTORIA_TABLE = '<<TABLE_ID>>';
const PROMPT_FIELD = '<<PROMPT_FIELD_ID>>';
const STATUS_FIELD = '<<STATUS_FIELD_ID>>';

let systemPrompt = null;

// Try to fetch active prompt from Airtable
try {
    const url = `https://api.airtable.com/v0/appUoXROWqjxiwjrT/${PROMPT_HISTORIA_TABLE}?filterByFormula={${STATUS_FIELD}}='Aktywny'&sort[0][field]=Data&sort[0][direction]=desc&maxRecords=1`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` },
        signal: AbortSignal.timeout(3000)
    });
    const data = await response.json();
    if (data.records && data.records.length > 0) {
        systemPrompt = data.records[0].fields[PROMPT_FIELD] || data.records[0].fields['Prompt'];
    }
} catch (e) {
    // Fallback to hardcoded prompt
}

if (!systemPrompt) {
    systemPrompt = `<<EXISTING_HARDCODED_PROMPT>>`;
}

// Rest of existing code continues here, using systemPrompt variable...
```

Update the workflow via n8n API PUT.

- [ ] **Step 3: Modify "Zapisz lead" node — add Transkrypt and Session ID fields**

The "Zapisz lead" node is an httpRequest to Airtable. Its body template needs two new fields added.

Look at the current body template. It builds a JSON with `fields: { fldXXX: value, ... }`. Add:
- `<<TRANSKRYPT_FIELD_ID>>: JSON.stringify($json.history).slice(0, 80000)` — full transcript as JSON string, truncated to 80k chars
- `<<SESSION_ID_FIELD_ID>>: $json.sessionId` — session UUID

Update via n8n API PUT.

- [ ] **Step 4: Verify the workflow update**

```bash
python3 -c "
import urllib.request, json

n8n_key = '<<N8N_KEY>>'
req = urllib.request.Request(
    'https://n8n.kaban.click/api/v1/workflows/Km52Gx1aoEJvcXba',
    headers={'X-N8N-API-KEY': n8n_key}
)
resp = urllib.request.urlopen(req)
workflow = json.loads(resp.read())

for node in workflow['nodes']:
    if node['name'] == 'Przygotuj prompt':
        code = node['parameters'].get('jsCode', '')
        has_airtable = 'Prompt Historia' in code or 'PROMPT_HISTORIA' in code or 'Aktywny' in code
        print(f'Przygotuj prompt: has Airtable fetch = {has_airtable}')
    if node['name'] == 'Zapisz lead':
        params = json.dumps(node['parameters'])
        has_transcript = 'Transkrypt' in params or 'transkrypt' in params.lower() or '<<TRANSKRYPT_FIELD_ID>>' in params
        has_session = 'Session ID' in params or 'sessionId' in params or '<<SESSION_ID_FIELD_ID>>' in params
        print(f'Zapisz lead: has Transkrypt = {has_transcript}, has Session ID = {has_session}')

print(f'Workflow active: {workflow[\"active\"]}')
"
```

Expected: Both modifications confirmed present.

- [ ] **Step 5: Test end-to-end — send test chat message and verify transcript saved**

Open https://szkody.vercel.app, use the chat widget, have a short conversation (2-3 messages), provide test name/phone. Then check Airtable — the new lead should have `Transkrypt` (JSON array), `Session ID` (UUID), and the prompt used should be v1 from Prompt Historia.

- [ ] **Step 6: Commit backup files**

```bash
git add n8n/chat-ai-workflow-backup.json
git commit -m "chore: backup Chat AI workflow before evolution changes"
```

---

## Phase 2: Rating Widget

### Task 4: Add rating UI to chat widget

**Files:**
- Modify: `js/chat-widget.js` (add rating bar after lead_saved)
- Modify: `css/chat-widget.css` (add rating styles)
- Modify: `lang/en.json` (add chat.rate_question, chat.rate_thanks)
- Modify: `lang/ua.json` (add chat.rate_question, chat.rate_thanks)

- [ ] **Step 1: Add rating CSS styles to chat-widget.css**

Add at the end of `css/chat-widget.css`:

```css
/* Rating bar */
.chat-rating {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 0;
}

.chat-rating-question {
    font-size: 12px;
    color: #6b7280;
}

.chat-rating-btn {
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s, border-color 0.2s;
}

.chat-rating-btn:hover {
    background: #f5f5f5;
    border-color: #29ABE2;
}

.chat-rating-btn:focus-visible {
    outline: 2px solid #29ABE2;
    outline-offset: 2px;
}

.chat-rating-btn.selected {
    background: #29ABE2;
    border-color: #29ABE2;
}

.chat-rating-thanks {
    font-size: 12px;
    color: #6b7280;
    text-align: center;
    padding: 4px 0;
}
```

- [ ] **Step 2: Add rating logic to chat-widget.js**

In `js/chat-widget.js`, add these changes:

1. Add a new constant at the top (after `MAX_HISTORY`):
```javascript
var RATING_WEBHOOK = 'https://n8n.kaban.click/webhook/szkody-chat-rating';
var RATING_KEY = SESSION_KEY + '_rated';
```

2. Add a `showRating()` function inside `createWidget()` (after the `addMessage` function):
```javascript
function showRating() {
    if (sessionStorage.getItem(RATING_KEY)) return;

    var lang = getLang();
    var questions = {
        pl: 'Czy rozmowa była pomocna?',
        en: 'Was this conversation helpful?',
        ua: 'Чи була ця розмова корисною?'
    };
    var thanks = {
        pl: 'Dziękujemy za opinię',
        en: 'Thank you for your feedback',
        ua: 'Дякуємо за відгук'
    };

    var ratingDiv = document.createElement('div');
    ratingDiv.className = 'chat-rating';
    ratingDiv.innerHTML =
        '<span class="chat-rating-question" data-i18n="chat.rate_question">' + (questions[lang] || questions.pl) + '</span>' +
        '<button class="chat-rating-btn" data-rating="1" aria-label="Thumbs up">👍</button>' +
        '<button class="chat-rating-btn" data-rating="-1" aria-label="Thumbs down">👎</button>';

    messagesEl.appendChild(ratingDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    ratingDiv.querySelectorAll('.chat-rating-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var rating = parseInt(btn.getAttribute('data-rating'));
            btn.classList.add('selected');
            ratingDiv.innerHTML = '<span class="chat-rating-thanks" data-i18n="chat.rate_thanks">' + (thanks[lang] || thanks.pl) + '</span>';
            sessionStorage.setItem(RATING_KEY, '1');
            if (typeof window.i18nApply === 'function') window.i18nApply();

            fetch(RATING_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, rating: rating })
            }).catch(function () { /* fire and forget */ });
        });
    });

    if (typeof window.i18nApply === 'function') window.i18nApply();
}
```

3. In the `lead_saved` handler (after `addMessage('system', ...)`), add:
```javascript
setTimeout(function () { showRating(); }, 1000);
```

- [ ] **Step 3: Also fix the placeholder phone number in error message**

In `chat-widget.js` line 204, replace `+48 XXX XXX XXX` with `61 893 75 04`.

- [ ] **Step 4: Add i18n keys to lang/en.json and lang/ua.json**

Add to `lang/en.json`:
```json
"chat.rate_question": "Was this conversation helpful?",
"chat.rate_thanks": "Thank you for your feedback",
```

Add to `lang/ua.json`:
```json
"chat.rate_question": "Чи була ця розмова корисною?",
"chat.rate_thanks": "Дякуємо за відгук",
```

- [ ] **Step 5: Commit**

```bash
git add js/chat-widget.js css/chat-widget.css lang/en.json lang/ua.json
git commit -m "feat: add thumbs up/down rating to chat widget after lead saved"
```

---

### Task 5: Create n8n "Szkody - Chat Rating" workflow

**Context:** New workflow: Webhook POST → find lead by Session ID → update Rating field.

- [ ] **Step 1: Create the workflow via n8n API**

```bash
python3 -c "
import urllib.request, json

n8n_key = '<<N8N_KEY>>'

workflow = {
    'name': 'Szkody - Chat Rating',
    'nodes': [
        {
            'parameters': {
                'httpMethod': 'POST',
                'path': 'szkody-chat-rating',
                'responseMode': 'responseNode',
                'options': {}
            },
            'name': 'Webhook',
            'type': 'n8n-nodes-base.webhook',
            'typeVersion': 2,
            'position': [250, 300]
        },
        {
            'parameters': {
                'jsCode': '''
// Validate input
const body = \$input.first().json.body || \$input.first().json;
const sessionId = body.session_id;
const rating = body.rating;

if (!sessionId || (rating !== 1 && rating !== -1)) {
    return [{ json: { error: 'Invalid input', status: 400 } }];
}

return [{ json: { sessionId, rating } }];
'''
            },
            'name': 'Walidacja',
            'type': 'n8n-nodes-base.code',
            'typeVersion': 2,
            'position': [470, 300]
        },
        {
            'parameters': {
                'method': 'GET',
                'url': '=https://api.airtable.com/v0/appUoXROWqjxiwjrT/tbl2PKbbli14WgqYo?filterByFormula={<<SESSION_ID_FIELD_ID>>}=\"{{ \$json.sessionId }}\"&maxRecords=1',
                'authentication': 'genericCredentialType',
                'genericAuthType': 'httpHeaderAuth',
                'options': {}
            },
            'name': 'Szukaj leada',
            'type': 'n8n-nodes-base.httpRequest',
            'typeVersion': 4.2,
            'position': [690, 300],
            'credentials': { 'httpHeaderAuth': { 'id': '<<AIRTABLE_CREDENTIAL_ID>>', 'name': 'Airtable PAT' } }
        },
        {
            'parameters': {
                'jsCode': '''
const records = \$input.first().json.records || [];
if (records.length === 0) {
    return [{ json: { error: 'Lead not found', status: 404 } }];
}
const recordId = records[0].id;
const rating = \$('Walidacja').first().json.rating;
return [{ json: { recordId, rating } }];
'''
            },
            'name': 'Przygotuj update',
            'type': 'n8n-nodes-base.code',
            'typeVersion': 2,
            'position': [910, 300]
        },
        {
            'parameters': {
                'method': 'PATCH',
                'url': '=https://api.airtable.com/v0/appUoXROWqjxiwjrT/tbl2PKbbli14WgqYo/{{ \$json.recordId }}',
                'authentication': 'genericCredentialType',
                'genericAuthType': 'httpHeaderAuth',
                'sendBody': True,
                'specifyBody': 'json',
                'jsonBody': '={{ JSON.stringify({ fields: { \"<<RATING_FIELD_ID>>\": \$json.rating } }) }}',
                'options': {}
            },
            'name': 'Zapisz rating',
            'type': 'n8n-nodes-base.httpRequest',
            'typeVersion': 4.2,
            'position': [1130, 300],
            'credentials': { 'httpHeaderAuth': { 'id': '<<AIRTABLE_CREDENTIAL_ID>>', 'name': 'Airtable PAT' } }
        },
        {
            'parameters': {
                'respondWith': 'json',
                'responseBody': '={\"status\": \"ok\"}'
            },
            'name': 'Odpowiedz',
            'type': 'n8n-nodes-base.respondToWebhook',
            'typeVersion': 1.1,
            'position': [1350, 300]
        }
    ],
    'connections': {
        'Webhook': { 'main': [[{ 'node': 'Walidacja', 'type': 'main', 'index': 0 }]] },
        'Walidacja': { 'main': [[{ 'node': 'Szukaj leada', 'type': 'main', 'index': 0 }]] },
        'Szukaj leada': { 'main': [[{ 'node': 'Przygotuj update', 'type': 'main', 'index': 0 }]] },
        'Przygotuj update': { 'main': [[{ 'node': 'Zapisz rating', 'type': 'main', 'index': 0 }]] },
        'Zapisz rating': { 'main': [[{ 'node': 'Odpowiedz', 'type': 'main', 'index': 0 }]] }
    },
    'settings': { 'executionOrder': 'v1' },
    'active': True
}

body = json.dumps(workflow).encode()
req = urllib.request.Request(
    'https://n8n.kaban.click/api/v1/workflows',
    data=body,
    headers={
        'X-N8N-API-KEY': n8n_key,
        'Content-Type': 'application/json'
    },
    method='POST'
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(f'Workflow created: {result[\"id\"]} | active: {result[\"active\"]}')
"
```

**Note:** Replace `<<SESSION_ID_FIELD_ID>>`, `<<RATING_FIELD_ID>>`, and `<<AIRTABLE_CREDENTIAL_ID>>` with actual values from Task 1 and from the existing workflow's credential references.

- [ ] **Step 2: Activate the workflow**

If not already active, activate via API:
```bash
python3 -c "
import urllib.request, json
# PATCH workflow to set active=true if needed
"
```

- [ ] **Step 3: Test the rating webhook**

```bash
curl -X POST https://n8n.kaban.click/webhook/szkody-chat-rating \
  -H 'Content-Type: application/json' \
  -d '{"session_id": "<<TEST_SESSION_ID>>", "rating": 1}'
```

Expected: `{"status": "ok"}` and Rating field updated in Airtable.

- [ ] **Step 4: Save workflow backup**

```bash
# Export the new workflow JSON to n8n/ folder for version control
python3 -c "
import urllib.request, json
# Fetch and save to n8n/chat-rating-workflow.json
"
git add n8n/chat-rating-workflow.json
git commit -m "feat: add Chat Rating n8n workflow — saves thumbs up/down to Airtable"
```

---

## Phase 3: Conversation Analysis

### Task 6: Create n8n "Szkody - Analiza Rozmów" workflow

**Context:** On-demand workflow that reads transcripts from Airtable, sends them to GPT-4o for pattern analysis, generates a report email with prompt change proposals, and saves a Draft to Prompt Historia.

This is the most complex workflow. Nodes:
1. Manual Trigger + Webhook GET (with token auth)
2. Code: validate token (if webhook)
3. Airtable: fetch leads where `Data analizy` is empty AND `Transkrypt` is not empty
4. Code: chunk transcripts (max 10 per batch), prepare analysis prompt
5. OpenAI (httpRequest): send analysis prompt
6. Code: format HTML report + prompt diff
7. Airtable: create Draft in Prompt Historia
8. Airtable: batch update analyzed leads (set Data analizy = today)
9. Gmail: send report email with action buttons

- [ ] **Step 1: Design the analysis prompt**

The GPT-4o analysis prompt should be saved as a reference file. Create `n8n/analysis-prompt-template.md`:

```markdown
Jesteś ekspertem od analizy konwersacji chatbota kancelarii odszkodowawczej.

Przeanalizuj poniższe {N} rozmów z chatbotem. Dla każdej rozmowy podaję:
- Transkrypt (JSON: role + content)
- Rating klienta (1 = pozytywny, -1 = negatywny, null = brak)
- Status leada (Nowy/Kontakt/Umowa/Brak kontaktu/Odrzucony)
- Typ sprawy

ZADANIA:
1. KORELACJA RATING ↔ ZACHOWANIE: Co bot robił inaczej w rozmowach z 👍 vs 👎?
2. KORELACJA KONWERSJA ↔ PODEJŚCIE: Czym różniły się rozmowy zakończone kontaktem od porzuconych?
3. BRAKUJĄCA WIEDZA: Jakie pytania klientów bot nie umiał odpowiedzieć?
4. MOMENTY PORZUCENIA: W którym punkcie rozmowy klienci przestawali pisać?
5. ADAPTACJA: Czy bot poprawnie rozpoznawał typy klientów i dostosowywał ton?
6. PROPOZYCJE ZMIAN: Co konkretnie dodać/zmienić/usunąć w system prompcie bota?

AKTUALNY SYSTEM PROMPT BOTA:
{current_prompt}

ROZMOWY:
{conversations_json}

Odpowiedz w formacie JSON:
{
  "wyniki": { "pozytywne": N, "negatywne": N, "brak_ratingu": N, "konwersja_procent": N },
  "wzorce": ["wzorzec 1", "wzorzec 2", "wzorzec 3"],
  "brakujaca_wiedza": ["pytanie 1", "pytanie 2"],
  "propozycje_zmian": ["zmiana 1", "zmiana 2", "zmiana 3"],
  "nowy_prompt": "pełna treść proponowanego nowego system promptu (max 2000 słów)"
}
```

- [ ] **Step 2: Create the workflow via n8n API**

This is a large workflow. Build it node by node, with proper connections. Key implementation details:

- Token auth: `$json.query.token === process.env.ANALYSIS_SECRET` (set env var in n8n)
- Chunking: if >10 transcripts, loop with SplitInBatches node
- GPT-4o call via httpRequest to OpenAI API (use existing pattern from Chat AI workflow)
- Email: reuse HTML template style from lead-email-notification-workflow.json

Due to workflow complexity, create nodes individually and connect them. The workflow JSON will be ~200 lines.

- [ ] **Step 3: Test with manual trigger**

Trigger the workflow manually in n8n. Check:
- Airtable records with transcripts are fetched
- GPT-4o returns valid analysis JSON
- Draft created in Prompt Historia
- Email sent with correct report + action buttons
- Analyzed leads marked with today's date

- [ ] **Step 4: Save workflow backup and commit**

```bash
git add n8n/analysis-workflow.json n8n/analysis-prompt-template.md
git commit -m "feat: add Analiza Rozmów n8n workflow — on-demand conversation analysis with GPT-4o"
```

---

## Phase 4: Prompt Update (Approval from Email)

### Task 7: Create n8n "Szkody - Prompt Update" workflow

**Context:** Webhook workflow triggered by email action buttons. Validates token, then either approves (activates Draft, deactivates previous Aktywny) or rejects (marks Draft as Wycofany).

Nodes:
1. Webhook GET with path `szkody-prompt-update`
2. Code: validate token + parse action/version params
3. Switch: route by action (approve / reject)
4. Approve path: Airtable search for current Aktywny → PATCH to Wycofany → PATCH Draft to Aktywny
5. Reject path: Airtable PATCH Draft to Wycofany
6. Respond: HTML confirmation page (styled like lead-action workflow)

- [ ] **Step 1: Create the workflow via n8n API**

Pattern from existing "Szkody - Lead Action" workflow — similar structure (GET webhook → validate → switch → Airtable PATCH → HTML response).

- [ ] **Step 2: Test approve flow**

Create a test Draft in Prompt Historia. Hit webhook with `?token=SECRET&action=approve&version=N`. Verify:
- Previous Aktywny → Wycofany
- Draft → Aktywny
- HTML confirmation page renders

- [ ] **Step 3: Test reject flow**

Hit webhook with `?action=reject&version=N`. Verify Draft → Wycofany.

- [ ] **Step 4: Test rollback**

Change an old Wycofany record back to Aktywny manually in Airtable. Send a test chat message. Verify the old prompt is used.

- [ ] **Step 5: Save workflow backup and commit**

```bash
git add n8n/prompt-update-workflow.json
git commit -m "feat: add Prompt Update n8n workflow — approve/reject prompt changes from email"
```

---

### Task 8: Update CLAUDE.md documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add Chat Evolution section to CLAUDE.md**

Add documentation about:
- New Airtable fields (Transkrypt, Rating, Session ID, Data analizy)
- New table "Prompt Historia" with table ID and field IDs
- New webhooks (chat-rating, analyze, prompt-update)
- New n8n workflows (Chat Rating, Analiza Rozmów, Prompt Update)
- How to trigger analysis (manual in n8n or GET webhook with token)
- How to rollback a prompt (change Status in Airtable)

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Chat AI Evolution system documentation to CLAUDE.md"
```

---

### Task 9: Final integration test

- [ ] **Step 1: Full end-to-end test**

1. Open https://szkody.vercel.app
2. Start a chat conversation with emotional tone ("Mój ojciec zmarł w wypadku, nie wiem co robić...")
3. Verify bot adapts tone (empathetic, slower)
4. Provide name + phone to trigger lead save
5. Verify "Dane przekazane" message appears
6. Verify rating bar appears after 1 second
7. Click thumbs up
8. Verify "Dziękujemy za opinię" appears
9. Check Airtable: Transkrypt filled, Session ID filled, Rating = 1
10. Trigger analysis workflow (manual or webhook)
11. Check email for analysis report
12. Click "Zatwierdź" in email
13. Verify Prompt Historia: v1 = Wycofany, v2 = Aktywny
14. Send another chat message — verify new prompt is used

- [ ] **Step 2: Push all changes to production**

```bash
git push origin master
```

Wait for Vercel deploy. Verify live site works.
