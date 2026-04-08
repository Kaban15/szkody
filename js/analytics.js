'use strict';

/**
 * GA4 event tracking wrapper. Safe to call before GA4 loads (events are no-ops).
 */

window.trackEvent = function(eventName, params) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
    }
};

// Delegated click tracking — early-exit on first match
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="tel:"]');
    if (link) { window.trackEvent('phone_clicked', { number: link.href }); return; }

    const stickyLink = e.target.closest('#sticky-bar a');
    if (stickyLink) { window.trackEvent('cta_sticky_bar_clicked'); return; }

    const caseCard = e.target.closest('.case-card');
    if (caseCard) { window.trackEvent('case_study_viewed', { type: caseCard.dataset.type }); }
});

// FAQ toggle + Contact form
document.addEventListener('DOMContentLoaded', () => {
    // Cache FAQ elements once
    const allAnswers = document.querySelectorAll('.faq-answer');
    const allIcons = document.querySelectorAll('.faq-toggle [data-lucide]');

    document.querySelectorAll('.faq-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.nextElementSibling;
            const icon = btn.querySelector('[data-lucide]');
            const isOpen = answer.classList.contains('open');

            allAnswers.forEach(a => a.classList.remove('open'));
            allIcons.forEach(i => i.style.transform = '');

            if (!isOpen) {
                answer.classList.add('open');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.formValidation.submitForm({
                form: contactForm,
                fields: [
                    { id: 'contact-name', validate: window.formValidation.validateName },
                    { id: 'contact-phone', validate: window.formValidation.validatePhone },
                ],
                consentId: 'contact-consent',
                templateId: 'contact-success-template',
                onSuccess: () => window.trackEvent('form_submitted', { form: 'contact' }),
            });
        });
    }
});
