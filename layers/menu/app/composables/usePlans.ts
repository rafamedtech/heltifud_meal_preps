import type { Plan, PlanInput } from '~~/layers/menu/shared/types/types';

export default function usePlans() {
  const getPlans = () => $fetch<Plan[]>('/api/plans/all');
  const createPlan = (input: PlanInput) => $fetch<Plan>('/api/plans', { method: 'POST', body: input });
  const updatePlan = (id: string, input: PlanInput) => $fetch<Plan>(`/api/plans/${id}`, { method: 'PUT', body: input });
  const deletePlan = (id: string) => $fetch<{ id: string }>(`/api/plans/${id}`, { method: 'DELETE' });

  return { getPlans, createPlan, updatePlan, deletePlan };
}
