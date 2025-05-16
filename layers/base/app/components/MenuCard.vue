<script setup lang="ts">
interface MenuCardProps {
  day: DayMenu;
}

const { day } = defineProps<MenuCardProps>();
</script>

<template>
  <UCard variant="subtle" class="basis-1/3 m-1" :ui="{ body: 'sm:p-0 p-0' }">
    <template #header>
      <h3 class="text-xl font-bold text-primary-500">{{ day.dayOfWeek }}</h3>
    </template>

    <section class="flex flex-col justify-between md:flex-row">
      <MenuMeal :meal="day.breakfast" title="Desayuno" class="basis-1/3" />
      <MenuMeal :meal="day.lunch" title="Comida" class="basis-1/3" />
      <MenuMeal :meal="day.dinner" title="Cena" class="basis-1/3" />
    </section>
  </UCard>
</template>
