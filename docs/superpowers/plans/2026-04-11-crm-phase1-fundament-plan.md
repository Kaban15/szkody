# CRM Phase 1: Fundament — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy Chatwoot + NocoDB + PostgreSQL on VPS, integrate Chatwoot widget and form submissions with the existing static website.

**Architecture:** Docker Compose stack on Hostinger KVM 2 VPS behind Traefik reverse proxy with auto-SSL. Website (Vercel) sends form data to Chatwoot API and embeds Chatwoot chat widget. CRM tables in NocoDB backed by shared PostgreSQL.

**Tech Stack:** Docker Compose, Traefik v3, Chatwoot (self-hosted), NocoDB, PostgreSQL 16, Redis 7, Uptime Kuma, vanilla JS (website side)

**Spec:** `docs/superpowers/specs/2026-04-11-crm-bot-integration-design.md`

**Scope:** This plan covers Phase 1 only (spec section 8). Phases 2-5 (AI bot, socials, automations, Cal.com) will have separate plans.

**Two repos involved:**
- `szkody-crm/` (NEW) — Docker infrastructure, CRM config, bot config (VPS tasks)
- `szkody/` (EXISTING) — website integration (JS changes, CSP update)

---

## File Structure

### New repo: `szkody-crm/`

```
szkody-crm/
├── docker-compose.yml          # Full stack definition
├── .env.example                # Template — all env vars documented
├── traefik/
│   └── traefik.yml             # Static Traefik config (entrypoints, Let's Encrypt)
├── scripts/
│   ├── backup-postgres.sh      # pg_dump cron script
│   └── setup-swap.sh           # 2GB swap setup
├── bot/
│   └── knowledge/              # Phase 2 — empty for now
├── n8n-workflows/              # Phase 2 — empty for now
└── docs/
    └── setup.md                # VPS setup guide
```

### Modified in `szkody/`

```
szkody/
├── js/
│   ├── chatwoot.js             # NEW — Chatwoot SDK loader
│   └── form-validation.js      # MODIFY — submitForm() → Chatwoot API
├── vercel.json                 # MODIFY — CSP update
├── index.html                  # MODIFY — add chatwoot.js script tag
├── kontakt.html                # MODIFY — add chatwoot.js + honeypot
├── kalkulator.html             # MODIFY — add chatwoot.js
├── (all other .html files)     # MODIFY — add chatwoot.js script tag
└── tests/
    └── form-submission.test.js # NEW — tests for Chatwoot API submission
```

---

## Part A: VPS Infrastructure (szkody-crm repo)

### Task 1: Create szkody-crm repo structure

**Files:**
- Create: `szkody-crm/docker-compose.yml`
- Create: `szkody-crm/.env.example`
- Create: `szkody-crm/.gitignore`
- Create: `szkody-crm/traefik/traefik.yml`

- [ ] **Step 1: Initialize repo**

```bash
mkdir ~/szkody-crm && cd ~/szkody-crm
git init
```

- [ ] **Step 2: Create .gitignore**

```gitignore
.env
data/
letsencrypt/
```

- [ ] **Step 3: Create .env.example**

```env
# === Domain ===
DOMAIN=example.pl
CHATWOOT_DOMAIN=chat.example.pl
NOCODB_DOMAIN=crm.example.pl
UPTIME_DOMAIN=status.example.pl

# === Let's Encrypt ===
ACME_EMAIL=admin@example.pl

# === PostgreSQL ===
POSTGRES_USER=szkody
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
CHATWOOT_DB=chatwoot_production
NOCODB_DB=nocodb

# === Chatwoot ===
CHATWOOT_SECRET_KEY_BASE=CHANGE_ME_RUN_openssl_rand_hex_64
CHATWOOT_FRONTEND_URL=https://chat.example.pl
CHATWOOT_DEFAULT_LOCALE=pl

# === Redis ===
REDIS_URL=redis://redis:6379

# === Backup encryption ===
BACKUP_PASSPHRASE=CHANGE_ME_RUN_openssl_rand_hex_32

# === Uptime Kuma ===
# No env vars needed — configured via web UI
```

- [ ] **Step 4: Create traefik/traefik.yml**

```yaml
api:
  dashboard: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: "${ACME_EMAIL}"
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    exposedByDefault: false
```

- [ ] **Step 5: Create docker-compose.yml**

