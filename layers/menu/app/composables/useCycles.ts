import type {
  OperationSettings,
  OperationSettingsInput,
  WeeklyCycle,
  WeeklyCycleUpdateInput,
} from '~~/layers/menu/shared/types/types';

export default function useCycles() {
  async function getCycles() {
    return $fetch<WeeklyCycle[]>('/api/cycles');
  }

  async function updateCycle(id: string, input: WeeklyCycleUpdateInput) {
    return $fetch<WeeklyCycle>(`/api/cycles/${id}`, { method: 'PUT', body: input });
  }

  async function getOperationSettings() {
    return $fetch<OperationSettings>('/api/operation-settings');
  }

  async function updateOperationSettings(input: OperationSettingsInput) {
    return $fetch<OperationSettings>('/api/operation-settings', { method: 'PUT', body: input });
  }

  return { getCycles, updateCycle, getOperationSettings, updateOperationSettings };
}
