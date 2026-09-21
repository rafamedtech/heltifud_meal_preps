import { describe, expect, it } from 'vitest'

import { foodCatalogItemInputSchema } from '../../layers/menu/shared/types/menuSchema'

const baseItem = {
  nombre: 'Pechuga a la plancha',
  descripcion: 'Pechuga de pollo con vegetales',
  calorias: 420,
  imagen: '',
  tipo: 'comida'
}

describe('foodCatalogItemInputSchema', () => {
  it('conserva la preparación y los ingredientes enviados', () => {
    const parsed = foodCatalogItemInputSchema.parse({
      ...baseItem,
      preparacion: '1. Sazonar el pollo.\n2. Cocinar a la plancha.',
      ingredientes: [{
        ingredientId: '123e4567-e89b-12d3-a456-426614174000',
        cantidad: 0.25,
        unidad: 'g',
      }],
    })

    expect(parsed.preparacion).toBe('1. Sazonar el pollo.\n2. Cocinar a la plancha.')
    expect(parsed.ingredientes).toHaveLength(1)
    expect(parsed.ingredientes[0]?.cantidad).toBe(0.25)
  })

  it('rechaza cantidades con más de 2 decimales', () => {
    const parsed = foodCatalogItemInputSchema.safeParse({
      ...baseItem,
      ingredientes: [{
        ingredientId: '123e4567-e89b-12d3-a456-426614174000',
        cantidad: 1.234,
        unidad: 'kg',
      }],
    })

    expect(parsed.success).toBe(false)
  })

  it('usa una receta estructurada vacía cuando no se envía', () => {
    const parsed = foodCatalogItemInputSchema.parse(baseItem)

    expect(parsed.preparacion).toBe('')
    expect(parsed.ingredientes).toEqual([])
  })

  it('rechaza ingredientes repetidos', () => {
    const ingredient = {
      ingredientId: '123e4567-e89b-12d3-a456-426614174000',
      cantidad: 1,
      unidad: 'pieza',
    }

    const parsed = foodCatalogItemInputSchema.safeParse({
      ...baseItem,
      ingredientes: [ingredient, ingredient],
    })

    expect(parsed.success).toBe(false)
  })
})
