<script setup lang="ts">
import type { Meal } from '~/types';
interface MenuCourseProps {
  meal: Meal;
  title: string;
}

const { meal } = defineProps<MenuCourseProps>();

const totalCalories = computed(() => {
  return meal.mainDish.calories + meal.side1.calories + meal.side2.calories;
});
</script>

<template>
  <section>
    <h3 class="font-bold text-lg">{{ title }}</h3>
    <section class="flex items-center justify-between">
      <article class="flex flex-col gap-2 mt-2 text-sm">
        <span>{{ meal.mainDish.name }}</span>
        <span>{{ meal.side1.name }}</span>
        <span>{{ meal.side2.name }}</span>
      </article>
      <article>
        <span class="font-semibold text-primary-500">{{ totalCalories }} Cal</span>
      </article>
    </section>
  </section>
</template>
