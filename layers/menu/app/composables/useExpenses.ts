import type { Expense, ExpenseInput, ExpenseListResponse } from '~~/layers/menu/shared/types/types';

export default function useExpenses() {
  const createExpense = (input: ExpenseInput) =>
    $fetch<Expense>('/api/expenses', { method: 'POST', body: input });

  const updateExpense = (id: string, input: ExpenseInput) =>
    $fetch<Expense>(`/api/expenses/${id}`, { method: 'PUT', body: input });

  const deleteExpense = (id: string) =>
    $fetch<{ id: string }>(`/api/expenses/${id}`, { method: 'DELETE' });

  const getExpenses = (query: Record<string, string | number | undefined>) =>
    $fetch<ExpenseListResponse>('/api/expenses', { query });

  const getExpenseVendors = () =>
    $fetch<string[]>('/api/expenses/vendors');

  return { createExpense, updateExpense, deleteExpense, getExpenses, getExpenseVendors };
}
