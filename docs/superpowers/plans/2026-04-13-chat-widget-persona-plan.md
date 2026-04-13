# Chat Widget Persona & UX Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the AI chat widget with persona "Nel z Lexperiens" (avatar, name, quick replies, enhanced bubbles, CSS animations).

**Architecture:** Pure frontend change — modify `js/chat-widget.js` (DOM structure, greeting text, quick reply logic) and `css/chat-widget.css` (avatar styles, animations, enhanced shadows). Add avatar image and i18n keys. No backend/webhook changes.

**Tech Stack:** Vanilla JS, CSS (no React, no bundler), i18n via `lang/*.json`

**Spec:** `docs/superpowers/specs/2026-04-13-chat-widget-persona-design.md`

---

### Task 1: Copy Avatar Image

**Files:**
- Create: `images/nel-avatar.png`

- [ ] **Step 1: Copy avatar to repo**

```bash
cp "C:\Users\piotr\Downloads\Gemini_Generated_Image_2uw4d12uw4d12uw4.png" images/nel-avatar-original.png
```

- [ ] **Step 2: Resize and optimize avatar (source is ~7.4MB — far too large for a 40/32px avatar)**

```bash
npx sharp-cli -i images/nel-avatar-original.png -o images/nel-avatar.png resize 200 200 --fit cover -- png --quality 85
```

If `sharp-cli` is unavailable, use ImageMagick or any tool to resize to 200×200px. Target size: under 50KB. Then delete the original:

```bash
rm images/nel-avatar-original.png
```

- [ ] **Step 3: Verify optimized file**

```bash
ls -la images/nel-avatar.png
```

Expected: File exists, under 100KB

- [ ] **Step 4: Commit**

```bash
git add images/nel-avatar.png
git commit -m "feat: add Nel avatar image for chat widget persona"
```

---

### Task 2: CSS — Avatar Styles, Container Upgrade, Animations

**Files:**
- Modify: `css/chat-widget.css`

All CSS changes in one task — they are tightly coupled and should be committed together.

- [ ] **Step 1: Update `.chat-window` base styles — replace `display: none` with visibility-based approach**

In `css/chat-widget.css`, replace the existing `.chat-window` rule (lines 74-88):

```css
/* BEFORE */
.chat-window {
    position: fixed;
    bottom: 90px;
    right: 24px;
    width: 380px;
    height: 520px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    z-index: 10000;
    display: none;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Plus Jakarta Sans', sans-serif;
}
```

```css
/* AFTER */
.chat-window {
    position: fixed;
    bottom: 90px;
    right: 24px;
    width: 380px;
    height: 520px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    border: 1px solid rgba(0,0,0,0.08);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Plus Jakarta Sans', sans-serif;
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transform-origin: bottom right;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.2s ease-out,
                visibility 0s 0.3s;
}
```

- [ ] **Step 2: Update `.chat-window.open` — replace `display: flex` with animation-compatible rules**

Replace the existing `.chat-window.open` rule (lines 90-92):

```css
/* BEFORE */
.chat-window.open {
    display: flex;
}
```

```css
/* AFTER */
.chat-window.open {
    visibility: visible;
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0) scale(1);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.2s ease-out,
                visibility 0s 0s;
}
```

- [ ] **Step 3: Update `.chat-bubble:hover` — add glow effect**

Replace the existing `.chat-bubble:hover` rule (lines 21-24):

```css
/* BEFORE */
.chat-bubble:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(41, 171, 226, 0.45);
}
```

```css
/* AFTER */
.chat-bubble:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(41, 171, 226, 0.45),
                0 0 20px rgba(41, 171, 226, 0.3);
}
```

- [ ] **Step 4: Add `.chat-bubble-hidden` class**

Add after the `.chat-bubble:focus-visible` rule (after line 29):

```css
.chat-bubble-hidden {
    display: none;
}
```

- [ ] **Step 5: Remove orphaned `.chat-header-dot` CSS rule**

The old `.chat-header-dot` element is replaced by `.chat-header-status` in the new header HTML. Remove the old rule (lines 110-116):

```css
/* REMOVE THIS */
.chat-header-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
    flex-shrink: 0;
}
```

- [ ] **Step 6: Add header avatar styles**

Add after the existing `.chat-header-close:focus-visible` rule (after line 142):

