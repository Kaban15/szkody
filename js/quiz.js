'use strict';

/**
 * Quiz diagnostyczny — 5-step interactive quiz with lead capture.
 * Handles step navigation, option selection, form submission, and business hours logic.
 */

const TOTAL_STEPS = 5;

const STEP_LABELS = {
    step1: { 'wypadek-samochodowy': 'Wypadek samochodowy', 'wypadek-motocyklowy': 'Wypadek motocyklowy', 'potracenie': 'Potrącenie pieszego', 'wypadek-praca': 'Wypadek przy pracy', 'blad-medyczny': 'Błąd medyczny', 'smierc-bliskiej': 'Śmierć bliskiej osoby', 'wypadek-rolnictwo': 'Wypadek w rolnictwie', 'inne': 'Inne' },
    step2: { '30dni': 'W ciągu 30 dni', '1-6mies': '1–6 miesięcy temu', '6-12mies': '6–12 miesięcy temu', '1-3lata': '1–3 lata temu', '3+lata': 'Ponad 3 lata temu' },
    step3: { 'szpital': 'Pobyt w szpitalu', 'ambulatorium': 'Leczenie ambulatoryjne', 'uszczerbek': 'Trwały uszczerbek', 'niezdolnosc': 'Niezdolność do pracy', 'smierc': 'Śmierć osoby bliskiej', 'szkoda-materialna': 'Szkoda materialna' },
    step4: { 'nie-zgloszone': 'Jeszcze nie zgłoszone', 'czekam': 'Czekam na decyzję', 'za-malo': 'Wypłacono za mało', 'odmowa': 'Odmowa wypłaty', 'nie-wiem': 'Nie wiem co robić' },
};

const BUSINESS_HOURS = {
    WEEKDAY_START: 8,
    WEEKDAY_END: 18,
    SATURDAY_START: 9,
    SATURDAY_END: 14,
};

document.addEventListener('DOMContentLoaded', () => {
    const state = { step: 1, answers: {} };

    // Business hours check
    function isBusinessHours() {
        const now = new Date();
        const day = now.getDay(); // 0=Sun
        const hour = now.getHours();
        const { WEEKDAY_START, WEEKDAY_END, SATURDAY_START, SATURDAY_END } = BUSINESS_HOURS;
        if (day >= 1 && day <= 5) return hour >= WEEKDAY_START && hour < WEEKDAY_END;
        if (day === 6) return hour >= SATURDAY_START && hour < SATURDAY_END;
        return false;
    }

    // Set callback info text
    const callbackInfo = document.getElementById('quiz-callback-info');
    if (callbackInfo) {
        callbackInfo.textContent = isBusinessHours()
            ? 'Oddzwonimy w ciągu 30 minut'
            : 'Oddzwonimy w następnym dniu roboczym';
    }

    // Update progress bar
    function updateProgress() {
        const percent = (state.step / TOTAL_STEPS) * 100;
        document.getElementById('quiz-progress').style.width = `${percent}%`;
        document.getElementById('quiz-current-step').textContent = state.step;
        document.getElementById('quiz-percent').textContent = `${Math.round(percent)}%`;
    }

    // Show specific step
    function showStep(stepNum) {
        document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
        const target = document.querySelector(`.quiz-step[data-step="${stepNum}"]`);
        if (target) {
            target.classList.remove('hidden');
            // Re-trigger animation
            target.style.animation = 'none';
            target.offsetHeight; // force reflow
            target.style.animation = '';
        }
        state.step = stepNum;
        updateProgress();
    }

    // Option selection (single select per step)
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const stepEl = btn.closest('.quiz-step');
            const stepNum = parseInt(stepEl.dataset.step);

            // Deselect others in same step
            stepEl.querySelectorAll('.quiz-option').forEach(o => {
                o.classList.remove('ring-2', 'ring-gold', 'shadow-md');
            });

            // Select this one
            btn.classList.add('ring-2', 'ring-gold', 'shadow-md');
            state.answers[`step${stepNum}`] = btn.dataset.value;

            // Enable next button
            const nextBtn = stepEl.querySelector('.quiz-next, [id^="quiz-next-"]');
            if (nextBtn) nextBtn.disabled = false;
        });
    });

    // Build summary for step 5
    function buildSummary() {
        const summaryEl = document.getElementById('quiz-summary');
        if (!summaryEl) return;
        summaryEl.replaceChildren();
        for (let i = 1; i <= 4; i++) {
            const val = state.answers[`step${i}`];
            const stepLabels = STEP_LABELS[`step${i}`];
            if (val && stepLabels) {
                const div = document.createElement('div');
                div.textContent = `\u2713 ${stepLabels[val] || val}`;
                summaryEl.appendChild(div);
            }
        }
    }

    // Next buttons
    document.querySelectorAll('.quiz-next, [id^="quiz-next-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.step < TOTAL_STEPS) {
                const nextStep = state.step + 1;
                showStep(nextStep);
                if (window.trackEvent) window.trackEvent(`quiz_step_${nextStep}`, { step: nextStep });
                if (nextStep === 5) buildSummary();
            }
        });
    });

    // Back buttons
    document.querySelectorAll('.quiz-back').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.step > 1) showStep(state.step - 1);
        });
    });

    // Live validation on quiz contact fields
    window.formValidation.attachLiveValidation('quiz-name', window.formValidation.validateName);
    window.formValidation.attachLiveValidation('quiz-phone', window.formValidation.validatePhone);
    window.formValidation.attachLiveValidation('quiz-email', window.formValidation.validateEmail);

    // Form submission
    const form = document.getElementById('quiz-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!window.formValidation.validateQuizForm()) return;

            const submitBtn = document.getElementById('quiz-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wysyłanie...';

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
        });
    }
});
