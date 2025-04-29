<script setup lang="ts">
import type { WeeklyMenu } from '~/types';

const route = useRoute();
const { type } = route.query;
const activeMenu = computed<WeeklyMenu>(() => {
  return menus.find((menu) => menu.type === type && menu.isActive) as WeeklyMenu;
});

console.log(activeMenu.value);
</script>

<template>
  <UContainer>
    <BaseSection title="Menú de la semana">
      <template #description>
        {{ formatDate(activeMenu?.startDate as string) }} -
        {{ formatDate(activeMenu?.endDate as string) }}
      </template>

      <section class="space-y-8 mt-6 flex gap-4">
        <MenuCard :days="activeMenu?.days" />
      </section>
    </BaseSection>

    <USeparator />
  </UContainer>
</template>