```yaml
services:
  # === Reverse Proxy ===
  traefik:
    image: traefik:v3.0
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - traefik-letsencrypt:/letsencrypt
    mem_limit: 128m

  # === Database ===
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init.sql:ro
    mem_limit: 1g
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
    mem_limit: 256m
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # === Chatwoot ===
  chatwoot-web:
    image: chatwoot/chatwoot:latest
    restart: unless-stopped
    command: bundle exec rails s -p 3000 -b 0.0.0.0
    environment:
      RAILS_ENV: production
      SECRET_KEY_BASE: ${CHATWOOT_SECRET_KEY_BASE}
      FRONTEND_URL: ${CHATWOOT_FRONTEND_URL}
      DEFAULT_LOCALE: ${CHATWOOT_DEFAULT_LOCALE}
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${CHATWOOT_DB}
      REDIS_URL: ${REDIS_URL}
      RAILS_LOG_TO_STDOUT: "true"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.chatwoot.rule=Host(`${CHATWOOT_DOMAIN}`)"
      - "traefik.http.routers.chatwoot.entrypoints=websecure"
      - "traefik.http.routers.chatwoot.tls.certresolver=letsencrypt"
      - "traefik.http.services.chatwoot.loadbalancer.server.port=3000"
      - "traefik.http.middlewares.chatwoot-ratelimit.ratelimit.average=10"
      - "traefik.http.middlewares.chatwoot-ratelimit.ratelimit.period=1m"
      - "traefik.http.middlewares.chatwoot-ratelimit.ratelimit.burst=20"
      - "traefik.http.routers.chatwoot.middlewares=chatwoot-ratelimit"
    mem_limit: 1536m

  chatwoot-worker:
    image: chatwoot/chatwoot:latest
    restart: unless-stopped
    command: bundle exec sidekiq -C config/sidekiq.yml
    environment:
      RAILS_ENV: production
      SECRET_KEY_BASE: ${CHATWOOT_SECRET_KEY_BASE}
      FRONTEND_URL: ${CHATWOOT_FRONTEND_URL}
      DEFAULT_LOCALE: ${CHATWOOT_DEFAULT_LOCALE}
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${CHATWOOT_DB}
      REDIS_URL: ${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    mem_limit: 1g

  # === CRM ===
  nocodb:
    image: nocodb/nocodb:latest
    restart: unless-stopped
    environment:
      NC_DB: "pg://postgres:5432?u=${POSTGRES_USER}&p=${POSTGRES_PASSWORD}&d=${NOCODB_DB}"
    depends_on:
      postgres:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nocodb.rule=Host(`${NOCODB_DOMAIN}`)"
      - "traefik.http.routers.nocodb.entrypoints=websecure"
      - "traefik.http.routers.nocodb.tls.certresolver=letsencrypt"
      - "traefik.http.services.nocodb.loadbalancer.server.port=8080"
    mem_limit: 512m

  # === Monitoring ===
  uptime-kuma:
    image: louislam/uptime-kuma:1
    restart: unless-stopped
    volumes:
      - uptime-data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.uptime.rule=Host(`${UPTIME_DOMAIN}`)"
      - "traefik.http.routers.uptime.entrypoints=websecure"
      - "traefik.http.routers.uptime.tls.certresolver=letsencrypt"
      - "traefik.http.services.uptime.loadbalancer.server.port=3001"
    mem_limit: 256m

volumes:
  postgres-data:
  redis-data:
  traefik-letsencrypt:
  uptime-data:
```

- [ ] **Step 6: Create init-databases.sql**

Create `szkody-crm/scripts/init-databases.sql`:

```sql
-- Create databases for each service (PostgreSQL entrypoint runs this once)
CREATE DATABASE chatwoot_production;
CREATE DATABASE nocodb;
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: initial szkody-crm repo — Docker Compose stack with Traefik, Chatwoot, NocoDB, PostgreSQL, Redis, Uptime Kuma"
```

---

### Task 2: VPS preparation scripts

**Files:**
- Create: `szkody-crm/scripts/setup-swap.sh`
- Create: `szkody-crm/scripts/backup-postgres.sh`
- Create: `szkody-crm/docs/setup.md`

- [ ] **Step 1: Create swap setup script**

`szkody-crm/scripts/setup-swap.sh`:

```bash
#!/bin/bash
set -euo pipefail

# Create 2GB swap if not exists
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap created and enabled."
else
    echo "Swap already exists."
fi

# Set swappiness low — only use swap under pressure
sysctl vm.swappiness=10
echo 'vm.swappiness=10' >> /etc/sysctl.conf
```

