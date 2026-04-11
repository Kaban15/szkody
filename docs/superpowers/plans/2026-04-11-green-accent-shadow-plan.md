# Green Accent + Service Tile Shadow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the brand accent color from red (#dc2626) with deep green (#1a6b3c) across all pages, and add a subtle bottom-border separator to the 6 service tiles on uslugi.html.

**Architecture:** Three-layer change — (1) Tailwind config tokens, (2) CSS custom properties + find-replace in styles.css, (3) hardcoded Tailwind red classes in HTML files. No JS logic touched, no structural HTML changes.

**Tech Stack:** Vanilla HTML/CSS, Tailwind CSS via CDN (config in js/tailwind-config.js), no build step — changes are direct file edits.

---

## File Map

| File | Change type |
|---|---|
| `js/tailwind-config.js` | Token swap (6 values) |
| `css/styles.css` | Add :root vars + find-replace ~15 red occurrences |
| `uslugi.html` | Add border classes to 6 tile divs + form red classes |
| `index.html` | No hardcoded red found — propagates via token |
| `odszkodowania-komunikacyjne.html` | No hardcoded red — propagates via token |
| `odszkodowania-wypadki-przy-pracy.html` | bg-red-600 on avatar (line 263) |
| `odszkodowania-bledy-medyczne.html` | No hardcoded red — propagates via token |
| `odszkodowania-smierc-bliskiej-osoby.html` | No hardcoded red — propagates via token |
| `odszkodowania-wypadki-rolnicze.html` | No hardcoded red — propagates via token |
| `jak-dzialamy.html` | bg-red-50 (8×), focus:ring-red-200 (3×), accent-red-600, hover:bg-red-700 (2×) |
| `opinie.html` | hover:bg-red-700 (3×), focus:ring-red-200 (3×), accent-red-600 |
| `sukcesy.html` | hover:bg-red-700 (2×), bg-red-50, focus:ring-red-200 (3×), accent-red-600 |
| `kalkulator.html` | hover:bg-red-700 (2×), accent-red-600, hover:text-red-400 |
| `404.html` | hover:bg-red-700 |
| `polityka-prywatnosci.html` | hover:text-red-700 |

---

### Task 1: Tailwind token swap

**Files:**
- Modify: `js/tailwind-config.js`

- [ ] **Step 1: Open `js/tailwind-config.js` and replace all 6 red tokens**

  Replace the entire colors block with:

  ```js
  colors: {
      bg: '#FFFFFF',
      surface: '#F5F5F5',
      'surface-light': '#FFFFFF',
      gold: '#1a6b3c',
      'gold-light': '#166534',
      muted: '#6b7280',
      error: '#EF4444',
      cta: '#1a6b3c',
      'cta-hover': '#166534',
      text: '#1a1a2e',
      line: '#e5e7eb',
      'v2-bg': '#FFFFFF',
      'v2-surface': '#F5F5F5',
      'v2-text': '#1a1a2e',
      'v2-muted': '#6b7280',
      'v2-line': '#e5e7eb',
      'v2-cta': '#1a6b3c',
      'v2-cta-hover': '#166534',
      'v2-hero': '#1a1a2e',
      'v2-footer': '#1a1a2e',
  },
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add js/tailwind-config.js
  git commit -m "feat: swap brand color tokens from red to deep green"
  ```

---

### Task 2: CSS custom property + find-replace in styles.css

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add `:root` block at the very top of `css/styles.css`** (before line 1)

  ```css
  :root {
    --color-brand: #1a6b3c;
    --color-brand-hover: #166534;
  }
  ```

