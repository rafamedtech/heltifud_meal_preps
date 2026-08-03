import type { Customer, CustomerInput, CustomerListResponse } from '~~/layers/menu/shared/types/types';

export default function useCustomers() {
  const createCustomer = (input: CustomerInput) =>
    $fetch<Customer>('/api/customers', { method: 'POST', body: input });

  const updateCustomer = (id: string, input: CustomerInput) =>
    $fetch<Customer>(`/api/customers/${id}`, { method: 'PUT', body: input });

  const deleteCustomer = (id: string) =>
    $fetch<{ id: string }>(`/api/customers/${id}`, { method: 'DELETE' });

  const getCustomers = (query: Record<string, string | number | undefined>) =>
    $fetch<CustomerListResponse>('/api/customers', { query });

  return { createCustomer, updateCustomer, deleteCustomer, getCustomers };
}