- [ ] **Step 2: Create PostgreSQL backup script**

`szkody-crm/scripts/backup-postgres.sh`:

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/szkody-crm/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Dump all databases — gzip + encrypt with passphrase from env
docker compose exec -T postgres pg_dumpall -U "$POSTGRES_USER" \
    | gzip \
    | openssl enc -aes-256-cbc -salt -pbkdf2 -pass env:BACKUP_PASSPHRASE \
    > "$BACKUP_DIR/pg_all_$TIMESTAMP.sql.gz.enc"

# Remove backups older than retention
find "$BACKUP_DIR" -name "pg_all_*.sql.gz.enc" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: pg_all_$TIMESTAMP.sql.gz.enc"
# Restore: openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSPHRASE -in FILE | gunzip | psql
```

- [ ] **Step 3: Create setup guide**

`szkody-crm/docs/setup.md`:

```markdown
# VPS Setup Guide

## Prerequisites
- Ubuntu 24.04 VPS with min 8GB RAM
- Docker + Docker Compose installed
- Domain with A records pointing to VPS IP:
  - chat.DOMAIN → VPS_IP
  - crm.DOMAIN → VPS_IP
  - status.DOMAIN → VPS_IP

## Steps

1. Clone repo: `git clone <repo-url> /opt/szkody-crm && cd /opt/szkody-crm`
2. Run swap setup: `sudo bash scripts/setup-swap.sh`
3. Copy env: `cp .env.example .env` and fill in real values
4. Generate Chatwoot secret: `openssl rand -hex 64` → paste into CHATWOOT_SECRET_KEY_BASE
5. Start stack: `docker compose up -d`
6. Run Chatwoot migrations: `docker compose exec chatwoot-web bundle exec rails db:chatwoot_prepare`
7. Create Chatwoot admin: visit https://chat.DOMAIN and follow setup wizard
8. Setup backup cron: `crontab -e` → add `0 */6 * * * cd /opt/szkody-crm && bash scripts/backup-postgres.sh`
9. Configure Uptime Kuma: visit https://status.DOMAIN → add monitors for all services

## Verify

- `docker compose ps` — all services healthy
- `curl -sI https://chat.DOMAIN` — 200 OK
- `curl -sI https://crm.DOMAIN` — 200 OK
- `free -h` — check RAM usage under 6GB
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add VPS setup scripts — swap, postgres backup, setup guide"
```

---

### Task 3: Deploy stack on VPS

**Prerequisites:** SSH access to VPS, Docker + Docker Compose installed, DNS A records configured.

> **Note:** This task requires SSH access to the VPS. Execute commands on the VPS, not locally.

- [ ] **Step 1: Setup swap**

```bash
sudo bash scripts/setup-swap.sh
```

Expected: "Swap created and enabled." Verify: `free -h` shows 2GB swap.

- [ ] **Step 2: Configure .env**

```bash
cp .env.example .env
# Edit .env with real values:
# - Real domain
# - Strong PostgreSQL password (openssl rand -hex 32)
# - Chatwoot secret (openssl rand -hex 64)
# - Real email for Let's Encrypt
```

- [ ] **Step 3: Start the stack**

```bash
docker compose up -d
```

Expected: All containers start. Verify:

```bash
docker compose ps
```

All services should show `running` or `healthy`.

- [ ] **Step 4: Run Chatwoot database setup**

```bash
docker compose exec chatwoot-web bundle exec rails db:chatwoot_prepare
```

Expected: Database tables created, no errors.

- [ ] **Step 5: Verify endpoints**

```bash
curl -sI https://chat.DOMAIN | head -5
curl -sI https://crm.DOMAIN | head -5
curl -sI https://status.DOMAIN | head -5
```

Expected: All return HTTP 200 or 302 (redirect to setup wizard).

- [ ] **Step 6: Setup backup cron**

```bash
(crontab -l 2>/dev/null; echo "0 */6 * * * cd /opt/szkody-crm && bash scripts/backup-postgres.sh >> /var/log/szkody-backup.log 2>&1") | crontab -
```

Verify: `crontab -l` shows the entry.

---

### Task 4: Configure Chatwoot

> **Note:** UI configuration via browser — no code changes.

- [ ] **Step 1: Complete Chatwoot setup wizard**

Visit `https://chat.DOMAIN` → create admin account (your email + strong password).

