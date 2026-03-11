<script setup lang="ts">
const { data: activeMenu, status } = useLazyFetch<WeeklyMenu>(`/api/menu`, {
  default: () => ({}) as WeeklyMenu,
})

const startDate = computed(() => formatDate(activeMenu.value?.startDate))
const endDate = computed(() => formatDate(activeMenu.value?.endDate))
const skeletonDays = Array.from({ length: 3 }, (_, index) => index)
const isLoading = computed(() => status.value === 'idle' || status.value === 'pending')
const publicDays = computed(() =>
  (activeMenu.value?.days ?? []).filter((day) => !['SABADO', 'DOMINGO'].includes(day.dayOfWeek))
)

useSeoMeta({
  title: 'Menú de la semana',
  description: 'Descubre nuestro menú de la semana.',
})
</script>

<template>
  <section>
    <BaseSection title="Menú de la semana">
      <template #description>
        <MenuDate
          v-if="status === 'success'"
          :start-date="startDate"
          :end-date="endDate"
        />
        <USkeleton v-else class="h-6 w-[220px]" />
      </template>

      <section>
        <section class="mb-8 md:hidden">
          <section v-if="isLoading" class="w-full max-w-xs mx-auto pt-6">
            <UCard variant="subtle" :ui="{ body: 'sm:p-4 p-4' }">
              <template #header>
                <USkeleton class="h-7 w-28" />
              </template>

              <section class="grid grid-cols-1 gap-3">
                <USkeleton
                  v-for="day in skeletonDays"
                  :key="`mobile-main-${day}`"
                  class="h-36 w-full rounded-xl"
                />
              </section>

              <section class="grid grid-cols-1 gap-3 mt-3">
                <USkeleton
                  v-for="day in 2"
                  :key="`mobile-snack-${day}`"
                  class="h-28 w-full rounded-xl"
                />
              </section>
            </UCard>
          </section>

          <UCarousel
            v-else-if="status === 'success'"
            ref="carousel"
            v-slot="{ item }"
            :items="publicDays"
            class="w-full max-w-xs mx-auto pt-6"
            wheel-gestures
            dots
          >
            <MenuCard :day="item" />
          </UCarousel>
        </section>

        <section class="hidden md:flex md:flex-col md:gap-8">
          <template v-if="isLoading">
            <UCard
              v-for="day in 5"
              :key="`desktop-skeleton-${day}`"
              variant="subtle"
              :ui="{ body: 'sm:p-4 p-4' }"
            >
              <template #header>
                <USkeleton class="h-7 w-32" />
              </template>

              <section class="grid grid-cols-3 gap-3">
                <USkeleton
                  v-for="meal in 3"
                  :key="`desktop-main-${day}-${meal}`"
                  class="h-36 w-full rounded-xl"
                />
              </section>

              <section class="grid grid-cols-2 gap-3 mt-3">
                <USkeleton
                  v-for="snack in 2"
                  :key="`desktop-snack-${day}-${snack}`"
                  class="h-28 w-full rounded-xl"
                />
              </section>
            </UCard>
          </template>

          <MenuCard
            v-else
            v-for="item in publicDays"
            :day="item"
            :key="item.dayOfWeek"
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
