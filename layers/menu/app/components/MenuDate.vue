<script setup lang="ts">
interface MenuDateProps {
  startDate: Date | string
  endDate: Date | string
}

const { startDate, endDate } = defineProps<MenuDateProps>()
</script>

<template>
  <section class="flex items-center gap-2">
    <Icon
      name="lucide:calendar-days"
      size="24"
    />
    <span>{{ startDate }}</span> - <span>{{ endDate }}</span>
  </section>
</template>
