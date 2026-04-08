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
  <section class="h-full min-w-0 px-4 py-4">
    <h3 class="flex min-w-0 items-center gap-2 text-lg font-bold">
      <Icon
        :name="icon"
        class="shrink-0"
      />
      <span class="min-w-0">{{ title }}</span>
    </h3>

    <section class="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-sm">
      <article class="flex min-w-0 flex-col gap-2">
        <span class="min-h-[1.25rem] break-words">- {{ meal.platilloPrincipal.nombre }}</span>
        <span class="min-h-[1.25rem]">
          <template v-if="guarnicion1Name">- {{ guarnicion1Name }}</template>
          <template v-else>&nbsp;</template>
        </span>
        <span class="min-h-[1.25rem]">
          <template v-if="guarnicion2Name">- {{ guarnicion2Name }}</template>
          <template v-else>&nbsp;</template>
        </span>
        <span
          v-for="(adicional, index) in meal.adicionales"
          :key="`${adicional.nombre}-${index}`"
          class="break-words"
        >
          - {{ adicional.nombre }}
        </span>
      </article>

      <article class="flex shrink-0 items-start justify-end">
        <span class="whitespace-nowrap font-semibold text-primary-500">{{ totalCalories }} Cal</span>
      </article>
    </section>
  </section>
</template>
