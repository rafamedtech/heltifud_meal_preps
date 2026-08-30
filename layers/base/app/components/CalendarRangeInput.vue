<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date';
import type { DateRange } from 'reka-ui';
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date';

interface Props {
  ariaLabel?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  ariaLabel: 'Rango de fechas',
  size: 'lg',
});

const start = defineModel<string>('start', { required: true });
const end = defineModel<string>('end', { required: true });
const dateFormatter = new DateFormatter('es-MX', { dateStyle: 'medium' });
const timeZone = getLocalTimeZone();

const calendarValue = computed<DateRange>({
  get() {
    return {
      start: start.value ? parseDate(start.value.slice(0, 10)) : undefined,
      end: end.value ? parseDate(end.value.slice(0, 10)) : undefined,
    };
  },
  set(value) {
    start.value = (value.start as CalendarDate | undefined)?.toString() ?? '';
    end.value = (value.end as CalendarDate | undefined)?.toString() ?? '';
  },
});

const displayRange = computed(() => {
  if (!calendarValue.value.start) return props.ariaLabel;

  const formattedStart = dateFormatter.format(calendarValue.value.start.toDate(timeZone));
  if (!calendarValue.value.end) return `Desde ${formattedStart}`;

  const formattedEnd = dateFormatter.format(calendarValue.value.end.toDate(timeZone));
  return `${formattedStart} - ${formattedEnd}`;
});

function clearRange() {
  start.value = '';
  end.value = '';
}
</script>

<template>
  <UPopover :content="{ align: 'start' }">
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar-range"
      trailing-icon="i-lucide-chevron-down"
      :size="props.size"
      :aria-label="`Abrir calendario para ${props.ariaLabel.toLocaleLowerCase('es-MX')}`"
      class="w-full justify-start"
      :class="calendarValue.start ? 'text-highlighted' : 'text-muted'"
      :ui="{ trailingIcon: 'ms-auto' }"
    >
      <span class="truncate">{{ displayRange }}</span>
    </UButton>

    <template #content>
      <div class="p-2">
        <UCalendar v-model="calendarValue" range />
        <div v-if="calendarValue.start" class="mt-2 flex justify-end border-t border-default pt-2">
          <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" @click="clearRange">
            Limpiar rango
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
