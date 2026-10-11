<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  parseDate,
} from '@internationalized/date';

const df = new DateFormatter('es-MX', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

const props = defineProps<{ label?: string; invalid?: boolean }>();
const open = ref(false);

const model = defineModel<Date | string>({
  required: true,
});

function toCalendarDate(value: Date | string): CalendarDate {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = value.getMonth() + 1;
    const day = value.getDate();
    return new CalendarDate(year, month, day);
  }

  if (typeof value === 'string' && value) {
    return parseDate(value.slice(0, 10));
  }

  const now = new Date();
  return new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

const calendarValue = computed<CalendarDate>({
  get() {
    return toCalendarDate(model.value);
  },
  set(value) {
    model.value = value.toDate(getLocalTimeZone());
  },
});

const displayDate = computed(() => df.format(calendarValue.value.toDate('UTC')));
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'start' }">
    <UButton
      type="button"
      :color="props.invalid ? 'error' : 'neutral'"
      variant="outline"
      :aria-label="props.label ? `${props.label}: ${displayDate}` : displayDate"
      :aria-invalid="props.invalid || undefined"
      icon="i-lucide-calendar"
      trailing-icon="i-lucide-chevron-down"
      class="w-full text-default"
      :ui="{
        base: 'justify-start',
        leadingIcon: 'text-muted',
        trailingIcon: 'ms-auto text-muted'
      }"
    >
      {{ displayDate }}
    </UButton>

    <template #content>
      <UCalendar v-model="calendarValue" class="p-2" @update:model-value="open = false" />
    </template>
  </UPopover>
</template>
