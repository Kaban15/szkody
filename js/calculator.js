/**
 * Kalkulator odszkodowań — interactive calculator with base amounts and multipliers.
 * Algorithm from spec: sum base amounts, apply treatment/work/disability multipliers, show as range.
 */

document.addEventListener('DOMContentLoaded', () => {
    const state = { eventType: null, injuries: new Set() };

    // Event type selection
    document.querySelectorAll('.calc-event-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.calc-event-option').forEach(o => {
                o.classList.remove('border-gold', 'bg-gold/10');
                o.classList.add('border-warm');
            });
            btn.classList.remove('border-warm');
            btn.classList.add('border-gold', 'bg-gold/10');
            state.eventType = btn.dataset.value;

            document.getElementById('calc-step-2').classList.remove('hidden');
            document.getElementById('calc-step-3').classList.remove('hidden');
            if (window.trackEvent) window.trackEvent('calculator_used', { type: btn.dataset.value });
            recalculate();
        });
    });

    // Injury multi-select (toggle)
    document.querySelectorAll('.calc-injury-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.value;
            if (state.injuries.has(val)) {
                state.injuries.delete(val);
                btn.classList.remove('border-gold', 'bg-gold/10');
                btn.classList.add('border-warm');
            } else {
                state.injuries.add(val);
                btn.classList.remove('border-warm');
                btn.classList.add('border-gold', 'bg-gold/10');
            }
            document.getElementById('calc-injury-hint').classList.toggle('hidden', state.injuries.size > 0);
            recalculate();
        });
    });

    // Slider listeners
    const treatmentSlider = document.getElementById('calc-treatment');
    const workSlider = document.getElementById('calc-work');
    const disabilitySlider = document.getElementById('calc-disability');

    [treatmentSlider, workSlider, disabilitySlider].forEach(slider => {
        if (slider) slider.addEventListener('input', recalculate);
    });

    function recalculate() {
        const treatment = parseInt(treatmentSlider?.value || 0);
        const work = parseInt(workSlider?.value || 0);
        const disability = parseInt(disabilitySlider?.value || 0);

        // Update labels
        const treatmentLabel = document.getElementById('calc-treatment-value');
        const workLabel = document.getElementById('calc-work-value');
        const disabilityLabel = document.getElementById('calc-disability-value');
        if (treatmentLabel) treatmentLabel.textContent = `${treatment} dni`;
        if (workLabel) workLabel.textContent = `${work} dni`;
        if (disabilityLabel) disabilityLabel.textContent = `${disability}%`;

        const resultEl = document.getElementById('calc-result');
        const emptyEl = document.getElementById('calc-empty');

        if (state.injuries.size === 0) {
            resultEl.classList.add('hidden');
            if (state.eventType) emptyEl.classList.remove('hidden');
            return;
        }

        emptyEl.classList.add('hidden');

        // Sum base amounts
        let baseMin = 0;
        let baseMax = 0;
        state.injuries.forEach(injury => {
            const btn = document.querySelector(`.calc-injury-option[data-value="${injury}"]`);
            if (btn) {
                baseMin += parseInt(btn.dataset.min);
                baseMax += parseInt(btn.dataset.max);
            }
        });

        // Multipliers (capped)
        const treatmentMult = Math.min(1.0 + (treatment / 365) * 0.5, 1.5);
        const workMult = Math.min(1.0 + (work / 365) * 0.8, 1.8);
        const disabilityMult = Math.min(1.0 + (disability / 100) * 2.0, 3.0);

        const totalMult = treatmentMult * workMult * disabilityMult;

        // Apply multipliers and create range (0.7x - 1.3x)
        const calcMin = Math.round((baseMin * totalMult * 0.7) / 1000) * 1000;
        const calcMax = Math.round((baseMax * totalMult * 1.3) / 1000) * 1000;

        // Format with spaces (Polish number formatting)
        const formatNum = n => n.toLocaleString('pl-PL');

        document.getElementById('calc-result-min').textContent = formatNum(calcMin);
        document.getElementById('calc-result-max').textContent = formatNum(calcMax);
        resultEl.classList.remove('hidden');

        if (window.trackEvent) window.trackEvent('calculator_result_shown', { min: calcMin, max: calcMax });
    }

    // CTA form
    const ctaForm = document.getElementById('calc-cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('calc-name').value;
            const phone = document.getElementById('calc-phone').value;
            const consent = document.getElementById('calc-consent').checked;

            if (!window.formValidation.validateName(name) || !window.formValidation.validatePhone(phone) || !consent) {
                return;
            }

            // Simulate submission
            const btn = ctaForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Wysyłanie...';

            setTimeout(() => {
                ctaForm.innerHTML = '<div class="text-center"><div class="text-green-400 text-lg font-bold mb-2">Dziękujemy!</div><p class="text-white/60 text-sm">Oddzwonimy wkrótce z dokładną wyceną.</p></div>';
                if (window.trackEvent) window.trackEvent('calculator_cta_clicked');
            }, 1000);
        });
    }
});
