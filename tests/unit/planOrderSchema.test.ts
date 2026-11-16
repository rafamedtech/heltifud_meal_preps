import { describe, expect, it } from 'vitest';

import {
  orderCreateInputSchema,
  orderUpdateInputSchema,
  planInputSchema,
} from '../../layers/menu/shared/types/menuSchema';

describe('planInputSchema', () => {
  const validPlan = {
    title: 'Plan comidas',
    description: 'Comidas listas para cinco días.',
    image: 'heltifud/comidas.png',
    slotTypes: ['COMIDA'] as const,
    isActive: true,
    variants: [
      { title: '3 días', daysCount: 3, price: 500, isActive: true },
      { title: '5 días', daysCount: 5, price: 700, isActive: true },
    ],
  };

  it('accepts a plan with multiple variants', () => {
    expect(planInputSchema.parse(validPlan).variants).toHaveLength(2);
  });

  it('rejects repeated day counts', () => {
    const result = planInputSchema.safeParse({
      ...validPlan,
      variants: [validPlan.variants[0], { ...validPlan.variants[1], daysCount: 3 }],
    });

    expect(result.success).toBe(false);
  });
});

describe('order schemas', () => {
  const validOrder = {
    customerId: '11111111-1111-4111-8111-111111111111',
    planVariantId: '22222222-2222-4222-8222-222222222222',
    days: ['LUNES', 'MARTES', 'JUEVES'] as const,
    deliveries: [
      { sequence: 1 as const, deliveryDay: 'DOMINGO' as const, locationNumber: 1 as const },
      { sequence: 2 as const, deliveryDay: 'JUEVES' as const, locationNumber: 2 as const },
    ],
    notes: '',
  };
  const savedDeliveries = [
    { sequence: 1 as const, scheduledDate: '2026-08-24', locationNumber: 1 as const },
    { sequence: 2 as const, scheduledDate: '2026-08-27', locationNumber: 2 as const },
  ];
  const update = { status: 'CONFIRMED', notes: '', menuSlots: [] };

  it('allows a different customer location for each delivery', () => {
    const parsed = orderCreateInputSchema.parse(validOrder);
    expect(parsed.deliveries.map((delivery) => delivery.locationNumber)).toEqual([1, 2]);
  });

  it('lets the server choose deliveries when none is sent', () => {
    expect(orderCreateInputSchema.safeParse({ ...validOrder, deliveries: [] }).success).toBe(true);
  });

  it('rejects an order without days, with repeated days or a repeated delivery', () => {
    expect(orderCreateInputSchema.safeParse({ ...validOrder, days: [] }).success).toBe(false);
    expect(orderCreateInputSchema.safeParse({ ...validOrder, days: ['LUNES', 'LUNES'] }).success).toBe(false);
    expect(orderCreateInputSchema.safeParse({
      ...validOrder,
      deliveries: [validOrder.deliveries[0], validOrder.deliveries[0]],
    }).success).toBe(false);
  });

  it('rejects an edited second delivery before the first one', () => {
    const result = orderUpdateInputSchema.safeParse({
      ...update,
      deliveries: [savedDeliveries[0], { ...savedDeliveries[1], scheduledDate: '2026-08-23' }],
    });
    expect(result.error?.issues.some((issue) => issue.path.join('.') === 'deliveries.1.scheduledDate')).toBe(true);
  });

  it('rejects an edited order without deliveries or with a repeated one', () => {
    const paths = (deliveries: unknown[]) => orderUpdateInputSchema.safeParse({ ...update, deliveries })
      .error?.issues.map((issue) => issue.path[0]);
    expect(paths([])).toContain('deliveries');
    expect(paths([savedDeliveries[0], savedDeliveries[0]])).toContain('deliveries');
  });

  it('accepts a personalized menu snapshot', () => {
    const result = orderUpdateInputSchema.safeParse({
      status: 'CONFIRMED',
      deliveries: savedDeliveries,
      notes: 'Sin cebolla',
      menuSlots: [{
        dayOfWeek: 'LUNES',
        dayOrder: 1,
        slotType: 'COMIDA',
        contenedor: 'Rectangular',
        components: [{
          catalogItemId: null,
          componentRole: 'PLATILLO_PRINCIPAL',
          position: 0,
          nombre: 'Pechuga a la plancha',
          descripcion: '',
          calorias: 476,
          imagen: '',
          tipo: 'comida',
        }],
      }],
    });

    expect(result.success).toBe(true);
  });
});
