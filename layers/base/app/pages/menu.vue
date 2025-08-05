<script setup lang="ts">
const { data: activeMenu, status } = await useLazyFetch<WeeklyMenu>(`/api/menu`, {
  default: () => ({}) as WeeklyMenu,
});

const startDate = computed(() => formatDate(activeMenu.value?.startDate));
const endDate = computed(() => formatDate(activeMenu.value?.endDate));

const { data: menu } = await useAsyncData('menu', () => {
  return queryCollection('menu').where('isActive', '=', true).first();
});

console.log(menu.value?.meta.body);

useSeoMeta({
  title: 'Menú de la semana',
  description: 'Consulta el menú de la semana',
});
</script>

<template>
  <section>
    <BaseSection title="Menú de la semana">
      <template #description>
        <ClientOnly>
          <Icon name="lucide:calendar-days" size="24" /> <span>{{ startDate }}</span> - <span>{{ endDate }}</span>
        </ClientOnly>
      </template>

      <section>
        <section class="mb-8 md:hidden">
          <section v-if="status === 'pending'">cargado...</section>
          <UCarousel
            v-if="status === 'success'"
            ref="carousel"
            v-slot="{ item }"
            :items="activeMenu?.daysStd"
            class="w-full max-w-xs mx-auto py-6"
            wheel-gestures
            dots
          >
            <MenuCard :day="item" />
          </UCarousel>
        </section>

        <section class="hidden md:flex md:flex-col md:gap-8">
          <MenuCard v-for="item in activeMenu?.daysStd" :day="item" :key="item.id" />
        </section>

        <section class="pt-8 flex justify-center items-center">
          <UButton label="Quiero hacer un pedido" icon="i-mdi-whatsapp" prefetch size="lg" />
        </section>
      </section>
    </BaseSection>
  </section>
</template>
