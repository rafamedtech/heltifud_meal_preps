<script setup lang="ts">
const { data: activeMenu, status } = await useFetch<WeeklyMenu>(`/api/menu`, {
  default: () => ({}) as WeeklyMenu,
  lazy: true,
})

const startDate = computed(() => formatDate(activeMenu.value?.startDate))
const endDate = computed(() => formatDate(activeMenu.value?.endDate))

useSeoMeta({
  title: 'Menú de la semana',
  description: 'Descubre nuestro menú de la semana.',
})
</script>

<template>
  <section>
    <BaseSection title="Menú de la semana">
      <template #description>
        <ClientOnly>
          <MenuDate
            v-if="status === 'success'"
            :start-date="startDate"
            :end-date="endDate"
          />
          <template #fallback>
            <USkeleton class="h-6 w-[200px]" />
          </template>
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
            class="w-full max-w-xs mx-auto pt-6"
            wheel-gestures
            dots
          >
            <MenuCard :day="item" />
          </UCarousel>
        </section>

        <section class="hidden md:flex md:flex-col md:gap-8">
          <MenuCard
            v-for="item in activeMenu?.daysStd"
            :day="item"
            :key="item.id"
          />
        </section>

        <section class="pt-8 flex justify-center items-center">
          <UButton
            label="Quiero hacer un pedido"
            icon="i-mdi-whatsapp"
            prefetch
            size="lg"
          />
        </section>
      </section>
    </BaseSection>
  </section>
</template>
