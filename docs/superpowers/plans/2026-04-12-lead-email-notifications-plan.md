# Lead Email Notifications — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an n8n workflow JSON file ready to import that sends Gmail notifications when new leads appear in Airtable CRM.

**Architecture:** Standalone n8n workflow with 3 nodes: Airtable Trigger (polling every 1 min) → Code node (format email, handle batch) → Gmail node (send with retry). Deliverable is a JSON file for n8n import + configuration instructions.

**Tech Stack:** n8n workflow JSON, Airtable Trigger, Gmail node, JavaScript (Code node)

**Spec:** `docs/superpowers/specs/2026-04-12-lead-email-notifications-design.md`

---

### File Structure

| Action | Path | Purpose |
|--------|------|---------|
| Create | `n8n/lead-email-notification-workflow.json` | n8n workflow JSON — ready to import |
| Update | `CLAUDE.md` | Add workflow reference to CRM Integration section |

---

### Task 1: Create n8n workflow JSON

**Files:**
- Create: `n8n/lead-email-notification-workflow.json`

- [ ] **Step 1: Create `n8n/` directory and workflow JSON file**

Create the complete n8n workflow JSON with 3 nodes:

**Node 1 — Airtable Trigger:**
```json
{
  "parameters": {
    "pollTimes": { "item": [{ "mode": "everyMinute" }] },
    "event": "newRecord",
    "baseId": "appUoXROWqjxiwjrT",
    "tableId": "tbl2PKbbli14WgqYo"
  },
  "type": "n8n-nodes-base.airtableTrigger",
  "name": "Nowy Lead w Airtable"
}
```

**Node 2 — Code node "Formatuj Email":**
JavaScript code from spec — iterates `$input.all()`, extracts fields, builds plain text email body, returns `{ subject, body, recipientEmail }` per record. Includes empty-fields guard with console warning.

Include commented field ID mapping fallback in the Code node for when Airtable Trigger returns field IDs instead of names:
```javascript
// FALLBACK: jeśli trigger zwraca field IDs zamiast nazw, odkomentuj poniższe i zakomentuj oryginalne
// const FIELD_MAP = {
//   'fldXXX1': 'Imię',
//   'fldXXX2': 'Telefon',
//   'fldXXX3': 'Email',
//   'fldXXX4': 'Typ zdarzenia',
//   'fldXXX5': 'Kwalifikacja',
//   'fldXXX6': 'Kanał źródłowy',
//   'fldXXX7': 'Notatki',
//   'fldXXX8': 'Data utworzenia',
// };
// Zamień fldXXX na faktyczne ID z outputu Airtable Trigger, potem:
// const get = (key) => record[FIELD_MAP[key]] || record[key] || 'Brak';
```

**Node 3 — Gmail (send):**
```json
{
  "parameters": {
    "sendTo": "={{ $json.recipientEmail }}",
    "subject": "={{ $json.subject }}",
    "message": "={{ $json.body }}",
    "options": {}
  },
  "type": "n8n-nodes-base.gmail",
  "name": "Wyślij Email",
  "retryOnFail": true,
  "maxTries": 3
}
```

The JSON must include:
- Correct `connections` wiring: Trigger → Code → Gmail
- Node positions for clean layout
- Workflow `name`: "Szkody - Powiadomienie Email o Leadzie"
- `active: false` (deploy as inactive per spec)

- [ ] **Step 2: Validate JSON is parseable**

Run:
```bash
node -e "const w = require('./n8n/lead-email-notification-workflow.json'); console.log('OK:', w.name, '— nodes:', w.nodes.length)"
```
Expected: `OK: Szkody - Powiadomienie Email o Leadzie — nodes: 3`

- [ ] **Step 3: Commit**

```bash
git add n8n/lead-email-notification-workflow.json
git commit -m "feat: add n8n workflow JSON for lead email notifications"
```

---

### Task 2: Update CLAUDE.md with workflow reference

**Files:**
- Modify: `CLAUDE.md` — CRM Integration section

- [ ] **Step 1: Add workflow entry to CRM section**

In `CLAUDE.md`, under `## CRM Integration (Airtable + n8n)`, add a new `### n8n Workflows` subsection (separate from webhooks — this is a polling trigger, not a webhook):

```markdown
- **Lead Email Notification workflow** — Airtable Trigger (polling "Leady" every 1 min) → Code (format) → Gmail. JSON: `n8n/lead-email-notification-workflow.json`. Import in n8n → configure Gmail credentials + recipient email → activate.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add lead email notification workflow reference to CLAUDE.md"
```

---

### Task 3: Post-import configuration (manual — instructions for user)

These steps are performed manually in n8n UI after importing the JSON. No code changes needed.

- [ ] **Step 1: Import workflow in n8n**

n8n UI → Workflows → Import from File → select `n8n/lead-email-notification-workflow.json`

- [ ] **Step 2: Configure Airtable credentials**

Click "Nowy Lead w Airtable" node → Credential → select existing Airtable credential (same one used by "Szkody - Formularz" workflow). If none exists, create new: Settings → Credentials → Airtable → Personal Access Token.

- [ ] **Step 3: Configure Gmail credentials**

Click "Wyślij Email" node → Credential → create new Gmail OAuth2 credential:
1. n8n Settings → Credentials → Gmail OAuth2
2. Follow OAuth flow — authorize with your Google account
3. Select the credential in the Gmail node

- [ ] **Step 4: Replace placeholder email**

In "Formatuj Email" Code node (node 2), replace `'TWÓJ_EMAIL@gmail.com'` with your actual email address.

- [ ] **Step 5: Test workflow**

1. In n8n, click "Test Workflow"
2. Add a test record in Airtable "Leady" table manually
3. Check the Code node output — verify field names vs field IDs
4. Check your inbox — verify email arrived with correct data
5. If field names are IDs (`fldXXX`), update the Code node field mappings

- [ ] **Step 6: Activate workflow**

Toggle workflow to Active. Verify by adding another test lead — email should arrive within ~1 minute.
