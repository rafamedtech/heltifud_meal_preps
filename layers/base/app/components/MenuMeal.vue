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

const accompaniments = computed(() => [
  meal.guarnicion1?.nombre,
  meal.guarnicion2?.nombre,
  ...meal.adicionales.map(item => item.nombre),
].map(name => name?.trim()).filter(Boolean));
</script>

<template>
  <section class="flex h-full min-w-0 flex-col gap-3 px-5 py-5 lg:px-6 lg:py-6">
    <h4 class="flex min-w-0 items-center gap-2 text-sm font-semibold text-primary">
      <Icon
        :name="icon"
        class="size-4 shrink-0"
      />
      <span class="min-w-0">{{ title }}</span>
    </h4>

    <div class="min-w-0 space-y-2.5">
      <p class="break-words text-base font-semibold leading-snug text-highlighted">
        {{ meal.platilloPrincipal.nombre }}
      </p>
      <ul v-if="accompaniments.length" class="space-y-1.5 text-sm leading-relaxed text-toned">
        <li
          v-for="(name, index) in accompaniments"
          :key="`${name}-${index}`"
          class="flex min-w-0 items-start gap-2"
        >
          <span aria-hidden="true" class="mt-2 size-1 shrink-0 rounded-full bg-primary/50" />
          <span class="min-w-0 break-words">{{ name }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
