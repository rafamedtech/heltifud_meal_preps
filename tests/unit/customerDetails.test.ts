import { describe, expect, it, vi } from 'vitest';
import { getCustomerById } from '../../layers/menu/server/utils/customers';

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('../../layers/menu/server/utils/prisma', () => ({ prisma: { customer: { findUnique } } }));

describe('getCustomerById', () => {
  it('looks up the requested ID and serializes dates and optional fields', async () => {
    const record = {
      firstDeliveryDay: 'LUNES', secondDeliveryDay: 'JUEVES',
      id: 'customer-1', nombre: 'Ana López', telefono: '6641234567',
      ubicacion1: 'Zona Río', ubicacion2: null, correoElectronico: null,
      source: 'whatsapp', status: 'activo', tipoCliente: 'menu',
      createdAt: new Date('2026-09-01T12:00:00Z'), updatedAt: new Date('2026-09-02T12:00:00Z')
    };
    findUnique.mockResolvedValue(record);
    const result = await getCustomerById(record.id);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: record.id } });
    expect(result).toEqual({ ...record, ubicacion2: '', correoElectronico: '', createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() });
  });

  it('returns 404 for a missing customer', async () => {
    findUnique.mockResolvedValue(null);
    await expect(getCustomerById('missing')).rejects.toMatchObject({ statusCode: 404 });
  });
});
