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
    firstDeliveryDate: '2026-08-24',
    firstDeliveryLocation: 1 as const,
    secondDeliveryDate: '2026-08-27',
    secondDeliveryLocation: 2 as const,
    notes: '',
  };

  it('allows a different customer location for each delivery', () => {
    const parsed = orderCreateInputSchema.parse(validOrder);
    expect(parsed.firstDeliveryLocation).toBe(1);
    expect(parsed.secondDeliveryLocation).toBe(2);
  });

  it('rejects a second delivery before the first one', () => {
    const result = orderCreateInputSchema.safeParse({ ...validOrder, secondDeliveryDate: '2026-08-23' });
    expect(result.success).toBe(false);
  });

  it('accepts a personalized menu snapshot', () => {
    const result = orderUpdateInputSchema.safeParse({
      status: 'CONFIRMED',
      firstDeliveryDate: validOrder.firstDeliveryDate,
      firstDeliveryLocation: 1,
      secondDeliveryDate: validOrder.secondDeliveryDate,
      secondDeliveryLocation: 2,
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
