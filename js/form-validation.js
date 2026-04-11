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
 * Chatwoot Platform API configuration.
 * Replace placeholders with real values after Chatwoot setup.
 */
var CHATWOOT_BASE_URL = 'https://CHATWOOT_DOMAIN_PLACEHOLDER';
var CHATWOOT_API_TOKEN = 'CHATWOOT_API_TOKEN_PLACEHOLDER';
var CHATWOOT_ACCOUNT_ID = '1';
var CHATWOOT_INBOX_ID = 'CHATWOOT_INBOX_ID_PLACEHOLDER';

/**
 * Send form data to Chatwoot as a new contact + conversation.
 * Two-step: POST /contacts → POST /conversations.
 * Fire-and-forget — success UI shows regardless of API result.
 */
function sendToChatwoot(formData, tag) {
    // Honeypot: if hidden field is filled, it's a spam bot — discard silently
    var honeypot = document.querySelector('.hp-field');
    if (honeypot && honeypot.value) return;

    var apiBase = CHATWOOT_BASE_URL + '/api/v1/accounts/' + CHATWOOT_ACCOUNT_ID;
    var headers = {
        'Content-Type': 'application/json',
        'api_access_token': CHATWOOT_API_TOKEN,
    };

    // Step 1: Create contact
    fetch(apiBase + '/contacts', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            inbox_id: CHATWOOT_INBOX_ID,
            name: formData.name || '',
            email: formData.email || '',
            phone_number: formData.phone ? ('+48' + formData.phone.replace(/^\+48/, '')) : '',
            custom_attributes: {
                source_tag: tag,
                source_url: window.location.pathname,
            },
        }),
    })
    .then(function (res) { return res.json(); })
    .then(function (contact) {
        var contactId = contact.payload && contact.payload.contact && contact.payload.contact.id;
        if (!contactId) return;

        // Step 2: Create conversation with initial message
        return fetch(apiBase + '/conversations', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                contact_id: contactId,
                inbox_id: CHATWOOT_INBOX_ID,
                message: {
                    content: formData.message || ('Nowe zapytanie z formularza: ' + tag),
                },
                custom_attributes: { source_tag: tag },
            }),
        });
    })
    .catch(function (err) {
        if (typeof console !== 'undefined') console.warn('Chatwoot API error:', err);
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
 * @param {string} [options.chatwootTag] - Tag for CRM source tracking
 */
function submitForm({ form, fields, consentId, templateId, onSuccess, chatwootTag }) {
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

    // Send to Chatwoot (fire-and-forget)
    if (chatwootTag) {
        sendToChatwoot(formData, chatwootTag);
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
window.formValidation = { validateName, validatePhone, validateEmail, validateQuizForm, showError, hideError, showSuccess, attachLiveValidation, submitForm, sendToChatwoot };
