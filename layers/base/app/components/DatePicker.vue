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
  <UPopover>
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-calendar"
      trailing-icon="i-lucide-chevron-down"
      class="w-full justify-between rounded-xl border-default bg-default text-left font-medium shadow-xs hover:bg-default"
      :ui="{
        base: 'w-full justify-between rounded-xl px-3.5 py-2.5',
        leadingIcon: 'size-4 text-muted',
        trailingIcon: 'size-4 text-muted'
      }"
    >
      {{ displayDate }}
    </UButton>

    <template #content>
      <UCalendar v-model="calendarValue" class="p-2" />
    </template>
  </UPopover>
</template>
