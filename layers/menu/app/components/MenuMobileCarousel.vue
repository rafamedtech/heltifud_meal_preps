<script setup lang="ts">
import type { DayMenu } from "~~/layers/menu/shared/types/types"

const { days } = defineProps<{
  days: DayMenu[]
}>()

const activeIndex = ref(0)
const touchStartX = ref<number | null>(null)

const activeDayLabel = computed(() => days[activeIndex.value]?.dayOfWeek ?? "")
const trackStyle = computed(() => ({
  transform: `translate3d(-${activeIndex.value * 100}%, 0, 0)`
}))

watch(
  () => days.length,
  (length) => {
    if (activeIndex.value >= length) {
      activeIndex.value = Math.max(length - 1, 0)
    }
  }
)

function goTo(index: number) {
  activeIndex.value = Math.min(Math.max(index, 0), Math.max(days.length - 1, 0))
}

function goToPrevious() {
  goTo(activeIndex.value - 1)
}

function goToNext() {
  goTo(activeIndex.value + 1)
}

function onTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0]?.clientX ?? null
}

function onTouchEnd(event: TouchEvent) {
  if (touchStartX.value === null) {
    return
  }

  const endX = event.changedTouches[0]?.clientX ?? touchStartX.value
  const distance = touchStartX.value - endX
  touchStartX.value = null

  if (Math.abs(distance) < 40) {
    return
  }

  if (distance > 0) {
    goToNext()
    return
  }

  goToPrevious()
}
</script>

<template>
  <section
    v-if="days.length"
    class="min-w-0 pt-6"
    role="region"
    aria-roledescription="carousel"
    :aria-label="`Menú semanal, día actual ${activeDayLabel}`"
    tabindex="0"
    @keydown.left.prevent="goToPrevious"
    @keydown.right.prevent="goToNext"
  >
    <div
      class="w-full min-w-0 overflow-hidden"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div
        class="flex w-full min-w-0 transition-transform duration-300 ease-out will-change-transform"
        :style="trackStyle"
      >
        <section
          v-for="day in days"
          :key="day.dayOfWeek"
          class="w-full min-w-full max-w-full shrink-0 p-0.5"
          role="group"
          aria-roledescription="slide"
          :aria-label="day.dayOfWeek"
        >
          <MenuCard :day="day" />
        </section>
      </div>
    </div>

    <div
      class="mt-7 flex items-center justify-center gap-3"
      role="tablist"
      aria-label="Elegir día del menú"
    >
      <button
        v-for="(_, index) in days"
        :key="index"
        type="button"
        class="size-3 rounded-full bg-accented transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="{ 'bg-inverted': activeIndex === index }"
        role="tab"
        :aria-label="`Ir al día ${index + 1}`"
        :aria-selected="activeIndex === index"
        @click="goTo(index)"
      />
    </div>
  </section>
</template>