```css
/* Header avatar */
.chat-header-avatar-wrap {
    position: relative;
    flex-shrink: 0;
}

.chat-header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid white;
    object-fit: cover;
    background: #29ABE2;
}

.chat-header-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4ade80;
    border: 2px solid white;
}

.chat-header-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.chat-header-subtitle {
    font-size: 11px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.8);
}
```

- [ ] **Step 7: Update `.chat-msg-bot` — flex layout with avatar**

Replace the existing `.chat-msg-bot` rule (lines 176-180):

```css
/* BEFORE */
.chat-msg-bot {
    align-self: flex-start;
    background: #f0f0f0;
    color: #1a1a2e;
    border-bottom-left-radius: 4px;
}
```

```css
/* AFTER */
.chat-msg-bot {
    align-self: flex-start;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    background: none;
    max-width: 85%;
}
```

- [ ] **Step 8: Add message avatar, name label, and bubble styles**

Add after the updated `.chat-msg-bot` rule:

```css
.chat-msg-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    object-fit: cover;
    flex-shrink: 0;
    background: #29ABE2;
}

.chat-msg-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.chat-msg-name {
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
}

.chat-msg-bot .chat-msg-bubble {
    background: #f5f5f5;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px 16px 16px 4px;
    padding: 10px 14px;
    color: #1a1a2e;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
}
```

- [ ] **Step 9: Update `.chat-msg-user` — new border-radius and shadow**

Replace the existing `.chat-msg-user` rule (lines 182-187):

```css
/* BEFORE */
.chat-msg-user {
    align-self: flex-end;
    background: #29ABE2;
    color: white;
    border-bottom-right-radius: 4px;
}
```

```css
/* AFTER */
.chat-msg-user {
    align-self: flex-end;
}

.chat-msg-user .chat-msg-bubble {
    background: #29ABE2;
    color: white;
    border-radius: 16px 16px 4px 16px;
    padding: 10px 14px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    box-shadow: 0 2px 8px rgba(41, 171, 226, 0.2);
}
```

- [ ] **Step 10: Update `.chat-msg` base — remove bubble-specific styles now on sub-elements**

Replace the existing `.chat-msg` rule (lines 167-174):

```css
/* BEFORE */
.chat-msg {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
}
```

```css
/* AFTER */
.chat-msg {
    max-width: 80%;
}
```

- [ ] **Step 11: Add message slide-in animation**

Add after the `.chat-msg-user .chat-msg-bubble` rule:

```css
/* Message slide-in — only on new messages, not renderHistory() */
.chat-msg-animate {
    animation: chatMsgIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes chatMsgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 12: Add quick reply styles**

Add after the animation keyframes:

```css
/* Quick reply buttons */
.chat-quick-replies {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 16px 8px;
}

.chat-quick-reply {
    background: #f5f5f5;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    color: #1a1a2e;
}

.chat-quick-reply:hover {
    border-color: #29ABE2;
    background: rgba(41, 171, 226, 0.05);
}

.chat-quick-reply:focus-visible {
    outline: 2px solid #29ABE2;
    outline-offset: 2px;
}

.chat-quick-reply:active {
    transform: scale(0.97);
}
```

- [ ] **Step 13: Update `.chat-typing` — make it work inside bot message wrapper**

Replace the existing `.chat-typing` rule (lines 198-206):

```css
/* BEFORE */
.chat-typing {
    align-self: flex-start;
    display: none;
    gap: 4px;
    padding: 10px 14px;
    background: #f0f0f0;
    border-radius: 16px;
    border-bottom-left-radius: 4px;
}

.chat-typing.visible {
    display: flex;
}
```

```css
/* AFTER */
.chat-msg-typing {
    display: none;
}

.chat-msg-typing.visible {
    display: flex;
}

