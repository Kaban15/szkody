# Chat Widget Persona & UX Upgrade — Design Spec

**Date:** 2026-04-13
**Status:** Approved
**Approach:** Full visual transposition of `components/20.md` (shadcn floating chat widget) to vanilla HTML/CSS/JS

## Overview

Upgrade the existing AI chat widget with:
1. **Persona "Nel z Lexperiens"** — avatar, name, subtitle in header and message bubbles
2. **Quick reply buttons** — 6 clickable topic buttons after greeting (covering all 5 services + "other")
3. **Enhanced UI** inspired by `components/20.md` — avatar-augmented bubbles, improved shadows, CSS-only animations
4. **Better conversation opening** — personalized greeting with Nel's name

No changes to backend logic (webhooks, session, history, rating, lead extraction).

## Reference

Visual reference: `components/20.md` — shadcn React `FloatingChatWidget` with:
- Avatar + status dot in header and per-message
- `rounded-2xl rounded-tl-none` / `rounded-tr-none` bubble shapes
- `shadow-2xl` + `ring-1` container styling
- Framer Motion spring animations (replicated via CSS-only)
- Agent name label above bot messages

## 1. Persona

- **Name:** Nel z Lexperiens
- **Subtitle:** Asystentka Prawna
- **Avatar file:** `/images/nel-avatar.png` (copied from `C:\Users\piotr\Downloads\Gemini_Generated_Image_2uw4d12uw4d12uw4.png`)
- Avatar is pre-cropped circular photo of professional woman in blazer
- Header avatar: 40×40px, `border-radius: 50%`, `border: 2px solid white`
- Message avatar: 32×32px, `border-radius: 50%`, `border: 1px solid #e5e7eb`
- Status dot: 10px, `#4ade80` (green), `border: 2px solid white`, absolute positioned bottom-right of avatar container

## 2. Header

```
┌──────────────────────────────────────┐
│ (avatar 40px)  Nel z Lexperiens   [X]│
│  ●online       Asystentka Prawna     │
└──────────────────────────────────────┘
```

- Background: `#29ABE2` (unchanged brand blue)
- Avatar container: `position: relative` (for status dot positioning)
- Title: "Nel z Lexperiens" — 15px, weight 600, white
- Subtitle: "Asystentka Prawna" — 11px, `rgba(255,255,255,0.8)`
- Close button: unchanged

### HTML structure change

Before:
```html
<div class="chat-header-info">
    <span class="chat-header-dot"></span>
    <span class="chat-header-title">Asystent kancelarii</span>
</div>
```

After:
```html
<div class="chat-header-info">
    <div class="chat-header-avatar-wrap">
        <img src="/images/nel-avatar.png" alt="Nel" class="chat-header-avatar">
        <span class="chat-header-status"></span>
    </div>
    <div class="chat-header-text">
        <span class="chat-header-title">Nel z Lexperiens</span>
        <span class="chat-header-subtitle">Asystentka Prawna</span>
    </div>
</div>
```

## 3. Greetings

Updated greeting text with Nel's name:

```javascript
var GREETINGS = {
    pl: 'Dzień dobry! Jestem Nel, asystentka prawna kancelarii Lexperiens. W czym mogę Ci pomóc?',
    en: 'Hello! I\'m Nel, a legal assistant at Lexperiens. How can I help you?',
    ua: 'Доброго дня! Я Нел, юридична асистентка Lexperiens. Чим можу допомогти?'
};
```

Greeting tooltip text change: "Porozmawiaj z nami" → "Cześć! Jestem Nel, w czym pomóc?"

## 4. Quick Reply Buttons

### Behavior
- Appear once after the first greeting message when `history.length === 1`
- Grid: 2 columns, gap 8px
- On click: insert button text as user message and send it
- After click OR after user types own message: remove quick replies from DOM
- On `renderHistory()` (returning to open chat): quick replies do NOT reappear

### Buttons (6 total)

| Emoji | PL Label | EN i18n key | EN Label | UA Label |
|-------|----------|-------------|----------|----------|
| 🚗 | Wypadek komunikacyjny | `chat.qr_komunikacyjny` | Car accident | Автомобільна аварія |
| 🏗️ | Wypadek w pracy | `chat.qr_praca` | Workplace accident | Нещасний випадок на роботі |
| 🏥 | Błąd medyczny | `chat.qr_medyczny` | Medical error | Медична помилка |
| 🕊️ | Śmierć bliskiej osoby | `chat.qr_smierc` | Death of a loved one | Смерть близької людини |
| 🌾 | Wypadek rolniczy | `chat.qr_rolniczy` | Agricultural accident | Нещасний випадок у сільському господарстві |
| 💬 | Inna sprawa | `chat.qr_inne` | Other matter | Інша справа |

### Styling
```css
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
```

## 5. Message Bubbles

### Bot message layout

```
(avatar 32px)  Nel           ← name label
               ┌──────────┐
               │ message   │ ← bubble
               └──────────┘
```

