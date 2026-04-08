import { describe, it, expect } from 'vitest';

// Replicate the calculator multiplier logic for unit testing
// These constants mirror CALC_CONSTANTS in calculator.js
const CALC = {
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

function calculateMultiplier(treatment, work, disability) {
  const treatmentMult = Math.min(1.0 + (treatment / CALC.DAYS_IN_YEAR) * CALC.TREATMENT_RATE, CALC.TREATMENT_CAP);
  const workMult = Math.min(1.0 + (work / CALC.DAYS_IN_YEAR) * CALC.WORK_RATE, CALC.WORK_CAP);
  const disabilityMult = Math.min(1.0 + (disability / CALC.PERCENT_MAX) * CALC.DISABILITY_RATE, CALC.DISABILITY_CAP);
  return treatmentMult * workMult * disabilityMult;
}

function calculateRange(baseMin, baseMax, treatment, work, disability) {
  const totalMult = calculateMultiplier(treatment, work, disability);
  const calcMin = Math.round((baseMin * totalMult * CALC.RANGE_LOW) / CALC.ROUNDING) * CALC.ROUNDING;
  const calcMax = Math.round((baseMax * totalMult * CALC.RANGE_HIGH) / CALC.ROUNDING) * CALC.ROUNDING;
  return { min: calcMin, max: calcMax };
}

describe('calculator multipliers', () => {
  it('returns base multiplier of 1.0 when all sliders are at zero', () => {
    const mult = calculateMultiplier(0, 0, 0);
    expect(mult).toBe(1.0);
  });

  it('caps treatment multiplier at TREATMENT_CAP', () => {
    // 999 days >> 365, so rate exceeds cap
    const mult = calculateMultiplier(999, 0, 0);
    expect(mult).toBe(CALC.TREATMENT_CAP);
  });

  it('caps work multiplier at WORK_CAP', () => {
    const mult = calculateMultiplier(0, 999, 0);
    expect(mult).toBe(CALC.WORK_CAP);
  });

  it('caps disability multiplier at DISABILITY_CAP', () => {
    const mult = calculateMultiplier(0, 0, 100);
    expect(mult).toBe(CALC.DISABILITY_CAP);
  });

  it('combines all multipliers multiplicatively', () => {
    const combined = calculateMultiplier(365, 365, 100);
    // Each at cap: 1.5 * 1.8 * 3.0 = 8.1
    expect(combined).toBe(CALC.TREATMENT_CAP * CALC.WORK_CAP * CALC.DISABILITY_CAP);
  });
});

describe('calculateRange', () => {
  it('returns correct range with zero modifiers', () => {
    const result = calculateRange(10000, 20000, 0, 0, 0);
    // totalMult = 1.0, so min = 10000 * 0.7 = 7000, max = 20000 * 1.3 = 26000
    expect(result.min).toBe(7000);
    expect(result.max).toBe(26000);
  });

  it('rounds to nearest 1000', () => {
    const result = calculateRange(5000, 5000, 30, 0, 0);
    // Treatment mult = 1 + (30/365)*0.5 ≈ 1.041
    // min = 5000 * 1.041 * 0.7 ≈ 3644 → rounds to 4000
    // max = 5000 * 1.041 * 1.3 ≈ 6767 → rounds to 7000
    expect(result.min % CALC.ROUNDING).toBe(0);
    expect(result.max % CALC.ROUNDING).toBe(0);
  });

  it('returns 0 for zero base amounts', () => {
    const result = calculateRange(0, 0, 100, 100, 50);
    expect(result.min).toBe(0);
    expect(result.max).toBe(0);
  });

  it('min is always <= max', () => {
    const result = calculateRange(15000, 30000, 180, 90, 25);
    expect(result.min).toBeLessThanOrEqual(result.max);
  });
});
