<script setup lang="ts">
import type { Meal } from '~/types';
interface MenuCourseProps {
  meal: Meal;
  title: string;
}

const { meal, title } = defineProps<MenuCourseProps>();

const icon = computed(() =>
  title === 'Desayuno' ? 'lucide:egg-fried' : title === 'Comida' ? 'lucide:drumstick' : 'lucide:salad'
);

const totalCalories = computed(() => {
  return (meal.mainDish.calories + (meal.side1?.calories || 0) + (meal.side2?.calories || 0)).toLocaleString('es-MX', {
    maximumFractionDigits: 0,
  });
});
</script>

<template>
  <section>
    <h3 class="font-bold text-lg flex items-center gap-2">
      <Icon :name="icon" /><span>{{ title }}</span>
    </h3>
    <section class="flex items-center justify-between">
      <article class="flex flex-col gap-2 mt-2 text-sm basis-2/3">
        <span>- {{ meal.mainDish.name }}</span>
        <span>- {{ meal.side1?.name }}</span>
        <span v-if="meal.side2">- {{ meal.side2?.name }}</span>
      </article>
      <article class="basis-1/3 w-full flex items-center justify-end">
        <span class="font-semibold text-primary-500">{{ totalCalories }} Cal</span>
      </article>
    </section>
  </section>
</template>
