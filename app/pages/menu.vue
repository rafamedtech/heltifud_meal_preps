<script setup lang="ts">
import type { WeeklyMenu } from '~/types';

const route = useRoute();
const { type = 'std' } = route.query;

const { data: menus } = await useFetch<WeeklyMenu[]>(`/api/menu?type=${type}`);
const activeMenu = ref<WeeklyMenu>(menus.value?.find((menu: WeeklyMenu) => menu.type === type) as WeeklyMenu);

function getMenu(type: string) {
  const filteredMenu = menus.value?.find((menu: WeeklyMenu) => menu.type === type) as WeeklyMenu;
  activeMenu.value = filteredMenu;
  return (
    filteredMenu &&
    navigateTo(`/menu?type=${type}`, {
      replace: true,
    })
  );
}

const startDate = computed(() => formatDate(activeMenu.value?.startDate));
const endDate = computed(() => formatDate(activeMenu.value?.endDate));

useSeoMeta({
  title: 'Menú de la semana',
  description: 'Consulta el menú de la semana',
});
</script>

<template>
  <section>
    <BaseSection title="Menú de la semana">
      <template #description>
        <Icon name="lucide:calendar-days" size="24" /> <span>{{ startDate }}</span> - <span>{{ endDate }}</span>
      </template>

      <section>
        <section class="flex justify-end">
          <SelectMenu @type-changed="(e) => getMenu(e)" />
        </section>
        <section>
          <UCarousel
            v-slot="{ item }"
            class-names
            :items="activeMenu?.days"
            :ui="{
              item: 'basis-[80%] transition-opacity [&:not(.is-snapped)]:opacity-25',
              viewport: 'p-0.5',
            }"
            class="mx-auto max-w-sm py-6 px-2"
          >
            <MenuCard :day="item" />
          </UCarousel>
          <!-- <MenuCard :days="activeMenu?.days" /> -->
        </section>
      </section>
    </BaseSection>

    <USeparator />
  </section>
</template>
