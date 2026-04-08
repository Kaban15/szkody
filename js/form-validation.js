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
    if (inputEl) inputEl.classList.add('border-cta');
}

function hideError(inputId) {
    const errorEl = document.getElementById(`${inputId}-error`);
    const inputEl = document.getElementById(inputId);
    if (errorEl) errorEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('border-cta');
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
 * @param {number} [options.delay=1000] - Simulated delay in ms
 */
function submitForm({ form, fields, consentId, templateId, onSuccess, delay = 1000 }) {
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
        btn.textContent = 'Wysyłanie...';
    }

    setTimeout(() => {
        if (templateId) {
            const template = document.getElementById(templateId);
            if (template) {
                form.replaceChildren(template.content.cloneNode(true));
            }
        }
        if (onSuccess) onSuccess();
    }, delay);
}

// Export for use in other modules
window.formValidation = { validateName, validatePhone, validateEmail, validateQuizForm, showError, hideError, submitForm };
