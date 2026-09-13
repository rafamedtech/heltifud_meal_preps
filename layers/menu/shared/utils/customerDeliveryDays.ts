import type { DayOfWeek } from '../types/types';

export const customerDeliveryDays: { label: string; value: DayOfWeek | 'sin_definir' }[] = [
  { label: 'Sin definir', value: 'sin_definir' },
  { label: 'Lunes', value: 'LUNES' },
  { label: 'Martes', value: 'MARTES' },
  { label: 'Miércoles', value: 'MIERCOLES' },
  { label: 'Jueves', value: 'JUEVES' },
  { label: 'Viernes', value: 'VIERNES' },
  { label: 'Sábado', value: 'SABADO' },
  { label: 'Domingo', value: 'DOMINGO' },
];

export function customerDeliveryDayLabel(day?: DayOfWeek | null) {
  return customerDeliveryDays.find(option => option.value === day)?.label ?? 'Sin definir';
}
