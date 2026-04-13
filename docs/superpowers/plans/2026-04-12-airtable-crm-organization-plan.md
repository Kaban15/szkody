# Airtable CRM Organization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organize the Airtable "Leady" table with a lead pipeline, auto-scoring, email action buttons, and daily follow-up reminders — all via n8n workflows and Airtable configuration.

**Architecture:** Polling-based n8n workflows operate on Airtable data. No website code changes. Two new workflows (Lead Action webhook, Follow-up Reminder cron) plus modifications to two existing workflows (Form scoring, Email notification buttons). Airtable gets new fields (Priorytet, Data follow-up) and Status values.

**Tech Stack:** Airtable (CRM), n8n (automation), Gmail (notifications)

**Spec:** `docs/superpowers/specs/2026-04-12-airtable-crm-organization-design.md`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `n8n/lead-email-notification-workflow.json` | Modify | Add action buttons (links) to email HTML |
| `n8n/lead-action-workflow.json` | Create | New workflow: webhook handles button clicks → Airtable status update |
| `n8n/follow-up-reminder-workflow.json` | Create | New workflow: daily cron → find forgotten leads → summary email |
| `CLAUDE.md` | Modify | Document new workflows, fields, views, pipeline |

**Manual steps (not files):**
- Airtable: add Status values, Priorytet field, Data follow-up field
- Airtable: create 4 views (Pipeline Kanban, Wszystkie leady, Nowe dziś, Zapomniane)
- n8n: add scoring Code node to "Szkody - Formularz" workflow (manual in n8n UI)
- n8n: add scoring Code node to "Szkody - Chat AI" workflow (manual in n8n UI)

---

## Task 1: Airtable Field Setup (manual instructions)

**Files:**
- Create: `docs/airtable-setup-instructions.md` (step-by-step guide for Airtable UI)

- [ ] **Step 1: Write Airtable setup instructions**

Create `docs/airtable-setup-instructions.md` with exact steps:

```markdown
# Airtable CRM Setup — Instrukcja

## 1. Pole "Status" — dodaj wartości Single Select

Otwórz tabelę "Leady" → kliknij nagłówek kolumny "Status" → Customize field.
Dodaj wartości (w tej kolejności):

| Wartość | Kolor |
|---------|-------|
| Nowy | Niebieski (blue) |
| Kontakt | Żółty (yellow) |
| Konsultacja | Pomarańczowy (orange) |
| Umowa | Zielony (green) |
| Wygrany | Ciemnozielony (teal) |
| Odrzucony | Szary (gray) |
| Brak kontaktu | Czerwony (red) |

## 2. Nowe pole "Priorytet" — Single Select

Kliknij "+" na końcu nagłówków kolumn → Single select.
Nazwa: `Priorytet`
Wartości:

| Wartość | Kolor |
|---------|-------|
| Gorący | Czerwony (red) |
| Ciepły | Żółty (yellow) |
| Zimny | Niebieski (blue) |

## 3. Nowe pole "Data follow-up" — Date

Kliknij "+" → Date.
Nazwa: `Data follow-up`
Format: European (DD/MM/YYYY)
Include time: Nie

## 4. Widok "🔥 Pipeline" — Kanban

Kliknij "+" obok zakładek widoków → Kanban.
Nazwa: `🔥 Pipeline`
Group by: Status
Ukryj kolumny: Odrzucony, Brak kontaktu
Sort w każdej kolumnie: Priorytet (ascending — Gorący first)

## 5. Widok "📋 Wszystkie leady" — Grid

Kliknij "+" → Grid.
Nazwa: `📋 Wszystkie leady`
Sort: Data utworzenia descending

## 6. Widok "⚡ Nowe dziś" — Grid

Kliknij "+" → Grid.
Nazwa: `⚡ Nowe dziś`
Filter: Status is "Nowy" AND Data utworzenia is today
Sort: Priorytet ascending (Gorący → Zimny)

## 7. Widok "💀 Zapomniane" — Grid

Kliknij "+" → Grid.
Nazwa: `💀 Zapomniane`
Filter: (Status is "Nowy" AND Data utworzenia is before 1 day ago) OR (Status is "Kontakt" AND Data utworzenia is before 7 days ago)
Sort: Data utworzenia ascending (najstarsze góra)
```

- [ ] **Step 2: Commit**

```bash
git add docs/airtable-setup-instructions.md
git commit -m "docs: add Airtable CRM setup instructions for pipeline fields and views"
```

---

## Task 2: Scoring Code (reusable snippet for n8n)

