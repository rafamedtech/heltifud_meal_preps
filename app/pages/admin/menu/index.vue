<script setup lang="ts">
import type { WeeklyMenu } from '~/types';
const { data: menus } = await useFetch<WeeklyMenu[]>(`/api/menu/all`);

// const activeLabel = computed(() => (menu: WeeklyMenu) => {
//   return menu.isActive ? 'Activo' : 'Activar';
// });

// create a new array and group the menus based on the name

const activeIcon = computed(() => (menu: WeeklyMenu) => {
  return menu.isActive ? 'i-lucide-check' : 'i-lucide-x';
});

const buttonVariant = computed(() => (menu: WeeklyMenu) => {
  return menu.isActive ? 'solid' : 'outline';
});

const buttonColor = computed(() => (menu: WeeklyMenu) => {
  return menu.isActive ? 'primary' : 'neutral';
});

definePageMeta({
  layout: 'admin',
});
</script>

<template>
  <main>
    <AdminSection title="Administrar menús">
      <template #description>
        <span>Gestiona los menus semanales</span>
      </template>

      <section class="flex gap-6">
        <UCard v-for="menu in menus" :key="menu.id" class="relative">
          <template #header>
            <h3 class="text-lg font-bold text-primary-500">
              {{ menu.name }}
            </h3>
          </template>

          <section class="flex flex-col gap-4">
            <UButton variant="subtle" color="neutral" class="cursor-pointer">Estandar</UButton>
            <UButton variant="subtle" color="neutral" class="cursor-pointer">Vegetariano</UButton>
          </section>

          <UButton
            :icon="activeIcon(menu)"
            :variant="buttonVariant(menu)"
            :color="buttonColor(menu)"
            class="absolute -top-4 -right-4 rounded-full"
            square
          />
        </UCard>
      </section>
    </AdminSection>
  </main>
</template>