- [ ] **Step 2: Create Website inbox**

Chatwoot panel → Settings → Inboxes → Add Inbox → Website
- Name: "Strona szkody.vercel.app"
- Website URL: `https://szkody.vercel.app`
- Widget color: `#1a6b3c`
- Welcome tagline (PL): "Dzień dobry! W czym mogę pomóc?"
- Reply time: "W kilka minut"
- Enable pre-chat form: YES (Imię, Email — telefon zbierze bot)

→ **Copy the website token** — needed for Task 7 (widget integration).

- [ ] **Step 3: Create API inbox (for form submissions)**

Chatwoot panel → Settings → Inboxes → Add Inbox → API
- Name: "Formularze strony"

→ **Copy the API inbox ID and access token** — needed for Tasks 8-10.

- [ ] **Step 4: Configure agent**

Chatwoot panel → Settings → Agents → Add Agent
- Name: your name
- Email: your email
- Assign to both inboxes

- [ ] **Step 5: Set notification preferences**

Settings → Notifications → Enable email + push for:
- New conversation assigned
- New message in assigned conversation
- Conversation mention

---

### Task 5: Configure NocoDB CRM tables

> **Note:** UI configuration via browser — no code changes.

- [ ] **Step 1: Access NocoDB**

Visit `https://crm.DOMAIN` → create admin account.

- [ ] **Step 2: Create "Leady" table**

Fields:
| Field | Type | Config |
|-------|------|--------|
| Imię | Single line text | Required |
| Telefon | Phone | Required |
| Email | Email | |
| Kanał źródłowy | Single select | Options: WhatsApp, IG, Chat, Formularz, Messenger, Email |
| Typ zdarzenia | Single select | Options: Komunikacyjne, Przy pracy, Błąd medyczny, Śmierć bliskiej, Rolnicze, Inne |
| Data zdarzenia | Date | |
| Kwalifikacja | Single select | Options: A (gorący), B (ciepły), C (zimny) |
| Status | Single select | Options: Nowy lead, Kwalifikowany, Kontakt umówiony, Dokumenty zebrane, W toku, Zamknięte-wygrana, Zamknięte-przegrana, Zamknięte-odmowa |
| Przypisany do | Single line text | Default: owner name |
| Notatki | Long text | |
| Źródło strony | Single line text | |
| Chatwoot ID | Number | For linking back to Chatwoot conversation |

- [ ] **Step 3: Create "Interakcje" table**

Fields:
| Field | Type | Config |
|-------|------|--------|
| Lead | Link to "Leady" | Required |
| Data | DateTime | Default: now |
| Kanał | Single select | Options: WhatsApp, Telefon, Email, Chat, Formularz |
| Typ | Single select | Options: Bot, Ręczny |
| Treść | Long text | |

- [ ] **Step 4: Create "Przypomnienia" table**

Fields:
| Field | Type | Config |
|-------|------|--------|
| Lead | Link to "Leady" | Required |
| Data przypomnienia | DateTime | Required |
| Typ | Single select | Options: Callback, Follow-up, Wizyta, Dokument |
| Treść | Single line text | |
| Wykonano | Checkbox | Default: unchecked |

- [ ] **Step 5: Create Kanban view on "Leady"**

View → Kanban → Group by: Status
- Columns: Nowy lead | Kwalifikowany | Kontakt umówiony | Dokumenty zebrane | W toku | Zamknięte-wygrana | Zamknięte-przegrana

- [ ] **Step 6: Generate NocoDB API token**

Settings → API Tokens → Create token with full access
→ **Save token** — needed for Phase 2 (n8n automations).

---

## Part B: Website Integration (szkody repo)

### Task 6: Create Chatwoot widget loader

**Files:**
- Create: `js/chatwoot.js`

- [ ] **Step 1: Create js/chatwoot.js**

```javascript
'use strict';

/**
 * Chatwoot SDK loader.
 * Initializes the Chatwoot chat widget on all pages.
 *
 * Configuration:
 *   CHATWOOT_BASE_URL - your Chatwoot instance URL
 *   CHATWOOT_WEBSITE_TOKEN - from Chatwoot inbox settings
 */
(function initChatwoot() {
    var BASE_URL = 'https://CHATWOOT_DOMAIN_PLACEHOLDER';
    var TOKEN = 'CHATWOOT_TOKEN_PLACEHOLDER';

    var d = document;
    var s = d.createElement('script');
    s.src = BASE_URL + '/packs/js/sdk.js';
    s.defer = true;
    s.async = true;
    s.onload = function () {
        window.chatwootSDK.run({
            websiteToken: TOKEN,
            baseUrl: BASE_URL,
            locale: 'pl'
        });
    };
    d.head.appendChild(s);
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/chatwoot.js
git commit -m "feat: add Chatwoot widget loader script"
```