This task documents the scoring logic as a standalone Code node snippet. The user will paste it into the n8n "Szkody - Formularz" and "Szkody - Chat AI" workflows manually.

**Files:**
- Create: `n8n/scoring-code-node.js` (reference code for n8n Code node)

- [ ] **Step 1: Write the scoring Code node**

Create `n8n/scoring-code-node.js`:

```javascript
// n8n Code node: Lead Scoring
// Paste this into a Code node BEFORE the Airtable Create Record node
// in both "Szkody - Formularz" and "Szkody - Chat AI" workflows.
//
// Input: item with fields tag, event_type (from webhook data)
// Output: item with added fields: priority, status

const items = $input.all();
const results = [];

// Scoring maps
const TYPE_SCORES = {
  'komunikacyjne': 3,
  'smierc': 3,
  'Śmierć bliskiej osoby': 3,
  'praca': 2,
  'Przy pracy': 2,
  'medyczne': 2,
  'Błąd medyczny': 2,
  'rolnicze': 1,
  'Rolnicze': 1,
};

const CHANNEL_SCORES = {
  'chat-ai': 3,
  'kontakt': 2,
};

// Priority thresholds (max 6 points from 2 signals)
function getPriority(score) {
  if (score >= 5) return 'Gorący';
  if (score >= 3) return 'Ciepły';
  return 'Zimny';
}

for (const item of items) {
  const data = item.json;
  const eventType = data.event_type || '';
  const tag = data.tag || '';

  // Score: case type
  let typeScore = TYPE_SCORES[eventType] || 1;

  // Score: channel (tag)
  let channelScore = CHANNEL_SCORES[tag] || 1;
  // kontakt-* pattern (e.g. kontakt-komunikacyjne)
  if (!CHANNEL_SCORES[tag] && tag.startsWith('kontakt-')) {
    channelScore = 2;
  }

  const totalScore = typeScore + channelScore;
  const priority = getPriority(totalScore);

  // Pass through all original data + add scoring fields
  results.push({
    json: {
      ...data,
      priority: priority,
      status: 'Nowy',
      _scoring_debug: `type=${typeScore} channel=${channelScore} total=${totalScore}`,
    }
  });
}

return results;
```

- [ ] **Step 2: Commit**

```bash
git add n8n/scoring-code-node.js
git commit -m "feat: add lead scoring Code node snippet for n8n workflows"
```

---

## Task 3: Update Email Notification Workflow — Add Action Buttons

**Files:**
- Modify: `n8n/lead-email-notification-workflow.json`

- [ ] **Step 1: Read the current workflow JSON**

Read `n8n/lead-email-notification-workflow.json` to understand the current "Formatuj Email" Code node.

- [ ] **Step 2: Update the "Formatuj Email" Code node**

In the `jsCode` of the "Formatuj Email" node, add action button HTML after the summary section. The key changes:

1. Extract `recordId` from `item.json.id` (Airtable trigger provides record ID)
2. Build action button links using `https://n8n.kaban.click/webhook/szkody-lead-action?id=${recordId}&action=ACTION`
3. Append buttons HTML block to the email body

Replace the entire `jsCode` value in the "Formatuj Email" node with updated code that includes:

```javascript
// After the summary div, before closing </div></div>, add:
const WEBHOOK_BASE = 'https://n8n.kaban.click/webhook/szkody-lead-action';
const recordId = item.json.id || '';

const btnStyle = 'display:inline-block;padding:10px 18px;margin:4px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;';
const actions = recordId ? `<div style="margin-top:20px;padding-top:16px;border-top:2px solid #e5e7eb;text-align:center;">`
  + `<div style="color:#6b7280;font-size:12px;margin-bottom:8px;">AKCJE</div>`
  + `<a href="${WEBHOOK_BASE}?id=${recordId}&action=contacted" style="${btnStyle}background:#1a6b3c;color:white;">✅ Zadzwoniłem</a>`
  + `<a href="${WEBHOOK_BASE}?id=${recordId}&action=no_answer" style="${btnStyle}background:#ef4444;color:white;">❌ Nie odbiera</a>`
  + `<a href="${WEBHOOK_BASE}?id=${recordId}&action=followup" style="${btnStyle}background:#f59e0b;color:white;">📅 Follow-up jutro</a>`
  + `</div>` : '';
```

- [ ] **Step 3: Update the full jsCode in the workflow JSON**

Edit `n8n/lead-email-notification-workflow.json` — replace the `jsCode` field in the "Formatuj Email" node with the complete updated code including action buttons.

