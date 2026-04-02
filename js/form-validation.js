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
    let valid = true;

    if (!validateName(document.getElementById('quiz-name').value)) {
        showError('quiz-name');
        valid = false;
    } else {
        hideError('quiz-name');
    }

    if (!validatePhone(document.getElementById('quiz-phone').value)) {
        showError('quiz-phone');
        valid = false;
    } else {
        hideError('quiz-phone');
    }

    if (!validateEmail(document.getElementById('quiz-email').value)) {
        showError('quiz-email');
        valid = false;
    } else {
        hideError('quiz-email');
    }

    if (!document.getElementById('quiz-consent').checked) {
        valid = false;
    }

    return valid;
}

// Export for use in other modules
window.formValidation = { validateName, validatePhone, validateEmail, validateQuizForm, showError, hideError };