---

### Task 7: Add Chatwoot script to all HTML pages

**Files:**
- Modify: all public HTML files (index.html, kontakt.html, kalkulator.html, jak-dzialamy.html, 404.html, polityka-prywatnosci.html, sukcesy.html, uslugi.html, opinie.html, odszkodowania-*.html, blog/index.html, blog/*.html)

- [ ] **Step 1: Add script tag to every HTML file**

Add before `</body>` in each file, after existing scripts:

```html
<script src="/js/chatwoot.js"></script>
```

For blog articles, use relative path:

```html
<script src="../js/chatwoot.js"></script>
```

> **Tip:** Use grep to find all `</body>` tags and batch-insert. There are ~35 HTML files.

- [ ] **Step 2: Verify no duplicates**

```bash
grep -r "chatwoot" *.html blog/*.html --include="*.html" -l | wc -l
```

Expected: count matches total HTML files.

- [ ] **Step 3: Commit**

```bash
git add *.html blog/*.html
git commit -m "feat: add Chatwoot chat widget to all pages"
```

---

### Task 8: Update form-validation.js — submitForm() to Chatwoot API

**Files:**
- Modify: `js/form-validation.js:123-157`
- Create: `tests/form-submission.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/form-submission.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DOM
function createMockForm(fields) {
    const form = document.createElement('form');
    fields.forEach(({ id, value }) => {
        const input = document.createElement('input');
        input.id = id;
        input.value = value;
        form.appendChild(input);
    });
    const btn = document.createElement('button');
    btn.type = 'submit';
    form.appendChild(btn);
    document.body.appendChild(form);
    return form;
}

describe('submitForm with Chatwoot API', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        globalThis.fetch = vi.fn();
    });

    it('sends form data to Chatwoot API on valid submission', async () => {
        // Mock two-step API: create contact, then create conversation
        globalThis.fetch
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ payload: { contact: { id: 42 } } }) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

        // Load form-validation.js (assigns to window.formValidation)
        await import('../js/form-validation.js');

        const form = createMockForm([
            { id: 'test-name', value: 'Jan Kowalski' },
            { id: 'test-phone', value: '600123456' },
        ]);

        const templateEl = document.createElement('template');
        templateEl.id = 'test-success';
        templateEl.innerHTML = '<p>Success</p>';
        document.body.appendChild(templateEl);

        const consent = document.createElement('input');
        consent.type = 'checkbox';
        consent.id = 'test-consent';
        consent.checked = true;
        form.appendChild(consent);

        window.formValidation.submitForm({
            form,
            fields: [
                { id: 'test-name', validate: (v) => v.trim().length >= 2 },
                { id: 'test-phone', validate: (v) => /^[0-9]{9}$/.test(v) },
            ],
            consentId: 'test-consent',
            templateId: 'test-success',
            chatwootTag: 'kontakt',
        });

        // Wait for async fetch — first call creates contact
        await vi.waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        });

        const [url, options] = globalThis.fetch.mock.calls[0];
        expect(url).toContain('/api/v1/accounts/');
        expect(url).toContain('/contacts');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body).toHaveProperty('name', 'Jan Kowalski');
    });

    it('does not call API when validation fails', async () => {
        globalThis.fetch.mockResolvedValueOnce({ ok: true });

        await import('../js/form-validation.js');

        const form = createMockForm([
            { id: 'test-name', value: '' },
        ]);

        const errorEl = document.createElement('span');
        errorEl.id = 'test-name-error';
        errorEl.classList.add('hidden');
        document.body.appendChild(errorEl);

        window.formValidation.submitForm({
            form,
            fields: [
                { id: 'test-name', validate: (v) => v.trim().length >= 2 },
            ],
            chatwootTag: 'kontakt',
        });

        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('shows success template even if API call fails (graceful degradation)', async () => {
        globalThis.fetch.mockRejectedValueOnce(new Error('Network error'));

        await import('../js/form-validation.js');

        const form = createMockForm([
            { id: 'test-name', value: 'Jan Kowalski' },
        ]);

        const templateEl = document.createElement('template');
        templateEl.id = 'test-success';
        templateEl.innerHTML = '<p>Success</p>';
        document.body.appendChild(templateEl);

        window.formValidation.submitForm({
            form,
            fields: [
                { id: 'test-name', validate: (v) => v.trim().length >= 2 },
            ],
            templateId: 'test-success',
            chatwootTag: 'kontakt',
        });

        // Success template shown immediately (fire-and-forget — don't wait for API)
        expect(form.querySelector('p')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/form-submission.test.js
```

Expected: FAIL — `submitForm` doesn't call fetch yet.

- [ ] **Step 3: Update submitForm() in form-validation.js**

Replace lines 123-157 of `js/form-validation.js`:

```javascript
/**
 * Chatwoot Platform API configuration.
 * Replace placeholders with real values after Chatwoot setup (Task 4).
 * Uses two-step flow: create contact → create conversation.
 */
var CHATWOOT_BASE_URL = 'https://CHATWOOT_DOMAIN_PLACEHOLDER';
var CHATWOOT_API_TOKEN = 'CHATWOOT_API_TOKEN_PLACEHOLDER';
var CHATWOOT_ACCOUNT_ID = 'CHATWOOT_ACCOUNT_ID_PLACEHOLDER'; // usually 1 for self-hosted
var CHATWOOT_INBOX_ID = 'CHATWOOT_INBOX_ID_PLACEHOLDER';

/**
 * Send form data to Chatwoot as a new contact + conversation.
 * Two-step: POST /contacts → POST /conversations.
 * Fire-and-forget — success UI shows regardless of API result.
 */
function sendToChatwoot(formData, tag) {
    // Honeypot: if hidden field is filled, it's a spam bot — discard silently
    var honeypot = document.querySelector('.hp-field');
    if (honeypot && honeypot.value) return;

    var apiBase = CHATWOOT_BASE_URL + '/api/v1/accounts/' + CHATWOOT_ACCOUNT_ID;
    var headers = {
        'Content-Type': 'application/json',
        'api_access_token': CHATWOOT_API_TOKEN,
    };

    // Step 1: Create or find contact
    fetch(apiBase + '/contacts', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            inbox_id: CHATWOOT_INBOX_ID,
            name: formData.name || '',
            email: formData.email || '',
            phone_number: formData.phone ? ('+48' + formData.phone.replace(/^\+48/, '')) : '',
            custom_attributes: {
                source_tag: tag,
                source_url: window.location.pathname,
            },
        }),
    })
    .then(function (res) { return res.json(); })
    .then(function (contact) {
        var contactId = contact.payload && contact.payload.contact && contact.payload.contact.id;
        if (!contactId) return;

        // Step 2: Create conversation with initial message
        return fetch(apiBase + '/conversations', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                contact_id: contactId,
                inbox_id: CHATWOOT_INBOX_ID,
                message: {
                    content: formData.message || ('Nowe zapytanie z formularza: ' + tag),
                },
                custom_attributes: { source_tag: tag },
            }),
        });
    })
    .catch(function (err) {
        // Silently fail — don't block user experience
        if (typeof console !== 'undefined') console.warn('Chatwoot API error:', err);
    });
}

