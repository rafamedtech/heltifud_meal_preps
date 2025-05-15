<script setup lang="ts">
interface MenuCardProps {
  day: DayMenu;
}

const { day } = defineProps<MenuCardProps>();
</script>

<template>
  <UCard variant="subtle" class="basis-1/3 max-h-[32rem] h-[32rem]" :ui="{ body: 'sm:p-4' }">
    <template #header>
      <h3 class="text-xl font-bold text-primary-500">{{ day.dayOfWeek }}</h3>
    </template>

    <section class="flex flex-col gap-4 h-full justify-between">
      <MenuMeal :meal="day.breakfast" title="Desayuno" />
      <MenuMeal :meal="day.lunch" title="Comida" />
      <MenuMeal :meal="day.dinner" title="Cena" />
    </section>
  </UCard>
</template>
