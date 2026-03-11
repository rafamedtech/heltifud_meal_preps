<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  parseDate,
} from '@internationalized/date';

const df = new DateFormatter('es-MX', {
  dateStyle: 'medium',
});

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
</script>

<template>
  <UPopover>
    <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
      {{ df.format(calendarValue.toDate(getLocalTimeZone())) }}
    </UButton>

    <template #content>
      <UCalendar v-model="calendarValue" class="p-2" />
    </template>
  </UPopover>
</template>
