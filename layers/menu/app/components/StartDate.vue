<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date"

const df = new DateFormatter("en-US", {
  dateStyle: "medium"
})

const startDate = defineModel<CalendarDate>({
  default: () => new CalendarDate(2022, 1, 11)
})
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
    >
      {{ df.format(startDate.toDate(getLocalTimeZone())) }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="startDate"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