- [ ] **Step 2: Find-replace hex literals in `css/styles.css`**

  In your editor or with sed, replace:
  - `#dc2626` → `var(--color-brand)`
  - `#b91c1c` → `var(--color-brand-hover)`
  - `#991b1b` → `var(--color-brand-hover)`
  - `rgba(220, 38, 38,` → `rgba(26, 107, 60,`

  Expected matches before replacement (verify these lines get updated):
  - Line 45: `box-shadow: 0 0 30px rgba(220, 38, 38, 0.12)` → `rgba(26, 107, 60, 0.12)`
  - Line 46: `border-color: rgba(220, 38, 38, 0.3)` → `rgba(26, 107, 60, 0.3)`
  - Line 81: `background: #dc2626` → `var(--color-brand)`
  - Line 84: `box-shadow: 0 0 10px rgba(220, 38, 38, 0.3)` → `rgba(26, 107, 60, 0.3)`
  - Line 91: `background: #dc2626` → `var(--color-brand)`
  - Line 94: `box-shadow: 0 0 10px rgba(220, 38, 38, 0.3)` → `rgba(26, 107, 60, 0.3)`
  - Line 176: `rgba(220, 38, 38, 0.4)` → `rgba(26, 107, 60, 0.4)`
  - Line 221: `rgba(220, 38, 38, 0.3)` → `rgba(26, 107, 60, 0.3)`
  - Line 295: `background: #dc2626` → `var(--color-brand)`
  - Line 360: `linear-gradient(135deg, #dc2626, #f97316, #dc2626, #991b1b)` → `linear-gradient(135deg, var(--color-brand), #f97316, var(--color-brand), var(--color-brand-hover))`
  - Line 391: `rgba(220, 38, 38, 0.06)` → `rgba(26, 107, 60, 0.06)`
  - Line 438: `color: #dc2626 !important` → `var(--color-brand) !important`
  - Line 448: `background-color: #dc2626` → `var(--color-brand)`
  - Line 449: `border-color: #dc2626` → `var(--color-brand)`
  - Line 455: `border-color: #dc2626 !important` → `var(--color-brand) !important`
  - Line 510: `color: #dc2626 !important` → `var(--color-brand) !important`
  - Lines 515–516: both `rgba(220, 38, 38, ...)` → `rgba(26, 107, 60, ...)`
  - Line 550: `background-color: #dc2626` → `var(--color-brand)`
  - Line 583: `background: #dc2626` → `var(--color-brand)`
  - Line 585: `border-color: #dc2626` → `var(--color-brand)`

- [ ] **Step 3: Verify no red hex left in styles.css**

  ```bash
  grep -n "dc2626\|b91c1c\|991b1b\|rgba(220, 38" css/styles.css
  ```

  Expected: empty output.

- [ ] **Step 4: Commit**

  ```bash
  git add css/styles.css
  git commit -m "feat: replace red hex with green CSS custom properties in styles.css"
  ```

---

### Task 3: uslugi.html — tile border + form fixes

**Files:**
- Modify: `uslugi.html`

- [ ] **Step 1: Add border classes to each of the 6 service tile divs**

  The 6 divs with `v2-slide-left` or `v2-slide-right` classes (lines ~158–193). Add `border-b-2 border-[#1a6b3c]/15` to each:

  ```html
  <!-- Before -->
  <div class="v2-slide-left" style="transition-delay: 0s">
  <!-- After -->
  <div class="v2-slide-left border-b-2 border-[#1a6b3c]/15" style="transition-delay: 0s">
  ```

  Apply to all 6 tile divs (transition-delays: 0s, 0.1s, 0.2s, 0.3s, 0.4s, 0.5s).

- [ ] **Step 2: Fix hardcoded red classes in the same file**

  | Line(s) | Find | Replace |
  |---|---|---|
  | hero CTA button | `hover:bg-red-700` | `hover:bg-[#166534]` |
  | form submit button | `hover:bg-red-700` | `hover:bg-[#166534]` |
  | 3 input fields | `focus:ring-red-200` | `focus:ring-green-200` |
  | checkbox | `accent-red-600` | `accent-[#1a6b3c]` |

- [ ] **Step 3: Commit**

  ```bash
  git add uslugi.html
  git commit -m "feat: add green tile border separator and fix red classes on uslugi.html"
  ```

---

### Task 4: jak-dzialamy.html

**Files:**
- Modify: `jak-dzialamy.html`

- [ ] **Step 1: Replace all red classes**

  | Pattern | Count | Replace with |
  |---|---|---|
  | `hover:bg-red-700` | 2 | `hover:bg-[#166534]` |
  | `bg-red-50` | 8 | `bg-[#1a6b3c]/10` |
  | `focus:ring-red-200` | 3 | `focus:ring-green-200` |
  | `accent-red-600` | 1 | `accent-[#1a6b3c]` |

