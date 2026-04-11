'use strict';

/**
 * AI Chat Widget for szkody.vercel.app
 * Bubble + chat window, talks to n8n webhook -> OpenAI GPT-4o-mini
 */
(function initChatWidget() {
    var WEBHOOK_URL = 'https://n8n.kaban.click/webhook/szkody-chat';
    var GREETING = 'Dzień dobry! Jestem asystentem kancelarii odszkodowawczej. W czym mogę pomóc?';
    var TIMEOUT_MS = 20000;
    var SESSION_KEY = 'szkody_chat';
    var MAX_HISTORY = 10;

    var sessionId = sessionStorage.getItem(SESSION_KEY + '_sid');
    if (!sessionId) {
        sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
        sessionStorage.setItem(SESSION_KEY + '_sid', sessionId);
    }

    var history = [];
    try {
        var stored = sessionStorage.getItem(SESSION_KEY + '_history');
        if (stored) history = JSON.parse(stored);
    } catch (e) { /* ignore */ }

    var isOpen = false;
    var isSending = false;
    var leadSaved = false;

    function createWidget() {
        var bubble = document.createElement('button');
        bubble.className = 'chat-bubble';
        bubble.setAttribute('aria-label', 'Otwórz czat');
        bubble.innerHTML = '<span class="chat-bubble-pulse"></span>' +
            '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>';

        var greetingEl = document.createElement('div');
        greetingEl.className = 'chat-greeting';
        greetingEl.textContent = 'Porozmawiaj z nami';

        var win = document.createElement('div');
        win.className = 'chat-window';
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', 'Czat z asystentem');
        win.innerHTML =
            '<div class="chat-header">' +
                '<div class="chat-header-info">' +
                    '<span class="chat-header-dot"></span>' +
                    '<span class="chat-header-title">Asystent kancelarii</span>' +
                '</div>' +
                '<button class="chat-header-close" aria-label="Zamknij czat">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
            '</div>' +
            '<div class="chat-disclaimer">Rozmowa jest analizowana w celu lepszej obsługi. <a href="/polityka-prywatnosci.html">Polityka prywatności</a></div>' +
            '<div class="chat-messages" aria-live="polite"></div>' +
            '<div class="chat-typing"><span></span><span></span><span></span></div>' +
            '<div class="chat-input-area">' +
                '<input type="text" class="chat-input" placeholder="Napisz wiadomość..." maxlength="500">' +
                '<button class="chat-send" aria-label="Wyślij">' +
                    '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
                '</button>' +
            '</div>';

        document.body.appendChild(bubble);
        document.body.appendChild(greetingEl);
        document.body.appendChild(win);

        var messagesEl = win.querySelector('.chat-messages');
        var typingEl = win.querySelector('.chat-typing');
        var inputEl = win.querySelector('.chat-input');
        var sendBtn = win.querySelector('.chat-send');
        var closeBtn = win.querySelector('.chat-header-close');

        setTimeout(function () {
            if (!isOpen) greetingEl.classList.add('visible');
        }, 3000);
        setTimeout(function () {
            greetingEl.classList.remove('visible');
        }, 8000);

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

        bubble.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen) toggleChat();
        });

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

        function renderHistory() {
            messagesEl.innerHTML = '';
            history.forEach(function (msg) {
                addMessage(msg.role === 'assistant' ? 'bot' : 'user', msg.content);
            });
            if (leadSaved) {
                addMessage('system', 'Dane przekazane specjali\u015bcie \u2713');
            }
        }

        function showTyping() { typingEl.classList.add('visible'); messagesEl.appendChild(typingEl); messagesEl.scrollTop = messagesEl.scrollHeight; }
        function hideTyping() { typingEl.classList.remove('visible'); }

        function saveHistory() {
            try {
                sessionStorage.setItem(SESSION_KEY + '_history', JSON.stringify(history));
            } catch (e) { /* quota exceeded */ }
        }

        function sendMessage() {
            var text = inputEl.value.trim();
            if (!text || isSending) return;

            addMessage('user', text);
            history.push({ role: 'user', content: text });
            if (history.length > MAX_HISTORY * 2) {
                history = history.slice(-MAX_HISTORY * 2);
            }
            saveHistory();

            inputEl.value = '';
            inputEl.focus();
            isSending = true;
            sendBtn.disabled = true;
            showTyping();

            var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var timeoutId = setTimeout(function () {
                if (controller) controller.abort();
            }, TIMEOUT_MS);

            var fetchOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: history.slice(-MAX_HISTORY),
                    session_id: sessionId,
                    page_url: window.location.pathname,
                }),
            };
            if (controller) fetchOptions.signal = controller.signal;

            fetch(WEBHOOK_URL, fetchOptions)
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    clearTimeout(timeoutId);
                    hideTyping();
                    var reply = data.reply || 'Przepraszam, nie udało się przetworzyć odpowiedzi.';
                    addMessage('bot', reply);
                    history.push({ role: 'assistant', content: reply });
                    saveHistory();
                    if (data.lead_saved && !leadSaved) {
                        leadSaved = true;
                        addMessage('system', 'Dane przekazane specjali\u015bcie \u2713');
                    }
                })
                .catch(function () {
                    clearTimeout(timeoutId);
                    hideTyping();
                    addMessage('bot', 'Przepraszam, mam chwilowy problem. Proszę spróbować za moment lub zadzwonić: +48 XXX XXX XXX');
                })
                .finally(function () {
                    isSending = false;
                    sendBtn.disabled = false;
                });
        }

        sendBtn.addEventListener('click', sendMessage);
        inputEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
