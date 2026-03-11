<script setup lang="ts">
import type { MenuSlot } from '~~/layers/menu/shared/types/types';

interface MenuCourseProps {
  meal: MenuSlot;
  title: string;
}

const { meal, title } = defineProps<MenuCourseProps>();

const iconByTitle: Record<string, string> = {
  Desayuno: 'lucide:egg-fried',
  Comida: 'lucide:drumstick',
  Cena: 'lucide:soup',
  'Snack 1': 'lucide:apple',
  'Snack 2': 'lucide:sandwich',
};

const icon = computed(() => iconByTitle[title] ?? 'lucide:utensils');

const totalCalories = computed(() => {
  const base = meal.platilloPrincipal.calorias;
  const side1 = meal.guarnicion1?.calorias ?? 0;
  const side2 = meal.guarnicion2?.calorias ?? 0;
  const adicionales = meal.adicionales.reduce((sum, item) => sum + item.calorias, 0);
  return (base + side1 + side2 + adicionales).toLocaleString('es-MX', {
    maximumFractionDigits: 0,
  });
});

const guarnicion1Name = computed(() => meal.guarnicion1?.nombre?.trim());
const guarnicion2Name = computed(() => meal.guarnicion2?.nombre?.trim());
</script>

<template>
  <UCard variant="subtle" class="h-full border-transparent" :ui="{ root: 'border-transparent shadow-none' }">
    <h3 class="font-bold text-lg flex items-center gap-2">
      <Icon :name="icon" /><span>{{ title }}</span>
    </h3>

    <section class="flex items-start justify-between gap-2 mt-2 text-sm">
      <article class="flex flex-col gap-2 basis-3/4">
        <span class="min-h-[1.25rem]">- {{ meal.platilloPrincipal.nombre }}</span>
        <span class="min-h-[1.25rem]">
          <template v-if="guarnicion1Name">- {{ guarnicion1Name }}</template>
          <template v-else>&nbsp;</template>
        </span>
        <span class="min-h-[1.25rem]">
          <template v-if="guarnicion2Name">- {{ guarnicion2Name }}</template>
          <template v-else>&nbsp;</template>
        </span>
        <span v-for="(adicional, index) in meal.adicionales" :key="`${adicional.nombre}-${index}`">- {{ adicional.nombre }}</span>
      </article>

      <article class="basis-1/4 w-full flex items-start justify-end">
        <span class="font-semibold text-primary-500">{{ totalCalories }} Cal</span>
      </article>
    </section>
  </UCard>
</template>
