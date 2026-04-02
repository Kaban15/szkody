/**
 * GA4 event tracking wrapper. Safe to call before GA4 loads (events are no-ops).
 */

window.trackEvent = function(eventName, params) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
    }
};

// Auto-track phone clicks
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="tel:"]');
    if (link) window.trackEvent('phone_clicked', { number: link.href });

    // Sticky bar clicks
    const stickyLink = e.target.closest('#sticky-bar a');
    if (stickyLink) window.trackEvent('cta_sticky_bar_clicked');

    // Case study views
    const caseCard = e.target.closest('.case-card');
    if (caseCard) window.trackEvent('case_study_viewed', { type: caseCard.dataset.type });
});

// FAQ toggle
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.nextElementSibling;
            const icon = btn.querySelector('[data-lucide]');
            const isOpen = answer.classList.contains('open');

            // Close all others
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
            document.querySelectorAll('.faq-toggle [data-lucide]').forEach(i => i.style.transform = '');

            if (!isOpen) {
                answer.classList.add('open');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const phone = document.getElementById('contact-phone').value;
            const consent = document.getElementById('contact-consent').checked;

            let valid = true;

            if (!window.formValidation.validateName(name)) {
                window.formValidation.showError('contact-name');
                valid = false;
            } else {
                window.formValidation.hideError('contact-name');
            }

            if (!window.formValidation.validatePhone(phone)) {
                window.formValidation.showError('contact-phone');
                valid = false;
            } else {
                window.formValidation.hideError('contact-phone');
            }

            if (!consent || !valid) return;

            const btn = document.getElementById('contact-submit');
            btn.disabled = true;
            btn.textContent = 'Wysyłanie...';

            setTimeout(() => {
                contactForm.innerHTML = `
                    <div class="text-center py-8">
                        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <h3 class="text-white font-heading text-xl font-bold mb-2">Dziękujemy!</h3>
                        <p class="text-white/60 text-sm">Skontaktujemy się z Tobą wkrótce.</p>
                    </div>`;
                window.trackEvent('form_submitted', { form: 'contact' });
            }, 1000);
        });
    }
});
