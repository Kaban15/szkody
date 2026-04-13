'use strict';

/**
 * AI Chat Widget for szkody.vercel.app
 * Bubble + chat window, talks to n8n webhook -> OpenAI GPT-4o-mini
 */
(function initChatWidget() {
    var WEBHOOK_URL = 'https://n8n.kaban.click/webhook/szkody-chat';
    var GREETINGS = {
        pl: 'Dzień dobry! Jestem Nel, asystentka prawna kancelarii Lexperiens. W czym mogę Ci pomóc?',
        en: 'Hello! I\'m Nel, a legal assistant at Lexperiens. How can I help you?',
        ua: 'Доброго дня! Я Нел, юридична асистентка Lexperiens. Чим можу допомогти?'
    };
    var TIMEOUT_MS = 20000;
    var SESSION_KEY = 'szkody_chat';
    var MAX_HISTORY = 30;
    var RATING_WEBHOOK = 'https://n8n.kaban.click/webhook/szkody-chat-rating';
    var RATING_KEY = SESSION_KEY + '_rated';

    function getLang() { return localStorage.getItem('lang') || 'pl'; }
    var GREETING = GREETINGS[getLang()] || GREETINGS.pl;

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
        greetingEl.textContent = 'Cześć! Jestem Nel, w czym pomóc?';
        greetingEl.setAttribute('data-i18n', 'chat.greeting_tooltip');

        var win = document.createElement('div');
        win.className = 'chat-window';
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', 'Czat z Nel');
        win.innerHTML =
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
            '<div class="chat-disclaimer">Rozmowa jest analizowana w celu lepszej obsługi. <a href="/polityka-prywatnosci.html">Polityka prywatności</a></div>' +
            '<div class="chat-messages" aria-live="polite"></div>' +
            '<div class="chat-msg chat-msg-bot chat-msg-typing">' +
                '<img src="/images/nel-avatar.png" alt="Nel" class="chat-msg-avatar">' +
                '<div class="chat-msg-content">' +
                    '<div class="chat-typing"><span></span><span></span><span></span></div>' +
                '</div>' +
            '</div>' +
            '<div class="chat-input-area">' +
                '<input type="text" class="chat-input" placeholder="Napisz do Nel..." data-i18n-placeholder="chat.input_placeholder" maxlength="500">' +
                '<button class="chat-send" aria-label="Wyślij">' +
                    '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
                '</button>' +
            '</div>';

        document.body.appendChild(bubble);
        document.body.appendChild(greetingEl);
        document.body.appendChild(win);

        var messagesEl = win.querySelector('.chat-messages');
        var typingEl = win.querySelector('.chat-msg-typing');
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

        bubble.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen) toggleChat();
        });

        function removeQuickReplies() {
            var qr = messagesEl.querySelector('.chat-quick-replies');
            if (qr) qr.remove();
        }

        function showQuickReplies() {}

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

        function showRating() {
            if (sessionStorage.getItem(RATING_KEY)) return;
            var lang = getLang();
            var questions = {
                pl: 'Czy rozmowa była pomocna?',
                en: 'Was this conversation helpful?',
                ua: '\u0427\u0438 \u0431\u0443\u043b\u0430 \u0446\u044f \u0440\u043e\u0437\u043c\u043e\u0432\u0430 \u043a\u043e\u0440\u0438\u0441\u043d\u043e\u044e?'
            };
            var thanks = {
                pl: 'Dziękujemy za opinię',
                en: 'Thank you for your feedback',
                ua: '\u0414\u044f\u043a\u0443\u0454\u043c\u043e \u0437\u0430 \u0432\u0456\u0434\u0433\u0443\u043a'
            };
            var ratingDiv = document.createElement('div');
            ratingDiv.className = 'chat-rating';
            var questionSpan = document.createElement('span');
            questionSpan.className = 'chat-rating-question';
            questionSpan.setAttribute('data-i18n', 'chat.rate_question');
            questionSpan.textContent = questions[lang] || questions.pl;
            ratingDiv.appendChild(questionSpan);
            var btnUp = document.createElement('button');
            btnUp.className = 'chat-rating-btn';
            btnUp.setAttribute('data-rating', '1');
            btnUp.setAttribute('aria-label', 'Thumbs up');
            btnUp.textContent = '\uD83D\uDC4D';
            ratingDiv.appendChild(btnUp);
            var btnDown = document.createElement('button');
            btnDown.className = 'chat-rating-btn';
            btnDown.setAttribute('data-rating', '-1');
            btnDown.setAttribute('aria-label', 'Thumbs down');
            btnDown.textContent = '\uD83D\uDC4E';
            ratingDiv.appendChild(btnDown);
            messagesEl.appendChild(ratingDiv);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            ratingDiv.querySelectorAll('.chat-rating-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var rating = parseInt(btn.getAttribute('data-rating'));
                    btn.classList.add('selected');
                    ratingDiv.innerHTML = '';
                    var thanksSpan = document.createElement('span');
                    thanksSpan.className = 'chat-rating-thanks';
                    thanksSpan.setAttribute('data-i18n', 'chat.rate_thanks');
                    thanksSpan.textContent = thanks[lang] || thanks.pl;
                    ratingDiv.appendChild(thanksSpan);
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

        function renderHistory() {
            messagesEl.innerHTML = '';
            history.forEach(function (msg) {
                addMessage(msg.role === 'assistant' ? 'bot' : 'user', msg.content, false);
            });
            if (leadSaved) {
                addMessage('system', 'Dane przekazane specjali\u015bcie \u2713', false);
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
                    lang: getLang(),
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
                        setTimeout(function () { showRating(); }, 1000);
                    }
                })
                .catch(function () {
                    clearTimeout(timeoutId);
                    hideTyping();
                    addMessage('bot', 'Przepraszam, mam chwilowy problem. Proszę spróbować za moment lub zadzwonić: 61 893 75 04');
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
