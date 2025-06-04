<script setup lang="ts">
const route = useRoute();
const { type = 'std' } = route.query;

const menuType = ref(type || 'std');

const { data: activeMenu, status } = await useLazyFetch<WeeklyMenu>(`/api/menu?type=${menuType.value}`, {
  default: () => ({} as WeeklyMenu),
});

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
        <ClientOnly>
          <Icon name="lucide:calendar-days" size="24" /> <span>{{ startDate }}</span> - <span>{{ endDate }}</span>
        </ClientOnly>
      </template>

      <section>
        <!-- <section class="flex justify-center md:justify-end">
          <SelectMenu @type-changed="(e) => getMenu(e)" />
        </section> -->
        <section class="mb-8 md:hidden">
          <section v-if="status === 'pending'">
            <!-- <UIcon name="i-lucide-loader" class="animate-spin" /> -->
            cargado...
          </section>
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