/**
 * Generic form submission handler with validation, disable, and template-based success.
 * @param {Object} options
 * @param {HTMLFormElement} options.form - The form element
 * @param {Array<{id: string, validate: Function}>} options.fields - Fields to validate
 * @param {string} [options.consentId] - Checkbox consent element ID
 * @param {string} [options.templateId] - Success template element ID
 * @param {Function} [options.onSuccess] - Callback after success shown
 * @param {string} [options.chatwootTag] - Tag for CRM source tracking (e.g. 'quiz', 'kalkulator', 'kontakt')
 */
function submitForm({ form, fields, consentId, templateId, onSuccess, chatwootTag }) {
    let isValid = true;

    fields.forEach(({ id, validate }) => {
        const value = document.getElementById(id).value;
        if (!validate(value)) {
            showError(id);
            isValid = false;
        } else {
            hideError(id);
        }
    });

    if (consentId && !document.getElementById(consentId).checked) {
        isValid = false;
    }

    if (!isValid) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="v2-spinner"></span>';
    }

    // Collect form data for Chatwoot
    const formData = {};
    fields.forEach(function (f) {
        const el = document.getElementById(f.id);
        if (el) {
            const key = f.id.replace(/^(quiz-|calc-|contact-|pf-)/, '');
            formData[key] = el.value;
        }
    });

    // Send to Chatwoot (fire-and-forget)
    if (chatwootTag) {
        sendToChatwoot(formData, chatwootTag);
    }

    // Show success UI immediately (don't wait for API)
    if (templateId) {
        const template = document.getElementById(templateId);
        if (template) {
            form.replaceChildren(template.content.cloneNode(true));
        }
    }
    if (onSuccess) onSuccess();
}
```

**Important:** Also update the `window.formValidation` export at line 160 to include `sendToChatwoot`:

```javascript
window.formValidation = { validateName, validatePhone, validateEmail, validateQuizForm, showError, hideError, showSuccess, attachLiveValidation, submitForm, sendToChatwoot };
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All tests pass (existing + new).