.chat-typing {
    display: flex;
    gap: 4px;
    padding: 10px 14px;
    background: #f5f5f5;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px 16px 16px 4px;
}
```

- [ ] **Step 14: Add input focus ring glow**

Add after the existing `.chat-input:focus` rule (lines 247-249):

```css
/* BEFORE */
.chat-input:focus {
    border-color: #29ABE2;
}
```

```css
/* AFTER */
.chat-input:focus {
    border-color: #29ABE2;
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
}
```

- [ ] **Step 15: Add mobile breakpoint for quick replies (< 360px)**

Add as a new, separate media query after the existing `@media (max-width: 480px)` block:

```css
@media (max-width: 360px) {
    .chat-quick-replies {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 16: Commit CSS changes**

```bash
git add css/chat-widget.css
git commit -m "feat: upgrade chat widget CSS — avatar styles, animations, quick replies, enhanced shadows"
```

---

### Task 3: JS — Header, Greetings, addMessage(), Typing Indicator

**Files:**
- Modify: `js/chat-widget.js`

- [ ] **Step 1: Update GREETINGS object (line 9-13)**

Replace:

```javascript
var GREETINGS = {
    pl: 'Dzień dobry! Jestem asystentem kancelarii odszkodowawczej. W czym mogę pomóc?',
    en: 'Hello! I am an assistant at a compensation law firm. How can I help you?',
    ua: 'Доброго дня! Я асистент юридичної фірми з відшкодувань. Чим можу допомогти?'
};
```

With:

```javascript
var GREETINGS = {
    pl: 'Dzień dobry! Jestem Nel, asystentka prawna kancelarii Lexperiens. W czym mogę Ci pomóc?',
    en: 'Hello! I\'m Nel, a legal assistant at Lexperiens. How can I help you?',
    ua: 'Доброго дня! Я Нел, юридична асистентка Lexperiens. Чим можу допомогти?'
};
```

- [ ] **Step 2: Update header HTML in `createWidget()` (line 56-65)**

Replace the `.chat-header` innerHTML portion:

```javascript
/* BEFORE */
'<div class="chat-header">' +
    '<div class="chat-header-info">' +
        '<span class="chat-header-dot"></span>' +
        '<span class="chat-header-title">Asystent kancelarii</span>' +
    '</div>' +
    '<button class="chat-header-close" aria-label="Zamknij czat">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>' +
'</div>' +
```

```javascript
/* AFTER */
'<div class="chat-header">' +
    '<div class="chat-header-info">' +
        '<div class="chat-header-avatar-wrap">' +
            '<img src="/images/nel-avatar.png" alt="Nel" class="chat-header-avatar">' +
            '<span class="chat-header-status"></span>' +
        '</div>' +
        '<div class="chat-header-text">' +
            '<span class="chat-header-title">Nel z Lexperiens</span>' +
            '<span class="chat-header-subtitle" data-i18n="chat.header_subtitle">Asystentka Prawna</span>' +
        '</div>' +
    '</div>' +
    '<button class="chat-header-close" aria-label="Zamknij czat">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>' +
'</div>' +
```

- [ ] **Step 3: Update `aria-label` on chat window (line 55)**

Replace:

```javascript
win.setAttribute('aria-label', 'Czat z asystentem');
```

With:

```javascript
win.setAttribute('aria-label', 'Czat z Nel');
```

- [ ] **Step 4: Update greeting tooltip text (line 50-51)**

Replace:

```javascript
greetingEl.textContent = 'Porozmawiaj z nami';
```

With:

```javascript
greetingEl.textContent = 'Cześć! Jestem Nel, w czym pomóc?';
greetingEl.setAttribute('data-i18n', 'chat.greeting_tooltip');
```

- [ ] **Step 5: Update input placeholder (line 70)**

Replace:

```javascript
'<input type="text" class="chat-input" placeholder="Napisz wiadomość..." maxlength="500">' +
```

With:

```javascript
'<input type="text" class="chat-input" placeholder="Napisz do Nel..." data-i18n-placeholder="chat.input_placeholder" maxlength="500">' +
```

- [ ] **Step 6: Replace the typing indicator HTML (line 68)**

Replace:

```javascript
'<div class="chat-typing"><span></span><span></span><span></span></div>' +
```

With:

```javascript
'<div class="chat-msg chat-msg-bot chat-msg-typing">' +
    '<img src="/images/nel-avatar.png" alt="Nel" class="chat-msg-avatar">' +
    '<div class="chat-msg-content">' +
        '<div class="chat-typing"><span></span><span></span><span></span></div>' +
    '</div>' +
'</div>' +
```

- [ ] **Step 7: Update `typingEl` selector (line 81)**

The `showTyping()`/`hideTyping()` functions stay unchanged — only the selector changes so `typingEl` points to the new `.chat-msg-typing` wrapper instead of `.chat-typing`. The `visible` class toggle works because CSS now uses `.chat-msg-typing.visible { display: flex; }`.

Replace:

```javascript
var typingEl = win.querySelector('.chat-typing');
```

With:

```javascript
var typingEl = win.querySelector('.chat-msg-typing');
```

- [ ] **Step 8: Rewrite `addMessage()` — different DOM structure for bot vs user (lines 120-130)**

Replace the existing `addMessage()` function:

```javascript
/* BEFORE */
function addMessage(type, text) {
    var div = document.createElement('div');
    if (type === 'system') {
        div.className = 'chat-msg chat-msg-system';
    } else {
        div.className = 'chat-msg ' + (type === 'bot' ? 'chat-msg-bot' : 'chat-msg-user');
    }
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}
```

```javascript
/* AFTER */
function addMessage(type, text, animate) {
    var div = document.createElement('div');
    if (type === 'system') {
        div.className = 'chat-msg chat-msg-system';
        div.textContent = text;
    } else if (type === 'bot') {
        div.className = 'chat-msg chat-msg-bot';
        var avatar = document.createElement('img');
        avatar.src = '/images/nel-avatar.png';
        avatar.alt = 'Nel';
        avatar.className = 'chat-msg-avatar';
        var content = document.createElement('div');
        content.className = 'chat-msg-content';
        var name = document.createElement('span');
        name.className = 'chat-msg-name';
        name.textContent = 'Nel';
        var bubbleEl = document.createElement('div');
        bubbleEl.className = 'chat-msg-bubble';
        bubbleEl.textContent = text;
        content.appendChild(name);
        content.appendChild(bubbleEl);
        div.appendChild(avatar);
        div.appendChild(content);
    } else {
        div.className = 'chat-msg chat-msg-user';
        var bubbleEl = document.createElement('div');
        bubbleEl.className = 'chat-msg-bubble';
        bubbleEl.textContent = text;
        div.appendChild(bubbleEl);
    }
    if (animate !== false) {
        div.classList.add('chat-msg-animate');
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    removeQuickReplies();
}
```

Key changes:
- Third parameter `animate` — default true (new messages animate), pass `false` from `renderHistory()` to skip animation
- Bot messages build avatar + name + bubble DOM structure
- User messages wrap text in `.chat-msg-bubble`
- Calls `removeQuickReplies()` on every message send (safe no-op if already removed)

- [ ] **Step 9: Update `renderHistory()` to pass `animate: false` (lines 188-196)**

Replace:

```javascript
/* BEFORE */
function renderHistory() {
    messagesEl.innerHTML = '';
    history.forEach(function (msg) {
        addMessage(msg.role === 'assistant' ? 'bot' : 'user', msg.content);
    });
    if (leadSaved) {
        addMessage('system', 'Dane przekazane specjali\u015bcie \u2713');
    }
}
```

```javascript
/* AFTER */
function renderHistory() {
    messagesEl.innerHTML = '';
    history.forEach(function (msg) {
        addMessage(msg.role === 'assistant' ? 'bot' : 'user', msg.content, false);
    });
    if (leadSaved) {
        addMessage('system', 'Dane przekazane specjali\u015bcie \u2713', false);
    }
}
```

- [ ] **Step 10: Update `toggleChat()` — replace `bubble.style.display` with class toggle (lines 93-111)**

Replace:

```javascript
/* BEFORE */
function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
        win.classList.add('open');
        greetingEl.classList.remove('visible');
        bubble.style.display = 'none';
        inputEl.focus();
        if (history.length === 0) {
            addMessage('bot', GREETING);
            history.push({ role: 'assistant', content: GREETING });
            saveHistory();
        } else {
            renderHistory();
        }
    } else {
        win.classList.remove('open');
        bubble.style.display = 'flex';
    }
}
```

```javascript
/* AFTER */
function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
        win.classList.add('open');
        greetingEl.classList.remove('visible');
        bubble.classList.add('chat-bubble-hidden');
        inputEl.focus();
        if (history.length === 0) {
            addMessage('bot', GREETING);
            history.push({ role: 'assistant', content: GREETING });
            saveHistory();
            showQuickReplies();
        } else {
            renderHistory();
        }
    } else {
        win.classList.remove('open');
        bubble.classList.remove('chat-bubble-hidden');
    }
}
```

Key changes:
- `bubble.style.display = 'none'` → `bubble.classList.add('chat-bubble-hidden')`
- `bubble.style.display = 'flex'` → `bubble.classList.remove('chat-bubble-hidden')`
- Added `showQuickReplies()` call after first greeting

- [ ] **Step 11: Commit JS header/greeting/addMessage/typing changes**

```bash
git add js/chat-widget.js
git commit -m "feat: chat widget persona — header avatar, greeting text, addMessage restructure, typing indicator"
```

---

### Task 4: JS — Quick Reply Buttons Logic

**Files:**
- Modify: `js/chat-widget.js`

- [ ] **Step 1: Add quick reply constants after GREETINGS (after line 13)**

Add after the `var RATING_KEY = ...` line:

```javascript
var QUICK_REPLIES = [
    { emoji: '🚗', text: 'Wypadek komunikacyjny', i18n: 'chat.qr_komunikacyjny' },
    { emoji: '🏗️', text: 'Wypadek w pracy', i18n: 'chat.qr_praca' },
    { emoji: '🏥', text: 'Błąd medyczny', i18n: 'chat.qr_medyczny' },
    { emoji: '🕊️', text: 'Śmierć bliskiej osoby', i18n: 'chat.qr_smierc' },
    { emoji: '🌾', text: 'Wypadek rolniczy', i18n: 'chat.qr_rolniczy' },
    { emoji: '💬', text: 'Inna sprawa', i18n: 'chat.qr_inne' }
];
```

- [ ] **Step 2: Add `showQuickReplies()` and `removeQuickReplies()` functions**

Add inside `createWidget()`, after the `hideTyping()` function:

```javascript
function removeQuickReplies() {
    var qr = messagesEl.querySelector('.chat-quick-replies');
    if (qr) qr.remove();
}

function showQuickReplies() {
    var container = document.createElement('div');
    container.className = 'chat-quick-replies';
    QUICK_REPLIES.forEach(function (item) {
        var btn = document.createElement('button');
        btn.className = 'chat-quick-reply';
        btn.setAttribute('data-i18n', item.i18n);
        btn.textContent = item.emoji + ' ' + item.text;
        btn.addEventListener('click', function () {
            var label = btn.textContent;
            removeQuickReplies();
            inputEl.value = label;
            sendMessage();
        });
        container.appendChild(btn);
    });
    messagesEl.appendChild(container);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    if (typeof window.i18nApply === 'function') window.i18nApply();
}
```

Note: `addMessage()` already calls `removeQuickReplies()` (added in Task 3, Step 8), so if the user types manually instead of clicking a button, quick replies are also removed.

- [ ] **Step 3: Commit quick reply logic**

```bash
git add js/chat-widget.js
git commit -m "feat: add quick reply buttons to chat widget — 6 topic options after greeting"
```

---

### Task 5: i18n — Add New Translation Keys

**Files:**
- Modify: `lang/en.json`
- Modify: `lang/ua.json`

- [ ] **Step 1: Add chat keys to `lang/en.json`**

Before the closing `}` of the file (after line 1057 `"chat.rate_thanks": "Thank you for your feedback"`), add a comma after the last existing entry and add:

```json
  "chat.rate_thanks": "Thank you for your feedback",
  "chat.header_subtitle": "Legal Assistant",
  "chat.greeting_tooltip": "Hi! I'm Nel, how can I help?",
  "chat.input_placeholder": "Message Nel...",
  "chat.qr_komunikacyjny": "🚗 Car accident",
  "chat.qr_praca": "🏗️ Workplace accident",
  "chat.qr_medyczny": "🏥 Medical error",
  "chat.qr_smierc": "🕊️ Death of a loved one",
  "chat.qr_rolniczy": "🌾 Agricultural accident",
  "chat.qr_inne": "💬 Other matter"
```

Note: The existing `"chat.rate_thanks"` line does NOT have a trailing comma — add one before the new keys.

- [ ] **Step 2: Add chat keys to `lang/ua.json`**

Same position — after `"chat.rate_thanks"` (line 1064), add comma and new keys:

```json
  "chat.rate_thanks": "Дякуємо за відгук",
  "chat.header_subtitle": "Юридична асистентка",
  "chat.greeting_tooltip": "Привіт! Я Нел, чим допомогти?",
  "chat.input_placeholder": "Напишіть Нел...",
  "chat.qr_komunikacyjny": "🚗 Автомобільна аварія",
  "chat.qr_praca": "🏗️ Нещасний випадок на роботі",
  "chat.qr_medyczny": "🏥 Медична помилка",
  "chat.qr_smierc": "🕊️ Смерть близької людини",
  "chat.qr_rolniczy": "🌾 Нещасний випадок у сільському господарстві",
  "chat.qr_inne": "💬 Інша справа"
```

- [ ] **Step 3: Validate JSON syntax**

```bash
node -e "JSON.parse(require('fs').readFileSync('lang/en.json','utf8')); console.log('en.json: OK')"
node -e "JSON.parse(require('fs').readFileSync('lang/ua.json','utf8')); console.log('ua.json: OK')"
```

Expected: Both print OK with no errors.

- [ ] **Step 4: Commit i18n changes**

```bash
git add lang/en.json lang/ua.json
git commit -m "feat: add i18n keys for chat widget persona — header, quick replies, tooltips"
```

---

### Task 6: Manual Testing & Verification

**Files:** None (read-only verification)

- [ ] **Step 1: Start local dev server**

```bash
python3 -m http.server 1111
```

Open `http://localhost:1111` in browser.

- [ ] **Step 2: Test chat open/close animation**

1. Click the chat bubble → window should animate in (scale + fade from bottom-right)
2. Click close → window should animate out (reverse)
3. Bubble should disappear when chat is open, reappear when closed
4. Bubble hover should show glow effect

- [ ] **Step 3: Test persona elements**

1. Header shows avatar (round photo), "Nel z Lexperiens", "Asystentka Prawna", green status dot
2. First bot message shows avatar + "Nel" name label + bubble with greeting
3. Greeting text contains "Nel" and "Lexperiens"

- [ ] **Step 4: Test quick replies**

1. Open chat for first time → greeting appears → 6 quick reply buttons appear below
2. Click any button → buttons disappear, message sent as user text
3. Bot responds normally after quick reply selection
4. Close and reopen chat → quick replies do NOT reappear (history renders without them)
5. Open fresh session (clear sessionStorage) → type own message before clicking any button → buttons disappear

- [ ] **Step 5: Test message bubbles**

1. Bot messages: avatar on left, "Nel" label, rounded bubble with bottom-left corner cut
2. User messages: no avatar, right-aligned, rounded bubble with bottom-right corner cut, blue with shadow
3. New messages should slide in from below (animation)
4. History messages (after close/reopen) should appear instantly without animation

- [ ] **Step 6: Test typing indicator**

1. Send a message → typing indicator shows with Nel's avatar + 3 bouncing dots
2. When response arrives → typing indicator disappears, bot message appears

- [ ] **Step 7: Test i18n (EN/UA)**

1. Switch language to EN via language switcher
2. Header subtitle should say "Legal Assistant"
3. Quick replies should show English labels (clear session first to get fresh greeting)
4. Input placeholder should say "Message Nel..."
5. Greeting tooltip should say "Hi! I'm Nel, how can I help?"
6. Repeat for UA

- [ ] **Step 8: Test mobile (< 480px viewport)**

1. Resize to 480px → chat window fills bottom, full width
2. Resize to 360px → quick reply buttons switch to 1-column layout
3. All elements remain readable and functional

- [ ] **Step 9: Test existing functionality preserved**

1. Send several messages → webhook responds normally
2. After lead is saved → system message "Dane przekazane specjaliście ✓" appears
3. Rating widget (thumbs up/down) appears after lead save
4. Escape key closes chat
5. Enter sends message

---

### Task 7: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update Chat Widget AI section in CLAUDE.md**

Find the `### Chat Widget AI` section and update the persona description. Change:

```
- **Persona:** "Asystent kancelarii" — empatyczny, profesjonalny. NIE mówi że jest AI.
```

To:

```
- **Persona:** "Nel z Lexperiens" (Asystentka Prawna) — empatyczna, profesjonalna. NIE mówi że jest AI. Avatar: `/images/nel-avatar.png`. Quick reply buttons (6 topics) after greeting.
```

- [ ] **Step 2: Add avatar to images table**

In the `### Zdjęcia (images/)` table, add a row:

```
| `nel-avatar.png` | Awatar "Nel" — kobieta w marynarce | Chat widget (nagłówek + dymki bota) |
```

- [ ] **Step 3: Commit docs update**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with chat widget persona details"
```
