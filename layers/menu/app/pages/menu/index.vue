<script setup lang="ts">
const { data: activeMenu, status } = useLazyFetch<WeeklyMenu | null>(`/api/menu`)

const startDate = computed(() => (activeMenu.value?.startDate ? formatDate(activeMenu.value.startDate) : ""))
const endDate = computed(() => (activeMenu.value?.endDate ? formatDate(activeMenu.value.endDate) : ""))
const skeletonDays = Array.from({ length: 3 }, (_, index) => index)
const isLoading = computed(() => status.value === "idle" || status.value === "pending")
const hasMenu = computed(() => Boolean(activeMenu.value))

const publicDays = computed(() =>
  (activeMenu.value?.days ?? []).filter((day) => !["SABADO", "DOMINGO"].includes(day.dayOfWeek))
)

useSeoMeta({
  title: "Menú de la semana | Heltifud Meal Preps",
  description:
    "Consulta el menú semanal vigente de Heltifud Meal Preps con desayuno, comida y cena de lunes a viernes.",
  ogTitle: "Menú de la semana | Heltifud Meal Preps",
  ogDescription: "Consulta el menú semanal vigente de Heltifud Meal Preps.",
  twitterTitle: "Menú de la semana | Heltifud Meal Preps",
  twitterDescription: "Descubre el menú semanal vigente de Heltifud."
})
</script>

<template>
  <section>
    <BaseSection title="Menú de la semana">
      <template #description>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <MenuDate
            v-if="status === 'success' && hasMenu"
            :start-date="startDate"
            :end-date="endDate"
          />
          <USkeleton
            v-else-if="isLoading"
            class="h-6 w-55"
          />
        </div>
      </template>

      <section>
        <UCard
          v-if="status === 'success' && !hasMenu"
          variant="subtle"
          class="mx-auto mt-6 max-w-2xl"
          :ui="{ body: 'px-6 py-8 sm:px-8 sm:py-10' }"
        >
          <div class="flex flex-col items-center justify-center gap-3 text-center">
            <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UIcon
                name="i-lucide-calendar-x2"
                class="size-6"
              />
            </div>
            <div class="space-y-1">
              <p class="text-lg font-semibold text-highlighted">No hay menú activo por el momento</p>
              <p class="max-w-xl text-sm text-muted">
                Estamos preparando el próximo menú semanal. Vuelve en unos momentos para consultarlo.
              </p>
            </div>
          </div>
        </UCard>

        <section class="mb-8 md:hidden">
          <section
            v-if="isLoading"
            class="w-full max-w-xs mx-auto pt-6"
          >
            <UCard
              variant="subtle"
              :ui="{ body: 'sm:p-4 p-4' }"
            >
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
            v-for="item in publicDays"
            v-else
            :key="item.dayOfWeek"
            :day="item"
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