- [ ] **Step 5: Commit**

```bash
git add js/form-validation.js tests/form-submission.test.js
git commit -m "feat: connect submitForm() to Chatwoot API — fire-and-forget with graceful degradation"
```

---

### Task 9: Update quiz.js — send quiz data to Chatwoot

**Files:**
- Modify: `js/quiz.js:130-168`

- [ ] **Step 1: Replace quiz submit handler**

In `js/quiz.js`, replace the `setTimeout` block (lines 142-166) with:

```javascript
            // Collect quiz answers + contact data for Chatwoot
            var quizData = {
                name: document.getElementById('quiz-name').value,
                phone: document.getElementById('quiz-phone').value.replace(/[\s-]/g, ''),
                email: document.getElementById('quiz-email').value,
                message: 'Wyniki quizu diagnostycznego:\n' +
                    Object.entries(state.answers).map(function (entry) {
                        return entry[0] + ': ' + entry[1];
                    }).join('\n'),
            };

            // Send to Chatwoot (fire-and-forget)
            if (window.formValidation && window.formValidation.sendToChatwoot) {
                window.formValidation.sendToChatwoot(quizData, 'quiz');
            }

            // Show success UI immediately
            document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
            const successEl = document.getElementById('quiz-success');
            successEl.classList.remove('hidden');

            const msgEl = document.getElementById('quiz-success-msg');
            msgEl.textContent = isBusinessHours()
                ? 'Nasz specjalista oddzwoni w ciągu 30 minut.'
                : 'Oddzwonimy w następnym dniu roboczym. Dziękujemy za cierpliwość.';

            const summarySource = document.getElementById('quiz-summary');
            const summaryTarget = document.getElementById('quiz-success-summary');
            if (summarySource && summaryTarget) {
                summaryTarget.replaceChildren();
                Array.from(summarySource.childNodes).forEach(node => {
                    summaryTarget.appendChild(node.cloneNode(true));
                });
            }

            if (window.trackEvent) window.trackEvent('quiz_submitted', state.answers);
```

Note: `sendToChatwoot` is exported on `window.formValidation` from `form-validation.js` (loaded first). The guard ensures graceful fallback if script order changes.

- [ ] **Step 2: Run existing tests**

```bash
npm test
```

Expected: All pass — quiz test doesn't test submission, business hours test unaffected.

- [ ] **Step 3: Commit**

```bash
git add js/quiz.js
git commit -m "feat: send quiz results to Chatwoot on submission"
```

---

### Task 10: Update calculator.js — send calculator data to Chatwoot

**Files:**
- Modify: `js/calculator.js:128-143`

- [ ] **Step 1: Add chatwootTag to calculator CTA form**

In `js/calculator.js`, update the `submitForm` call (line 132) to include `chatwootTag`:

```javascript
            window.formValidation.submitForm({
                form: ctaForm,
                fields: [
                    { id: 'calc-name', validate: window.formValidation.validateName },
                    { id: 'calc-phone', validate: window.formValidation.validatePhone },
                ],
                consentId: 'calc-consent',
                templateId: 'calc-success-template',
                chatwootTag: 'kalkulator',
                onSuccess: () => { if (window.trackEvent) window.trackEvent('calculator_cta_clicked'); },
            });
```

This is a one-line addition (`chatwootTag: 'kalkulator'`). The `submitForm()` function already handles sending to Chatwoot when `chatwootTag` is present.

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All pass — calculator tests check math logic, not submission.

- [ ] **Step 3: Commit**

```bash
git add js/calculator.js
git commit -m "feat: send calculator CTA form data to Chatwoot"
```

