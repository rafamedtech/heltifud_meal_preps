import { describe, expect, it } from 'vitest';
import { expenseChangePercent } from '../../layers/menu/shared/utils/expenseComparison';

describe('expenseChangePercent', () => {
  it.each([
    [1250, 1000, 25],
    [750, 1000, -25],
    [1000, 1000, 0],
    [0, 1000, -100],
    [0, 0, 0],
    [1000, 0, null],
  ])('compares %s against %s', (current, previous, expected) => {
    expect(expenseChangePercent(current!, previous!)).toBe(expected);
  });
});
