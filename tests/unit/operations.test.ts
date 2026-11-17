import { describe, expect, it } from 'vitest';
import { accountTotals, consolidateProduction, type RecipeFact } from '../../layers/menu/shared/utils/operations';
import { paymentInputSchema, deliveryOperationSchema, type ProductionMeal } from '../../layers/menu/shared/types/operations';

const meal: ProductionMeal = { orderId: 'one', folio: 1, customer: 'Cliente', deliveryId: 'delivery-one', deliverySequence: 1, scheduledDate: '2026-11-16', address: 'Dirección guardada', dayOfWeek: 'LUNES', slotType: 'COMIDA', container: 'C25', notes: 'Sin picante', orderNotes: 'Avisar', exclusions: ['ALERGIA: Nuez'], components: [{ catalogItemId: 'recipe', name: 'Pollo elegido', role: 'PLATILLO_PRINCIPAL', position: 0, substitution: true }] };
const recipe: RecipeFact = { id: 'recipe', yield: 4, ingredients: [{ ingredientId: 'rice', name: 'Arroz', category: 'Granos', quantity: 1, unit: 'kg' }, { ingredientId: 'water', name: 'Agua', category: 'Bebidas', quantity: 2, unit: 'l' }] };
describe('operational accounts', () => {
  it('keeps cents exact and refunds reopen the receivable', () => {
    expect(accountTotals(1, 'CONFIRMED', [{ kind: 'PAYMENT', amount: 0.1 }, { kind: 'PAYMENT', amount: 0.2 }])).toEqual({ paid: 0.3, balance: 0.7, refundable: 0 });
    expect(accountTotals(100, 'DELIVERED', [{ kind: 'PAYMENT', amount: 100 }, { kind: 'REFUND', amount: 25 }])).toEqual({ paid: 75, balance: 25, refundable: 0 });
  });
  it('cancellation removes receivable and exposes only the remaining net cash for return', () => {
    expect(accountTotals(900, 'CANCELLED', [{ kind: 'PAYMENT', amount: 500 }, { kind: 'REFUND', amount: 200 }])).toEqual({ paid: 300, balance: 0, refundable: 300 });
    expect(accountTotals(900, 'DRAFT', [])).toEqual({ paid: 0, balance: 0, refundable: 0 });
  });
  it('rejects fractional cents, invalid date, empty reason and insecure evidence', () => {
    const base = { kind: 'PAYMENT', amount: 12.34, method: 'CASH', receivedAt: '2026-11-16', reason: 'Abono', idempotencyKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
    expect(paymentInputSchema.safeParse(base).success).toBe(true);
    for (const patch of [{ amount: 0 }, { amount: 0.001 }, { amount: -1 }, { reason: ' ' }, { receivedAt: '2026-02-30' }]) expect(paymentInputSchema.safeParse({ ...base, ...patch }).success).toBe(false);
    expect(deliveryOperationSchema.safeParse({ version: 1, assignedTo: '', incident: '', evidenceUrl: 'http://example.com/photo' }).success).toBe(false);
  });
  it('accepts store credit as a payment method and nothing else new', () => {
    const base = { kind: 'REFUND', amount: 100, method: 'CREDIT', receivedAt: '2026-11-16', reason: 'Cancelación antes del corte', idempotencyKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
    expect(paymentInputSchema.safeParse(base).success).toBe(true);
    expect(paymentInputSchema.safeParse({ ...base, kind: 'PAYMENT' }).success).toBe(true);
    expect(paymentInputSchema.safeParse({ ...base, method: 'VOUCHER' }).success).toBe(false);
  });
});
describe('frozen production and purchases', () => {
  it('counts actual saved substitutions, containers, notes and separate deliveries', () => {
    const later = { ...meal, deliveryId: 'two', scheduledDate: '2026-11-19', deliverySequence: 2, dayOfWeek: 'JUEVES' };
    const result = consolidateProduction('2026-11-16', [meal, later], [recipe]);
    expect(result.groups.map(g => [g.name, g.portions])).toEqual([['Pollo elegido', 1], ['Pollo elegido', 1]]);
    expect(result.containers).toHaveLength(2);
    expect(result.meals[0]).toMatchObject({ notes: 'Sin picante', exclusions: ['ALERGIA: Nuez'], address: 'Dirección guardada' });
    expect(result.shopping).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Arroz', quantity: 500, unit: 'g' }), expect.objectContaining({ name: 'Agua', quantity: 1000, unit: 'ml' })]));
  });
  it('keeps volume, weight and household measures separate for the same ingredient', () => {
    const measures = ['g', 'ml', 'taza'].map((unit, i) => ({ ...recipe, id: String(i), yield: 3, ingredients: [{ ...recipe.ingredients[0]!, unit, quantity: 1 }] }));
    const portions = measures.map(r => ({ ...meal, components: [{ ...meal.components[0]!, catalogItemId: r.id }] }));
    const result = consolidateProduction('2026-11-16', portions, measures);
    expect(result.shopping.map(i => [i.unit, i.quantity])).toEqual([['g', 0.334], ['ml', 0.334], ['taza', 0.334]]);
    expect(consolidateProduction('2026-11-16', [...portions, ...portions, ...portions], measures).shopping.map(i => i.quantity)).toEqual([1, 1, 1]);
  });
  it('reports invalid ingredient quantities and empty units without a partial shopping total', () => {
    for (const patch of [{ quantity: 0 }, { quantity: -1 }, { quantity: Number.NaN }, { unit: ' ' }]) {
      const invalid = { ...recipe, ingredients: [recipe.ingredients[0]!, { ...recipe.ingredients[1]!, ...patch }] };
      const result = consolidateProduction('2026-11-16', [meal], [invalid]);
      expect(result.shopping).toEqual([]);
      expect(result.missingRecipes).toEqual([{ name: 'Pollo elegido', portions: 1, reason: 'Cantidades o unidades inválidas' }]);
    }
  });
  it('explicitly reports unknown recipes and missing yields instead of inventing quantities', () => {
    const unknown = { ...meal, components: [{ ...meal.components[0]!, catalogItemId: null }] };
    const result = consolidateProduction('2026-11-16', [meal, unknown], [{ ...recipe, yield: null }]);
    expect(result.shopping).toEqual([]);
    expect(result.missingRecipes).toEqual(expect.arrayContaining([expect.objectContaining({ reason: 'Sin rendimiento', portions: 1 }), expect.objectContaining({ reason: 'Sin vínculo a receta', portions: 1 })]));
  });
});