---

### Task 11: Update vercel.json CSP + add honeypot field

**Files:**
- Modify: `vercel.json:28`

- [ ] **Step 1: Update Content-Security-Policy**

In `vercel.json`, update the CSP `value` (line 28) to add the Chatwoot domain:

Replace:
```
connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'none';
```

With:
```
connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://CHATWOOT_DOMAIN_PLACEHOLDER wss://CHATWOOT_DOMAIN_PLACEHOLDER; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://CHATWOOT_DOMAIN_PLACEHOLDER; frame-src 'none'; form-action 'self' https://CHATWOOT_DOMAIN_PLACEHOLDER;
```

> **Note:** Added `wss://` for Chatwoot websocket (live chat), and Chatwoot domain to `form-action`.


> **Important:** Replace `CHATWOOT_DOMAIN_PLACEHOLDER` with real domain (e.g., `https://chat.szkody.pl`).

- [ ] **Step 2: Run tests to verify nothing broke**

```bash
npm test
```

Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: add Chatwoot domain to CSP connect-src and script-src"
```

---

### Task 12: Add honeypot field to contact forms

**Files:**
- Modify: `js/form-validation.js` (add honeypot check)
- Modify: `kontakt.html`, `index.html`, all service subpages with forms (add hidden field)

- [ ] **Step 1: Honeypot check already in sendToChatwoot**

The `sendToChatwoot` function (updated in Task 8) already includes the honeypot check using `document.querySelector('.hp-field')`. No additional JS changes needed.

- [ ] **Step 2: Add hidden field to forms in HTML**

Add to each form (quiz, calculator, contact) — inside the `<form>` tag, hidden via CSS. Use **class** (not id) because pages may have multiple forms:

```html
<div style="position:absolute;left:-9999px" aria-hidden="true">
    <input type="text" class="hp-field" name="hp_field" tabindex="-1" autocomplete="off">
</div>
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add js/form-validation.js kontakt.html index.html odszkodowania-*.html kalkulator.html
git commit -m "feat: add honeypot anti-spam field to all forms"
```

---

### Task 13: End-to-end verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Start local server and verify widget loads**

```bash
python3 -m http.server 1111
```

Visit `http://localhost:1111` → verify:
- Chatwoot widget bubble appears in bottom-right corner (will show error until real domain configured — that's expected with placeholder values)
- All existing functionality works (quiz, calculator, navigation, FAQ accordion)
- No console errors (except Chatwoot connection error from placeholder domain)

- [ ] **Step 3: Verify forms include honeypot**

Inspect form HTML → verify hidden `hp-field` input exists in quiz, calculator, and contact forms.

- [ ] **Step 4: Verify CSP in vercel.json is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8')); console.log('Valid JSON')"
```

Expected: "Valid JSON"

---

## Placeholder Values to Replace After VPS Deployment

Once Chatwoot is running (Task 3-4), replace these placeholders:

| File | Placeholder | Replace with |
|------|------------|-------------|
| `js/chatwoot.js` | `CHATWOOT_DOMAIN_PLACEHOLDER` | `https://chat.yourdomain.pl` |
| `js/chatwoot.js` | `CHATWOOT_TOKEN_PLACEHOLDER` | Website inbox token from Task 4 Step 2 |
| `js/form-validation.js` | `CHATWOOT_DOMAIN_PLACEHOLDER` | `https://chat.yourdomain.pl` |
| `js/form-validation.js` | `CHATWOOT_API_TOKEN_PLACEHOLDER` | API token from Task 4 Step 3 |
| `js/form-validation.js` | `CHATWOOT_INBOX_ID_PLACEHOLDER` | API inbox ID from Task 4 Step 3 |
| `vercel.json` | `CHATWOOT_DOMAIN_PLACEHOLDER` | `https://chat.yourdomain.pl` |

After replacing, commit:
```bash
git add js/chatwoot.js js/form-validation.js vercel.json
git commit -m "feat: configure Chatwoot with production domain and tokens"
```

---

## Next Plans

After Phase 1 is complete and verified:
- **Phase 2 plan:** AI Bot — n8n workflow, Claude API integration, knowledge base, kwalifikacja A/B/C
- **Phase 3 plan:** Social channels — WhatsApp Business API, IG, Messenger in Chatwoot
- **Phase 4 plan:** Automations — reminders, follow-ups, alerts, daily reports
