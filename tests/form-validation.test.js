import { describe, it, expect, beforeAll } from 'vitest';

// Load the script — it assigns to window.formValidation
beforeAll(async () => {
  const fs = await import('fs');
  const script = fs.readFileSync('js/form-validation.js', 'utf-8');
  // Execute in jsdom global scope
  const fn = new Function(script);
  fn();
});

describe('validateName', () => {
  it('accepts names with 2+ characters', () => {
    expect(window.formValidation.validateName('Jan')).toBe(true);
    expect(window.formValidation.validateName('AB')).toBe(true);
  });

  it('rejects names shorter than 2 characters', () => {
    expect(window.formValidation.validateName('A')).toBe(false);
    expect(window.formValidation.validateName('')).toBe(false);
  });

  it('trims whitespace before checking', () => {
    expect(window.formValidation.validateName('  A  ')).toBe(false);
    expect(window.formValidation.validateName('  AB  ')).toBe(true);
  });
});

describe('validatePhone', () => {
  it('accepts 9-digit Polish numbers', () => {
    expect(window.formValidation.validatePhone('123456789')).toBe(true);
  });

  it('accepts numbers with +48 prefix', () => {
    expect(window.formValidation.validatePhone('+48123456789')).toBe(true);
  });

  it('accepts numbers with spaces and dashes', () => {
    expect(window.formValidation.validatePhone('123 456 789')).toBe(true);
    expect(window.formValidation.validatePhone('123-456-789')).toBe(true);
    expect(window.formValidation.validatePhone('+48 123-456-789')).toBe(true);
  });

  it('rejects numbers with wrong digit count', () => {
    expect(window.formValidation.validatePhone('12345678')).toBe(false);
    expect(window.formValidation.validatePhone('1234567890')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(window.formValidation.validatePhone('')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(window.formValidation.validatePhone('abcdefghi')).toBe(false);
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(window.formValidation.validateEmail('test@example.com')).toBe(true);
    expect(window.formValidation.validateEmail('a@b.pl')).toBe(true);
  });

  it('accepts empty input (email is optional)', () => {
    expect(window.formValidation.validateEmail('')).toBe(true);
    expect(window.formValidation.validateEmail('   ')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(window.formValidation.validateEmail('notanemail')).toBe(false);
    expect(window.formValidation.validateEmail('missing@domain')).toBe(false);
    expect(window.formValidation.validateEmail('@nodomain.com')).toBe(false);
  });
});
