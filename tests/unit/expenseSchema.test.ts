import { describe, expect, it } from 'vitest';

import { expenseInputSchema, expenseListQuerySchema } from '../../layers/menu/shared/types/menuSchema';

const validExpense = {
  description: 'Compra de verduras',
  amount: 1240.5,
  category: 'insumos',
  paymentMethod: 'transferencia',
  expenseDate: '2026-08-09',
  vendor: 'Mercado local',
  notes: '',
} as const;

describe('expenseInputSchema', () => {
  it('accepts and trims a complete expense', () => {
    const result = expenseInputSchema.parse({ ...validExpense, description: '  Compra de verduras  ' });

    expect(result.description).toBe('Compra de verduras');
    expect(result.amount).toBe(1240.5);
  });

  it('rejects non-positive amounts and invalid classifications', () => {
    const result = expenseInputSchema.safeParse({
      ...validExpense,
      amount: 0,
      category: 'desconocida',
      paymentMethod: 'cheque',
    });

    expect(result.success).toBe(false);
  });

  it('rejects impossible calendar dates', () => {
    const result = expenseInputSchema.safeParse({ ...validExpense, expenseDate: '2026-02-31' });

    expect(result.success).toBe(false);
  });
});

describe('expenseListQuerySchema', () => {
  it('coerces pagination values and accepts a date range', () => {
    const result = expenseListQuerySchema.parse({ from: '2026-08-01', to: '2026-08-31', limit: '30' });

    expect(result.limit).toBe(30);
    expect(result.from).toBe('2026-08-01');
  });

  it('rejects an inverted date range', () => {
    const result = expenseListQuerySchema.safeParse({ from: '2026-09-01', to: '2026-08-01' });

    expect(result.success).toBe(false);
  });
});
