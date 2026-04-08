'use strict';

/**
 * Kalkulator odszkodowań — interactive calculator with base amounts and multipliers.
 * Algorithm: sum base amounts, apply treatment/work/disability multipliers, show as range.
 */

const CALC_CONSTANTS = {
    DAYS_IN_YEAR: 365,
    PERCENT_MAX: 100,
    TREATMENT_RATE: 0.5,
    TREATMENT_CAP: 1.5,
    WORK_RATE: 0.8,
    WORK_CAP: 1.8,
    DISABILITY_RATE: 2.0,
    DISABILITY_CAP: 3.0,
    RANGE_LOW: 0.7,
    RANGE_HIGH: 1.3,
    ROUNDING: 1000,
};

document.addEventListener('DOMContentLoaded', () => {
    const state = { eventType: null, injuries: new Map() };

    // Cache all DOM elements used in hot path
    const treatmentSlider = document.getElementById('calc-treatment');
    const workSlider = document.getElementById('calc-work');
    const disabilitySlider = document.getElementById('calc-disability');
    const treatmentLabel = document.getElementById('calc-treatment-value');
    const workLabel = document.getElementById('calc-work-value');
    const disabilityLabel = document.getElementById('calc-disability-value');
    const resultEl = document.getElementById('calc-result');
    const emptyEl = document.getElementById('calc-empty');
    const resultMinEl = document.getElementById('calc-result-min');
    const resultMaxEl = document.getElementById('calc-result-max');
    const step2El = document.getElementById('calc-step-2');
    const step3El = document.getElementById('calc-step-3');
    const injuryHint = document.getElementById('calc-injury-hint');
    const formatNum = n => n.toLocaleString('pl-PL');

    const eventOptions = document.querySelectorAll('.calc-event-option');
    eventOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            eventOptions.forEach(o => {
                o.classList.remove('border-gold', 'bg-gold/10');
                o.classList.add('border-white/10');
            });
            btn.classList.remove('border-white/10');
            btn.classList.add('border-gold', 'bg-gold/10');
            state.eventType = btn.dataset.value;

            if (step2El) step2El.classList.remove('hidden');
            if (step3El) step3El.classList.remove('hidden');
            if (window.trackEvent) window.trackEvent('calculator_used', { type: btn.dataset.value });
            recalculate();
        });
    });

    document.querySelectorAll('.calc-injury-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.value;
            if (state.injuries.has(val)) {
                state.injuries.delete(val);
                btn.classList.remove('border-gold', 'bg-gold/10');
                btn.classList.add('border-white/10');
            } else {
                // Store base amounts at click time to avoid DOM queries in recalculate
                state.injuries.set(val, {
                    min: parseInt(btn.dataset.min),
                    max: parseInt(btn.dataset.max)
                });
                btn.classList.remove('border-white/10');
                btn.classList.add('border-gold', 'bg-gold/10');
            }
            if (injuryHint) injuryHint.classList.toggle('hidden', state.injuries.size > 0);
            recalculate();
        });
    });

    [treatmentSlider, workSlider, disabilitySlider].forEach(slider => {
        if (slider) slider.addEventListener('input', recalculate);
    });

    function recalculate() {
        const treatment = parseInt(treatmentSlider?.value || 0);
        const work = parseInt(workSlider?.value || 0);
        const disability = parseInt(disabilitySlider?.value || 0);

        if (treatmentLabel) treatmentLabel.textContent = `${treatment} dni`;
        if (workLabel) workLabel.textContent = `${work} dni`;
        if (disabilityLabel) disabilityLabel.textContent = `${disability}%`;

        if (state.injuries.size === 0) {
            resultEl.classList.add('hidden');
            if (state.eventType) emptyEl.classList.remove('hidden');
            return;
        }

        emptyEl.classList.add('hidden');

        let baseMin = 0;
        let baseMax = 0;
        state.injuries.forEach(({ min, max }) => {
            baseMin += min;
            baseMax += max;
        });

        const { DAYS_IN_YEAR, PERCENT_MAX, TREATMENT_RATE, TREATMENT_CAP, WORK_RATE, WORK_CAP, DISABILITY_RATE, DISABILITY_CAP, RANGE_LOW, RANGE_HIGH, ROUNDING } = CALC_CONSTANTS;
        const treatmentMult = Math.min(1.0 + (treatment / DAYS_IN_YEAR) * TREATMENT_RATE, TREATMENT_CAP);
        const workMult = Math.min(1.0 + (work / DAYS_IN_YEAR) * WORK_RATE, WORK_CAP);
        const disabilityMult = Math.min(1.0 + (disability / PERCENT_MAX) * DISABILITY_RATE, DISABILITY_CAP);
        const totalMult = treatmentMult * workMult * disabilityMult;

        const calcMin = Math.round((baseMin * totalMult * RANGE_LOW) / ROUNDING) * ROUNDING;
        const calcMax = Math.round((baseMax * totalMult * RANGE_HIGH) / ROUNDING) * ROUNDING;

        resultMinEl.textContent = formatNum(calcMin);
        resultMaxEl.textContent = formatNum(calcMax);
        resultEl.classList.remove('hidden');

        if (window.trackEvent) window.trackEvent('calculator_result_shown', { min: calcMin, max: calcMax });
    }

    // Live validation on calculator CTA fields
    window.formValidation.attachLiveValidation('calc-name', window.formValidation.validateName);
    window.formValidation.attachLiveValidation('calc-phone', window.formValidation.validatePhone);

    const ctaForm = document.getElementById('calc-cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.formValidation.submitForm({
                form: ctaForm,
                fields: [
                    { id: 'calc-name', validate: window.formValidation.validateName },
                    { id: 'calc-phone', validate: window.formValidation.validatePhone },
                ],
                consentId: 'calc-consent',
                templateId: 'calc-success-template',
                onSuccess: () => { if (window.trackEvent) window.trackEvent('calculator_cta_clicked'); },
            });
        });
    }
});