The updated code must:
- Keep all existing field mapping (F object with field IDs)
- Keep all existing row generation (addRow calls)
- Keep existing summary section
- Add `recordId` extraction from `item.json.id`
- Add action buttons HTML block after summary
- Append `actions` to the `body` string before the final `</div></div>`

- [ ] **Step 4: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('n8n/lead-email-notification-workflow.json','utf8')); console.log('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 5: Commit**

```bash
git add n8n/lead-email-notification-workflow.json
git commit -m "feat: add action buttons to lead email notification workflow"
```

---

## Task 4: Create "Lead Action" Workflow

**Files:**
- Create: `n8n/lead-action-workflow.json`

- [ ] **Step 1: Write the Lead Action workflow JSON**

Create `n8n/lead-action-workflow.json` with this structure:

**Nodes:**

1. **Webhook node** — GET `/webhook/szkody-lead-action`
   - Parameters: `id` (Airtable record ID), `action` (contacted|no_answer|followup)
   - Response mode: "responseNode" (we respond with HTML)

2. **Code node "Przygotuj dane"** — maps action → Airtable field updates
   ```javascript
   const { id, action } = $input.first().json.query;
   
   if (!id || !action) {
     return [{ json: { error: true, html: '<h2>❌ Brak wymaganych parametrów</h2>' } }];
   }
   
   const STATUS_FIELD = 'fldvigglUZz1WCh9w';
   const FOLLOWUP_FIELD = 'DATA_FOLLOWUP_FIELD_ID'; // Replace after creating field
   
   const updates = {};
   let message = '';
   
   switch (action) {
     case 'contacted':
       updates[STATUS_FIELD] = 'Kontakt';
       message = '✅ Status zmieniony na: Kontakt';
       break;
     case 'no_answer':
       updates[STATUS_FIELD] = 'Brak kontaktu';
       message = '❌ Status zmieniony na: Brak kontaktu';
       break;
     case 'followup':
       const tomorrow = new Date();
       tomorrow.setDate(tomorrow.getDate() + 1);
       updates[FOLLOWUP_FIELD] = tomorrow.toISOString().split('T')[0];
       message = '📅 Follow-up ustawiony na jutro';
       break;
     default:
       return [{ json: { error: true, html: '<h2>❌ Nieznana akcja</h2>' } }];
   }
   
   return [{ json: { id, updates, message, error: false } }];
   ```

3. **IF node "Błąd?"** — routes on `error` field

4. **Airtable Get Record "Pobierz aktualny"** — reads current record to check idempotency
   - Base: `appUoXROWqjxiwjrT`
   - Table: `tbl2PKbbli14WgqYo`
   - Record ID: `={{ $json.id }}`

5. **Code node "Sprawdź idempotentność"** — compares current vs requested state
   ```javascript
   // Idempotency check: skip update if status already matches
   const current = $input.first().json;
   const requested = $('Przygotuj dane').first().json;
   const STATUS_FIELD = 'fldvigglUZz1WCh9w';
   
   const currentStatus = (current.fields || current)[STATUS_FIELD] || '';
   const requestedStatus = requested.updates[STATUS_FIELD] || '';
   
   // If requesting a status change and it's already set — skip
   if (requestedStatus && currentStatus === requestedStatus) {
     return [{ json: { ...requested, skip: true, message: '✅ Status już ustawiony: ' + currentStatus } }];
   }
   
   return [{ json: { ...requested, skip: false } }];
   ```

6. **IF node "Już ustawiony?"** — routes on `skip` field

7. **Airtable Update Record** — updates record (only when skip=false)
   - Base: `appUoXROWqjxiwjrT`
   - Table: `tbl2PKbbli14WgqYo`
   - Record ID: `={{ $json.id }}`

8. **Code node "Strona potwierdzenia"** — generates success HTML response
   ```javascript
   const data = $('Sprawdź idempotentność').first().json;
   const message = data.message;
   const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Szkody CRM</title></head>
   <body style="font-family:'Segoe UI',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5;">
   <div style="background:white;padding:40px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px;">
   <div style="font-size:48px;margin-bottom:16px;">${message.charAt(0)}</div>
   <h2 style="color:#1a1a2e;margin:0 0 8px;">${message}</h2>
   <p style="color:#6b7280;margin:0;">Możesz zamknąć tę kartę.</p>
   </div></body></html>`;
   return [{ json: { html } }];
   ```

9. **Code node "Strona błędu"** — generates error HTML response
   ```javascript
   const errorHtml = $('Przygotuj dane').first().json.html || '<h2>❌ Wystąpił błąd</h2>';
   const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Szkody CRM — Błąd</title></head>
   <body style="font-family:'Segoe UI',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5;">
   <div style="background:white;padding:40px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);max-width:400px;">
   <div style="font-size:48px;margin-bottom:16px;">❌</div>
   ${errorHtml}
   <p style="color:#6b7280;margin:0;">Spróbuj ponownie lub skontaktuj się z administratorem.</p>
   </div></body></html>`;
   return [{ json: { html } }];
   ```

10. **Respond to Webhook** node — returns `{{ $json.html }}` as HTML

**Connections:**
```
Webhook → Przygotuj dane → IF Błąd?
  ├── true → Strona błędu → Respond to Webhook
  └── false → Pobierz aktualny → Sprawdź idempotentność → IF Już ustawiony?
                ├── true (skip) → Strona potwierdzenia → Respond to Webhook
                └── false → Airtable Update → Strona potwierdzenia → Respond to Webhook
```

- [ ] **Step 2: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('n8n/lead-action-workflow.json','utf8')); console.log('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add n8n/lead-action-workflow.json
git commit -m "feat: add Lead Action workflow for email button status updates"
```

---

## Task 5: Create "Follow-up Reminder" Workflow

**Files:**
- Create: `n8n/follow-up-reminder-workflow.json`

- [ ] **Step 1: Write the Follow-up Reminder workflow JSON**

Create `n8n/follow-up-reminder-workflow.json` with this structure:

**Nodes:**

1. **Cron Trigger** — fires daily at 8:00 AM (Europe/Warsaw timezone)

2. **Airtable Search "Nowe >24h"** — Search Records
   - Base: `appUoXROWqjxiwjrT`, Table: `tbl2PKbbli14WgqYo`
   - filterByFormula: `AND({fldvigglUZz1WCh9w}='Nowy', IS_BEFORE({fldQ2B6JLQmit8CQl}, DATEADD(NOW(), -24, 'hours')))`

3. **Airtable Search "Kontakt >7d"** — Search Records
   - filterByFormula: `AND({fldvigglUZz1WCh9w}='Kontakt', IS_BEFORE({fldQ2B6JLQmit8CQl}, DATEADD(NOW(), -7, 'days')))`

4. **Airtable Search "Follow-up dziś"** — Search Records
   - filterByFormula: `IS_SAME({DATA_FOLLOWUP_FIELD_ID}, NOW(), 'day')`

5. **Code node "Buduj email"** — merges results from all 3 searches, builds HTML
   ```javascript
   const newLeads = $('Nowe >24h').all();
   const contactLeads = $('Kontakt >7d').all();
   const followupLeads = $('Follow-up dziś').all();
   
   const total = newLeads.length + contactLeads.length + followupLeads.length;
   if (total === 0) {
     return []; // Empty = workflow stops, no email sent
   }
   
   const F = {
     name: 'fldBhCi2Mmn2DrjHj',
     phone: 'flddIaNdaLRS3Cqj1',
     caseType: 'fldFvHcaJFi5avKIJ',
     priority: 'PRIORITY_FIELD_ID', // Replace after creating field
     notes: 'fldRhukW6qHMGPtl7',
     createdAt: 'fldQ2B6JLQmit8CQl',
   };
   const WEBHOOK_BASE = 'https://n8n.kaban.click/webhook/szkody-lead-action';
   const btnStyle = 'display:inline-block;padding:6px 12px;margin:2px;border-radius:4px;text-decoration:none;font-weight:600;font-size:12px;';
   
   function formatLead(item, buttons) {
     const fields = item.json.fields || item.json;
     const get = (id) => fields[id] || '';
     const recordId = item.json.id || '';
     const name = get(F.name) || 'Brak imienia';
     const phone = get(F.phone) || 'Brak';
     const caseType = get(F.caseType) || '';
     const priority = get(F.priority) || '';
     const notes = get(F.notes) || '';
     const createdAt = get(F.createdAt) || '';
     
     let dateStr = createdAt;
     try { dateStr = new Date(createdAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }); } catch(e) {}
     
     let btns = '';
     if (recordId) {
       btns = buttons.map(b => 
         `<a href="${WEBHOOK_BASE}?id=${recordId}&action=${b.action}" style="${btnStyle}${b.style}">${b.label}</a>`
       ).join('');
     }
     
     return `<div style="padding:12px 16px;border-left:4px solid ${priority === 'Gorący' ? '#ef4444' : priority === 'Ciepły' ? '#f59e0b' : '#3b82f6'};margin-bottom:8px;background:#fafafa;border-radius:0 6px 6px 0;">`
       + `<div><strong>${name}</strong> | 📞 ${phone} | ${caseType}${priority ? ' | ' + priority : ''}</div>`
       + `<div style="color:#6b7280;font-size:12px;">Wpłynął: ${dateStr}</div>`
       + (notes ? `<div style="color:#6b7280;font-size:12px;margin-top:4px;">📝 ${notes.substring(0, 100)}${notes.length > 100 ? '...' : ''}</div>` : '')
       + (btns ? `<div style="margin-top:8px;">${btns}</div>` : '')
       + `</div>`;
   }
   
   const stdButtons = [
     { action: 'contacted', label: '✅ Zadzwoniłem', style: 'background:#1a6b3c;color:white;' },
     { action: 'no_answer', label: '❌ Nie odbiera', style: 'background:#ef4444;color:white;' },
   ];
   const followupButtons = [
     { action: 'contacted', label: '✅ Zadzwoniłem', style: 'background:#1a6b3c;color:white;' },
     { action: 'followup', label: '📅 Przełóż na jutro', style: 'background:#f59e0b;color:white;' },
   ];
   
   let sections = '';
   
   if (newLeads.length > 0) {
     sections += `<div style="margin-bottom:20px;"><h3 style="color:#1a1a2e;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">🆕 Nowe bez kontaktu (&gt;24h) — ${newLeads.length}</h3>`;
     sections += newLeads.map(l => formatLead(l, stdButtons)).join('');
     sections += '</div>';
   }
   
   if (contactLeads.length > 0) {
     sections += `<div style="margin-bottom:20px;"><h3 style="color:#1a1a2e;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">📞 Kontakt bez postępu (&gt;7 dni) — ${contactLeads.length}</h3>`;
     sections += contactLeads.map(l => formatLead(l, stdButtons)).join('');
     sections += '</div>';
   }
   
   if (followupLeads.length > 0) {
     sections += `<div style="margin-bottom:20px;"><h3 style="color:#1a1a2e;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">📅 Follow-up na dziś — ${followupLeads.length}</h3>`;
     sections += followupLeads.map(l => formatLead(l, followupButtons)).join('');
     sections += '</div>';
   }
   
   const subject = `⏰ Masz ${total} lead${total === 1 ? 'a' : total < 5 ? 'y' : 'ów'} do obsłużenia`;
   
   const body = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;">`
     + `<div style="background:#1a6b3c;color:white;padding:16px 20px;border-radius:8px 8px 0 0;"><h2 style="margin:0;font-size:18px;">⏰ Poranny przegląd leadów</h2></div>`
     + `<div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:20px;">`
     + sections
     + `</div></div>`;
   
   return [{ json: { subject, body, recipientEmail: 'piotrtokeny@gmail.com' } }];
   ```

6. **Gmail node** — sends the summary email

**Connections:**
```
Cron Trigger → [parallel] → Nowe >24h
                           → Kontakt >7d
                           → Follow-up dziś
              → [merge] → Buduj email → Gmail
