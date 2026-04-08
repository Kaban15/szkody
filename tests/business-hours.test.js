import { describe, it, expect, vi, afterEach } from 'vitest';

// Replicate isBusinessHours logic from quiz.js for unit testing
const BUSINESS_HOURS = {
  WEEKDAY_START: 8,
  WEEKDAY_END: 18,
  SATURDAY_START: 9,
  SATURDAY_END: 14,
};

function isBusinessHours(date) {
  const day = date.getDay();
  const hour = date.getHours();
  const { WEEKDAY_START, WEEKDAY_END, SATURDAY_START, SATURDAY_END } = BUSINESS_HOURS;
  if (day >= 1 && day <= 5) return hour >= WEEKDAY_START && hour < WEEKDAY_END;
  if (day === 6) return hour >= SATURDAY_START && hour < SATURDAY_END;
  return false;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isBusinessHours', () => {
  it('returns true during weekday working hours (Mon-Fri 8-17)', () => {
    // Wednesday 10:00
    expect(isBusinessHours(new Date(2026, 3, 8, 10, 0))).toBe(true);
    // Monday 8:00
    expect(isBusinessHours(new Date(2026, 3, 6, 8, 0))).toBe(true);
    // Friday 17:59
    expect(isBusinessHours(new Date(2026, 3, 10, 17, 59))).toBe(true);
  });

  it('returns false before/after weekday hours', () => {
    // Tuesday 7:59
    expect(isBusinessHours(new Date(2026, 3, 7, 7, 59))).toBe(false);
    // Thursday 18:00
    expect(isBusinessHours(new Date(2026, 3, 9, 18, 0))).toBe(false);
  });

  it('returns true during Saturday hours (9-13)', () => {
    // Saturday 9:00
    expect(isBusinessHours(new Date(2026, 3, 11, 9, 0))).toBe(true);
    // Saturday 13:59
    expect(isBusinessHours(new Date(2026, 3, 11, 13, 59))).toBe(true);
  });

  it('returns false outside Saturday hours', () => {
    // Saturday 8:59
    expect(isBusinessHours(new Date(2026, 3, 11, 8, 59))).toBe(false);
    // Saturday 14:00
    expect(isBusinessHours(new Date(2026, 3, 11, 14, 0))).toBe(false);
  });

  it('returns false on Sunday', () => {
    // Sunday 12:00
    expect(isBusinessHours(new Date(2026, 3, 12, 12, 0))).toBe(false);
  });
});
