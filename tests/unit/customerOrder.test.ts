import { describe, expect, it, vi } from 'vitest';
import { randomBytes, randomUUID } from 'node:crypto';
import { getCustomerOffer, validateCustomerMeals } from '../../layers/menu/server/utils/customerOrders';
import { hashOrderSecret, resolveOrderAccess } from '../../layers/menu/server/utils/orderAccess';
import { customerOrderInputSchema, customerContactSchema, type CustomerOffer } from '../../layers/menu/shared/types/customerOrder';
import { readCustomerDraft } from '../../layers/menu/shared/utils/customerOrderDraft';

const { transaction } = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock('../../layers/menu/server/utils/prisma', () => ({ prisma: { $transaction: transaction } }));

const id = randomUUID();
const other = randomUUID();
const offer = {
  slots: [{ dayOfWeek: 'LUNES', slotType: 'COMIDA', components: [{ originalId: id, selectedId: id, componentRole: 'PLATILLO_PRINCIPAL', position: 0 }] }],
  options: [{ id, componentRole: 'PLATILLO_PRINCIPAL', conflict: { status: 'ok', reasons: [] } },
    { id: other, componentRole: 'GUARNICION_1', conflict: { status: 'ok', reasons: [] } }],
} as CustomerOffer;
// Keep fixtures independent so a mutation test cannot change another test's input.
const input = () => ({ days: ['LUNES'] as Array<'LUNES'>,
  meals: [{ dayOfWeek: 'LUNES' as const, slotType: 'COMIDA' as const, notes: '', components: [{ originalId: id, selectedId: id }] }] });

describe('customer offer availability', () => {
  it('reports the expired cutoff of the matching open cycle while rejecting the offer', async () => {
    const orderCutoffAt = new Date('2026-01-03T05:00:00.000Z');
    const tx = {
      planVariant: { findUnique: vi.fn().mockResolvedValue({ isActive: true, plan: { isActive: true } }) },
      weeklyMenu: { findFirst: vi.fn().mockResolvedValue({ cycle: { orderCutoffAt } }) },
    };
    transaction.mockImplementationOnce(work => work(tx));

    await expect(getCustomerOffer(id, 'ESTANDAR')).rejects.toMatchObject({
      statusCode: 409,
      data: { code: 'OFFER_UNAVAILABLE', orderCutoffAt: orderCutoffAt.toISOString() },
    });
    expect(tx.weeklyMenu.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { cycleScope: 'ESTANDAR', cycle: { status: 'OPEN' } },
    }));
  });
});

describe('customer order selection', () => {
  it('accepts the complete fixed structure', () => expect(validateCustomerMeals(input(), offer)).toHaveLength(1));
  it.each(['omit', 'duplicate', 'foreign', 'family', 'extra'] as const)('rejects %s places', mode => {
    const value = input();
    if (mode === 'omit') value.meals = [];
    if (mode === 'duplicate') value.meals.push(value.meals[0]!);
    if (mode === 'foreign') value.meals[0]!.components[0]!.selectedId = randomUUID();
    if (mode === 'family') value.meals[0]!.components[0]!.selectedId = other;
    if (mode === 'extra') value.meals[0]!.components.push({ originalId: randomUUID(), selectedId: id });
    expect(() => validateCustomerMeals(value, offer)).toThrow();
  });
  it('rejects an excluded dish even when it belongs to the menu', () => {
    const excluded = structuredClone(offer); excluded.options[0]!.conflict.status = 'excluded';
    expect(() => validateCustomerMeals(input(), excluded)).toThrow();
  });
  it('does not accept a customer id or browser price as authoritative', () => {
    expect(customerOrderInputSchema.safeParse({ customerId: id, price: 1 }).success).toBe(false);
  });
});
describe('private bearer links', () => {
  const token = randomBytes(32).toString('hex');
  it('looks up only a SHA-256 hash', async () => {
    const findUnique = vi.fn().mockResolvedValue({ expiresAt: new Date(Date.now() + 60000), revokedAt: null });
    await resolveOrderAccess({ orderAccessLink: { findUnique } } as never, token);
    expect(findUnique).toHaveBeenCalledWith({ where: { tokenHash: hashOrderSecret(token) } });
    expect(hashOrderSecret(token)).not.toBe(token);
  });
  it.each(['absent', 'expired', 'revoked'] as const)('denies %s links uniformly', async mode => {
    const findUnique = vi.fn().mockResolvedValue(mode === 'absent' ? null : { expiresAt: new Date(Date.now() + (mode === 'expired' ? -1000 : 60000)), revokedAt: mode === 'revoked' ? new Date() : null });
    await expect(resolveOrderAccess({ orderAccessLink: { findUnique } } as never, token)).rejects.toMatchObject({ statusCode: 404 });
  });
});
describe('recoverable draft', () => {
  it('ignores corrupt and obsolete local data', () => {
    expect(readCustomerDraft('{broken')).toBeNull();
    expect(readCustomerDraft(JSON.stringify({ version: 0 }))).toBeNull();
  });
});

describe('customer contact', () => {
  it.each(['----------', '123456789', '+1234567890123456'])('rejects phone %s', telefono => {
    expect(customerContactSchema.safeParse({ nombre: 'Cliente', telefono, correoElectronico: '' }).success).toBe(false);
  });
});
describe('draft expiry', () => {
  const now = Date.now();
  const draft = { version: 1, savedAt: now, variantId: '', menuType: 'ESTANDAR', invitation: '', token: 'a'.repeat(64), key: randomUUID(),
    menuId: '', offerVersion: 0, expectedPrice: 0, days: [], meals: [], contact: { nombre: 'Borrador', telefono: '', correoElectronico: '' },
    addresses: { 1: '', 2: '' }, deliveryDays: { 1: null, 2: null }, notes: '', pending: null };
  it('recovers an incomplete contact without requiring a complete submission', () => {
    expect(readCustomerDraft(JSON.stringify(draft), now)?.contact.nombre).toBe('Borrador');
  });
  it('rejects a draft after seven days or with a future timestamp', () => {
    expect(readCustomerDraft(JSON.stringify(draft), now + 7 * 86400000 + 1)).toBeNull();
    expect(readCustomerDraft(JSON.stringify(draft), now - 1)).toBeNull();
  });
});
