import { describe, expect, it } from 'vitest';
import { derivedOrderStatus, deliveryActionLabel, deliveryReasonRequired, isClosedDelivery, ORDER_TRANSITIONS, DELIVERY_TRANSITIONS } from '../../layers/menu/shared/utils/orderWorkflow';
import { ORDER_POLICY, customerOrderStatusMessage } from '../../layers/menu/shared/utils/orderPolicy';
import { deliveryStatusInputSchema, orderStatusInputSchema } from '../../layers/menu/shared/types/menuSchema';
import { ORDER_STATUS_VALUES } from '../../layers/menu/shared/types/types';

describe('order workflow', () => {
  it('reserves partial and delivered order states for delivery results', () => {
    expect(ORDER_TRANSITIONS.DRAFT).not.toContain('DELIVERED');
    expect(ORDER_TRANSITIONS.CONFIRMED).not.toContain('PARTIALLY_DELIVERED');
    expect(DELIVERY_TRANSITIONS.PENDING).not.toContain('DELIVERED');
    expect(derivedOrderStatus('PREPARING', ['DELIVERED', 'PENDING'])).toBe('PARTIALLY_DELIVERED');
    expect(derivedOrderStatus('PARTIALLY_DELIVERED', ['DELIVERED', 'DELIVERED'])).toBe('DELIVERED');
    expect(derivedOrderStatus('PREPARING', ['DELIVERED'])).toBe('DELIVERED');
  });
  it('keeps a cancellation even when deliveries had already completed', () => {
    expect(derivedOrderStatus('CANCELLED', ['DELIVERED'])).toBe('CANCELLED');
    expect(derivedOrderStatus('PREPARING', ['FAILED', 'PENDING'])).toBe('PREPARING');
  });
});

describe('delivery closing policy (17 Nov 2026)', () => {
  it('closes a failed delivery as LOST and lets staff undo it', () => {
    expect(DELIVERY_TRANSITIONS.FAILED).toEqual(expect.arrayContaining(['PENDING', 'OUT_FOR_DELIVERY', 'LOST']));
    expect(DELIVERY_TRANSITIONS.LOST).toEqual(['FAILED']);
    expect(DELIVERY_TRANSITIONS.OUT_FOR_DELIVERY).not.toContain('LOST');
    expect(isClosedDelivery('LOST')).toBe(true);
    expect(isClosedDelivery('FAILED')).toBe(false);
  });
  it('counts LOST as closed when deriving the order status', () => {
    expect(derivedOrderStatus('PREPARING', ['DELIVERED', 'LOST'])).toBe('DELIVERED');
    expect(derivedOrderStatus('PREPARING', ['LOST', 'PENDING'])).toBe('PARTIALLY_DELIVERED');
    expect(derivedOrderStatus('PREPARING', ['LOST'])).toBe('DELIVERED');
  });
  it('labels a failed delivery sent back to pending as a reschedule and requires reasons to close', () => {
    expect(deliveryActionLabel('FAILED', 'PENDING')).toBe('Reprogramar');
    expect(deliveryActionLabel('OUT_FOR_DELIVERY', 'FAILED')).toBe('Marcar fallida');
    expect(deliveryActionLabel('FAILED', 'LOST')).toBe('Cerrar sin entregar');
    expect(deliveryReasonRequired('LOST')).toBe(true);
    expect(deliveryReasonRequired('FAILED')).toBe(true);
    expect(deliveryReasonRequired('DELIVERED')).toBe(false);
  });
});

describe('transition inputs', () => {
  it('accepts the unpaid exception and a reschedule date, and rejects unknown fields', () => {
    expect(orderStatusInputSchema.safeParse({ version: 1, status: 'PREPARING', reason: 'Paga el viernes', allowUnpaid: true }).success).toBe(true);
    expect(deliveryStatusInputSchema.safeParse({ version: 1, status: 'PENDING', reason: '', scheduledDate: '2026-11-24' }).success).toBe(true);
    expect(deliveryStatusInputSchema.safeParse({ version: 1, status: 'LOST', reason: 'Sin respuesta' }).success).toBe(true);
    expect(deliveryStatusInputSchema.safeParse({ version: 1, status: 'PENDING', scheduledDate: '24/11/2026' }).success).toBe(false);
    expect(orderStatusInputSchema.safeParse({ version: 1, status: 'PREPARING', unpaid: true }).success).toBe(false);
  });
});

describe('customer order policy', () => {
  it('has a status message for every order status', () => {
    for (const status of ORDER_STATUS_VALUES) expect(customerOrderStatusMessage(status)).toBeTruthy();
    expect(customerOrderStatusMessage('DELIVERED')).not.toMatch(/revisará/);
    expect(ORDER_POLICY.length).toBeGreaterThan(0);
  });
});