- Wrapper: `display: flex; gap: 8px; align-items: flex-start`
- Avatar: 32×32px, `border-radius: 50%`, `border: 1px solid #e5e7eb`
- Name label: "Nel", 11px, `#6b7280`, font-weight 500, above bubble
- Bubble: `background: #f5f5f5`, `border: 1px solid rgba(0,0,0,0.05)`, `border-radius: 16px 16px 16px 4px`
- Padding: 10px 14px

### User message layout

```
                 ┌──────────┐
                 │ message   │
                 └──────────┘
```

- No avatar
- `align-self: flex-end`
- `border-radius: 16px 16px 4px 16px`
- `background: #29ABE2`, `color: white`
- `box-shadow: 0 2px 8px rgba(41, 171, 226, 0.2)`

### Typing indicator
- Same layout as bot message: avatar Nel on left + bubble with 3 dots
- Avatar visible during typing

### System message
- Unchanged: centered, gray, small font

### addMessage() change

The `addMessage()` function must create different DOM structure for bot vs user:

**Bot message HTML:**
```html
<div class="chat-msg chat-msg-bot">
    <img src="/images/nel-avatar.png" alt="Nel" class="chat-msg-avatar">
    <div class="chat-msg-content">
        <span class="chat-msg-name">Nel</span>
        <div class="chat-msg-bubble">Message text here</div>
    </div>
</div>
```

**User message HTML:**
```html
<div class="chat-msg chat-msg-user">
    <div class="chat-msg-bubble">Message text here</div>
</div>
```

## 6. Container & Animations

### Container styling changes
- Shadow: `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)` (upgrade from current `0 8px 30px`)
- Border: `border: 1px solid rgba(0,0,0,0.08)` (new ring border)
- `border-radius: 16px` (unchanged)

### Open/close animation (CSS-only)

Replace `display: none/flex` with visibility-based approach:

```css
.chat-window {
    display: flex;           /* always flex */
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transform-origin: bottom right;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.2s ease-out,
                visibility 0s 0.3s;   /* delay visibility hide */
}

.chat-window.open {
    visibility: visible;
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0) scale(1);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.2s ease-out,
                visibility 0s 0s;     /* immediate visibility show */
}
```

### Message slide-in animation

```css
.chat-msg {
    animation: chatMsgIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes chatMsgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
```

### Bubble glow enhancement

```css
.chat-bubble:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(41, 171, 226, 0.45),
                0 0 20px rgba(41, 171, 226, 0.3);
}
```

## 7. Input Area

- Placeholder change: "Napisz wiadomość..." → "Napisz do Nel..."
- i18n key: `chat.input_placeholder`
- Focus enhancement: add inner ring glow `box-shadow: 0 0 0 3px rgba(41,171,226,0.1)` on focus
- Everything else unchanged

## 8. Greeting Tooltip

- Text: "Cześć! Jestem Nel, w czym pomóc?"
- i18n key: `chat.greeting_tooltip`
- Timing: unchanged (3s show, 8s hide)

## 9. i18n Keys (new)

Add to `lang/en.json`:
```json
{
    "chat.greeting_tooltip": "Hi! I'm Nel, how can I help?",
    "chat.input_placeholder": "Message Nel...",
    "chat.qr_komunikacyjny": "🚗 Car accident",
    "chat.qr_praca": "🏗️ Workplace accident",
    "chat.qr_medyczny": "🏥 Medical error",
    "chat.qr_smierc": "🕊️ Death of a loved one",
    "chat.qr_rolniczy": "🌾 Agricultural accident",
    "chat.qr_inne": "💬 Other matter"
}
```

Add to `lang/ua.json`:
```json
{
    "chat.greeting_tooltip": "Привіт! Я Нел, чим допомогти?",
    "chat.input_placeholder": "Напишіть Нел...",
    "chat.qr_komunikacyjny": "🚗 Автомобільна аварія",
    "chat.qr_praca": "🏗️ Нещасний випадок на роботі",
    "chat.qr_medyczny": "🏥 Медична помилка",
    "chat.qr_smierc": "🕊️ Смерть близької людини",
    "chat.qr_rolniczy": "🌾 Нещасний випадок у сільському господарстві",
    "chat.qr_inne": "💬 Інша справа"
}
```

## 10. Files Changed

| File | Change |
|------|--------|
| `images/nel-avatar.png` | New file — avatar photo |
| `js/chat-widget.js` | Header HTML, addMessage() restructure, quick replies logic, greeting texts, placeholder |
| `css/chat-widget.css` | New classes (avatar, quick replies, animations), updated container/bubble styles |
| `lang/en.json` | ~8 new chat.* keys |
| `lang/ua.json` | ~8 new chat.* keys |

## 11. What Does NOT Change

- Webhook URLs, session management, history, MAX_HISTORY
- Lead extraction (regex phone/name)
- Rating widget (thumbs up/down after lead_saved)
- Disclaimer bar
- Error handling / timeout / AbortController
- Cookie consent gating
- `sendToWebhook()` flow
- Mobile responsive breakpoint (480px)
- Keyboard: Enter send, Escape close
- Script load order