```

Note: In n8n, the 3 Airtable Search nodes run from the same trigger. The Code node "Buduj email" references all 3 by name using `$('node name')`.

- [ ] **Step 2: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('n8n/follow-up-reminder-workflow.json','utf8')); console.log('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add n8n/follow-up-reminder-workflow.json
git commit -m "feat: add Follow-up Reminder workflow for daily lead summary"
```

---

## Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add new CRM sections to CLAUDE.md**

Add the following to the CRM Integration section:

1. **Pipeline statuses** — list of 7 Status values and their meaning
2. **Lead scoring** — 2-signal model (type + channel), thresholds, priority values
3. **New n8n workflows:**
   - "Szkody - Lead Action" (`/webhook/szkody-lead-action`) — email button clicks → status update
   - "Szkody - Follow-up Reminder" — daily cron 8:00, summary of forgotten leads
4. **New Airtable fields:** Priorytet (Single Select), Data follow-up (Date)
5. **Airtable views:** 4 views listed (Pipeline, Wszystkie, Nowe dziś, Zapomniane)
6. **New n8n files:** `n8n/lead-action-workflow.json`, `n8n/follow-up-reminder-workflow.json`, `n8n/scoring-code-node.js`
7. **Spec/plan references:** add paths to specs/plans list

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with CRM pipeline, scoring, action workflows"
```

---

## Task 7: Deployment Instructions

**Files:**
- Modify: `docs/airtable-setup-instructions.md` (append deployment section)

- [ ] **Step 1: Add deployment checklist**

Append to `docs/airtable-setup-instructions.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/airtable-setup-instructions.md
git commit -m "docs: add deployment checklist for CRM organization"
```
