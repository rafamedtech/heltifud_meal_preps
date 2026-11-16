import { describe, expect, it } from 'vitest';
import { derivedOrderStatus, ORDER_TRANSITIONS, DELIVERY_TRANSITIONS } from '../../layers/menu/shared/utils/orderWorkflow';

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
