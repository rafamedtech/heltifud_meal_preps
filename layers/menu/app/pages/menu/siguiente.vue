<script setup lang="ts">
const { data: nextMenu, status } = await useLazyFetch<WeeklyMenu>(`/api/menu/next`, {
  default: () => ({} as WeeklyMenu),
})

const session = useSupabaseSession()
const startDate = computed(() => formatDate(nextMenu.value?.startDate))
const endDate = computed(() => formatDate(nextMenu.value?.endDate))
const skeletonDays = Array.from({ length: 3 }, (_, index) => index)
const canEditMenu = computed(() => Boolean(session.value && nextMenu.value?.id))
const editMenuLink = computed(() => nextMenu.value?.id ? `/admin/menu/${nextMenu.value.id}` : '/admin/menu')
const publicDays = computed(() =>
  (nextMenu.value?.days ?? []).filter((day) => !['SABADO', 'DOMINGO'].includes(day.dayOfWeek))
)

useSeoMeta({
  title: 'Próximo menú semanal | Heltifud Meal Preps',
  description: 'Revisa el próximo menú semanal de Heltifud Meal Preps y conoce la siguiente rotación disponible.',
  ogTitle: 'Próximo menú semanal | Heltifud Meal Preps',
  ogDescription: 'Consulta la siguiente rotación del menú semanal de Heltifud.',
  twitterTitle: 'Próximo menú semanal | Heltifud Meal Preps',
  twitterDescription: 'Conoce el próximo menú semanal de Heltifud.',
})
</script>

<template>
  <section>
    <BaseSection title="Menú de la siguiente semana">
      <template #description>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <section v-if="status === 'success'" class="flex items-center gap-2">
            <Icon
              name="lucide:calendar-days"
              size="24"
            />
            <span>{{ startDate }}</span> - <span>{{ endDate }}</span>
          </section>
          <USkeleton v-else class="h-6 w-[220px]" />

          <UButton
            v-if="canEditMenu"
            label="Editar este menú"
            icon="i-lucide-square-pen"
            color="neutral"
            variant="outline"
            :to="editMenuLink"
            size="sm"
          />
        </div>
      </template>

      <section>
        <section class="mb-8 md:hidden">
          <section v-if="status === 'pending'" class="w-full max-w-xs mx-auto py-6">
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
            v-if="status === 'success'"
            ref="carousel"
            v-slot="{ item }"
            :items="publicDays"
            class="w-full max-w-xs mx-auto py-6"
            wheel-gestures
            dots
          >
            <MenuCard :day="item" />
          </UCarousel>
        </section>

        <section class="hidden md:flex md:flex-col md:gap-8">
          <template v-if="status === 'pending'">
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
