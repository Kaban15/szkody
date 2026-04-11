'use strict';

/**
 * Form validation utilities for quiz and contact forms.
 * Polish phone format: 9 digits, optionally prefixed with +48.
 */

const PHONE_REGEX = /^(\+48)?[0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(value) {
    return value.trim().length >= 2;
}

function validatePhone(value) {
    const cleaned = value.replace(/[\s-]/g, '');
    return PHONE_REGEX.test(cleaned);
}

function validateEmail(value) {
    if (!value.trim()) return true; // optional
    return EMAIL_REGEX.test(value.trim());
}

function showError(inputId) {
    const errorEl = document.getElementById(`${inputId}-error`);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.classList.remove('hidden');
    if (inputEl) {
        inputEl.classList.add('border-cta');
        inputEl.classList.remove('border-green-500');
    }
}

function hideError(inputId) {
    const errorEl = document.getElementById(`${inputId}-error`);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('border-cta');
}

function showSuccess(inputId) {
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
        inputEl.classList.remove('border-cta');
        inputEl.classList.add('border-green-500');
    }
    hideError(inputId);
}

/**
 * Attach live validation to a field.
 * - blur: validate and show error or success border
 * - input: clear error as user corrects (don't show new errors mid-typing)
 */
function attachLiveValidation(fieldId, validateFn) {
    const el = document.getElementById(fieldId);
    if (!el) return;

    el.addEventListener('blur', () => {
        const value = el.value;
        if (!value.trim()) {
            // Empty on blur — remove success, don't show error yet
            el.classList.remove('border-green-500');
            return;
        }
        if (validateFn(value)) {
            showSuccess(fieldId);
        } else {
            showError(fieldId);
        }
    });

    el.addEventListener('input', () => {
        // Clear error while typing if value becomes valid
        if (el.classList.contains('border-cta') && validateFn(el.value)) {
            showSuccess(fieldId);
        }
    });
}

/**
 * n8n Webhook configuration.
 * All form data goes to n8n, which routes to Airtable CRM + notifications.
 * Replace placeholder with your n8n webhook URL after setup.
 */
var WEBHOOK_URL = 'https://n8n.kaban.click/webhook/szkody-form';

/**
 * Send form data to n8n webhook.
 * Single POST — n8n handles routing (Airtable, notifications, etc.).
 * Fire-and-forget — success UI shows regardless of API result.
 */
function sendToWebhook(formData, tag) {
    // Honeypot: if hidden field is filled, it's a spam bot — discard silently
    var honeypot = document.querySelector('.hp-field');
    if (honeypot && honeypot.value) return;

    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: formData.name || '',
            email: formData.email || '',
            phone: formData.phone || '',
            message: formData.message || '',
            tag: tag,
            source_url: window.location.pathname,
            timestamp: new Date().toISOString(),
        }),
    }).catch(function (err) {
        if (typeof console !== 'undefined') console.warn('Webhook error:', err);
    });
}

function validateQuizForm() {
    let isValid = true;

    if (!validateName(document.getElementById('quiz-name').value)) {
        showError('quiz-name');
        isValid = false;
    } else {
        hideError('quiz-name');
    }

    if (!validatePhone(document.getElementById('quiz-phone').value)) {
        showError('quiz-phone');
        isValid = false;
    } else {
        hideError('quiz-phone');
    }

    if (!validateEmail(document.getElementById('quiz-email').value)) {
        showError('quiz-email');
        isValid = false;
    } else {
        hideError('quiz-email');
    }

    if (!document.getElementById('quiz-consent').checked) {
        isValid = false;
    }

    return isValid;
}

/**
 * Generic form submission handler with validation, disable, and template-based success.
 * @param {Object} options
 * @param {HTMLFormElement} options.form - The form element
 * @param {Array<{id: string, validate: Function}>} options.fields - Fields to validate
 * @param {string} [options.consentId] - Checkbox consent element ID
 * @param {string} [options.templateId] - Success template element ID
 * @param {Function} [options.onSuccess] - Callback after success shown
 * @param {string} [options.tag] - Tag for CRM source tracking (e.g. 'quiz', 'kalkulator', 'kontakt')
 */
function submitForm({ form, fields, consentId, templateId, onSuccess, tag, chatwootTag }) {
    let isValid = true;

    fields.forEach(({ id, validate }) => {
        const value = document.getElementById(id).value;
        if (!validate(value)) {
            showError(id);
            isValid = false;
        } else {
            hideError(id);
        }
    });

    if (consentId && !document.getElementById(consentId).checked) {
        isValid = false;
    }

    if (!isValid) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="v2-spinner"></span>';
    }

    // Collect form data for Chatwoot
    const formData = {};
    fields.forEach(function (f) {
        const el = document.getElementById(f.id);
        if (el) {
            const key = f.id.replace(/^(quiz-|calc-|contact-|pf-)/, '');
            formData[key] = el.value;
        }
    });

    // Send to n8n webhook (fire-and-forget)
    var webhookTag = tag || chatwootTag; // chatwootTag kept for backwards compat
    if (webhookTag) {
        sendToWebhook(formData, webhookTag);
    }

    // Show success UI immediately (don't wait for API)
    if (templateId) {
        const template = document.getElementById(templateId);
        if (template) {
            form.replaceChildren(template.content.cloneNode(true));
        }
    }
    if (onSuccess) onSuccess();
}

// Export for use in other modules
window.formValidation = { validateName, validatePhone, validateEmail, validateQuizForm, showError, hideError, showSuccess, attachLiveValidation, submitForm, sendToWebhook };