- [ ] **Step 2: Commit**

  ```bash
  git add jak-dzialamy.html
  git commit -m "fix: replace red classes with green on jak-dzialamy.html"
  ```

---

### Task 5: opinie.html

**Files:**
- Modify: `opinie.html`

- [ ] **Step 1: Replace all red classes**

  | Pattern | Count | Replace with |
  |---|---|---|
  | `hover:bg-red-700` | 3 | `hover:bg-[#166534]` |
  | `focus:ring-red-200` | 3 | `focus:ring-green-200` |
  | `accent-red-600` | 1 | `accent-[#1a6b3c]` |

- [ ] **Step 2: Commit**

  ```bash
  git add opinie.html
  git commit -m "fix: replace red classes with green on opinie.html"
  ```

---

### Task 6: sukcesy.html

**Files:**
- Modify: `sukcesy.html`

- [ ] **Step 1: Replace all red classes**

  | Pattern | Count | Replace with |
  |---|---|---|
  | `hover:bg-red-700` | 2 | `hover:bg-[#166534]` |
  | `bg-red-50` | 1 | `bg-[#1a6b3c]/10` |
  | `focus:ring-red-200` | 3 | `focus:ring-green-200` |
  | `accent-red-600` | 1 | `accent-[#1a6b3c]` |

- [ ] **Step 2: Commit**

  ```bash
  git add sukcesy.html
  git commit -m "fix: replace red classes with green on sukcesy.html"
  ```

---

### Task 7: kalkulator.html

**Files:**
- Modify: `kalkulator.html`

- [ ] **Step 1: Replace all red classes**

  | Pattern | Count | Replace with |
  |---|---|---|
  | `hover:bg-red-700` | 2 | `hover:bg-[#166534]` |
  | `accent-red-600` | 1 | `accent-[#1a6b3c]` |
  | `hover:text-red-400` | 1 | `hover:text-[#166534]` |

- [ ] **Step 2: Commit**

  ```bash
  git add kalkulator.html
  git commit -m "fix: replace red classes with green on kalkulator.html"
  ```

---

### Task 8: Remaining single-fix pages

**Files:**
- Modify: `404.html`, `polityka-prywatnosci.html`, `odszkodowania-wypadki-przy-pracy.html`

- [ ] **Step 1: Fix 404.html** — `hover:bg-red-700` → `hover:bg-[#166534]` (1 occurrence, CTA button)

- [ ] **Step 2: Fix polityka-prywatnosci.html** — `hover:text-red-700` → `hover:text-[#166534]` (1 occurrence, email link)

- [ ] **Step 3: Fix odszkodowania-wypadki-przy-pracy.html** — `bg-red-600` → `bg-[#1a6b3c]` (line 263, avatar initials circle)

- [ ] **Step 4: Commit**

  ```bash
  git add 404.html polityka-prywatnosci.html odszkodowania-wypadki-przy-pracy.html
  git commit -m "fix: replace red classes with green on 404, polityka-prywatnosci, wypadki-przy-pracy"
  ```

---

### Task 9: Verification

- [ ] **Step 1: Run the grep verification command**

  ```bash
  grep -rn "red-[0-9]\|#dc2626\|#b91c1c\|#991b1b" *.html css/*.css js/tailwind-config.js \
    | grep -v "error\|EF4444\|red-500\|border-red-500\|text-red-500\|bg-red-500"
  ```

  Expected: empty output.

- [ ] **Step 2: Run tests**

  ```bash
  npm test
  ```

  Expected: all tests pass (no logic changed).

- [ ] **Step 3: Start local server and do a visual check**

  ```bash
  python3 -m http.server 1111
  ```

  Open `http://localhost:1111/uslugi.html` — verify:
  - All buttons are green, not red
  - The 6 service tiles have a subtle green bottom line
  - Form focus rings are green
  - No red UI elements visible (except validation error messages)

  Open `http://localhost:1111/jak-dzialamy.html` — verify icon backgrounds are green-tinted, not red-tinted.

- [ ] **Step 4: Final commit if any cleanup needed, then done**
