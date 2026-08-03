import { describe, expect, it } from 'vitest';

import { customerInputSchema, customerListQuerySchema } from '../../layers/menu/shared/types/menuSchema';

const validCustomer = {
  nombre: 'Ana López',
  telefono: '664 123 4567',
  ubicacion1: 'Zona Río, Tijuana',
  ubicacion2: '',
  correoElectronico: 'ANA@EJEMPLO.COM',
  source: 'whatsapp',
  status: 'prospecto',
  tipoCliente: 'menu',
} as const;

describe('customerInputSchema', () => {
  it('accepts and trims a complete customer record', () => {
    const result = customerInputSchema.parse({ ...validCustomer, nombre: '  Ana López  ' });

    expect(result.nombre).toBe('Ana López');
    expect(result.telefono).toBe(validCustomer.telefono);
  });

  it('accepts optional secondary location and email as empty strings', () => {
    const result = customerInputSchema.safeParse({
      ...validCustomer,
      ubicacion2: '',
      correoElectronico: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid contact and classification values', () => {
    const result = customerInputSchema.safeParse({
      ...validCustomer,
      correoElectronico: 'correo-invalido',
      status: 'desconocido',
      tipoCliente: 'recurrente',
    });

    expect(result.success).toBe(false);
  });
});

describe('customerListQuerySchema', () => {
  it('coerces and caps pagination inputs through validation', () => {
    expect(customerListQuerySchema.parse({ limit: '30' }).limit).toBe(30);
    expect(customerListQuerySchema.safeParse({ limit: '101' }).success).toBe(false);
  });
});
