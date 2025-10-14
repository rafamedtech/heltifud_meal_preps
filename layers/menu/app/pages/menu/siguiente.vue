<script setup lang="ts">
const { data: nextMenu, status } = await useLazyFetch<WeeklyMenu>(`/api/menu/next`, {
  default: () => ({} as WeeklyMenu),
})

const startDate = computed(() => formatDate(nextMenu.value?.startDate))
const endDate = computed(() => formatDate(nextMenu.value?.endDate))

useSeoMeta({
  title: 'Menú de la siguiente semana',
  description: 'Versión preliminar del menú de la siguiente semana',
})
</script>

<template>
  <section>
    <BaseSection title="Menú de la siguiente semana">
      <template #description>
        <ClientOnly>
          <section class="flex items-center gap-2">
            <Icon
              name="lucide:calendar-days"
              size="24"
            />
            <span>{{ startDate }}</span> - <span>{{ endDate }}</span>
          </section>

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
            :items="nextMenu?.daysStd"
            class="w-full max-w-xs mx-auto py-6"
            wheel-gestures
            dots
          >
            <MenuCard :day="item" />
          </UCarousel>
        </section>

        <section class="hidden md:flex md:flex-col md:gap-8">
          <MenuCard
            v-for="item in nextMenu?.daysStd"
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
