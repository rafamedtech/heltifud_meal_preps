<script setup lang="ts">
import type { DayMenu } from "~~/layers/menu/shared/types/types"

interface MenuCardProps {
  day: DayMenu
}

const { day } = defineProps<MenuCardProps>()

const labels: Record<DayMenu["dayOfWeek"], string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo"
}
</script>

<template>
  <UCard
    variant="subtle"
    class="min-w-0 h-full overflow-hidden shadow-[0_0_10px_0] shadow-primary/20"
    :ui="{ root: 'flex h-full min-w-0 flex-col overflow-hidden', header: 'shrink-0 px-5 py-4 lg:px-6', body: 'flex flex-1 p-0 sm:p-0' }"
  >
    <template #header>
      <h3 class="text-xl font-bold text-highlighted">{{ labels[day.dayOfWeek] }}</h3>
    </template>

    <section class="grid min-w-0 flex-1 auto-rows-fr grid-cols-1 items-stretch gap-0 divide-y divide-default/70 md:grid-cols-3 md:divide-y-0 md:divide-x">
      <MenuMeal
        :meal="day.desayuno"
        title="Desayuno"
      />
      <MenuMeal
        :meal="day.comida"
        title="Comida"
      />
      <MenuMeal
        :meal="day.cena"
        title="Cena"
      />
    </section>
  </UCard>
</template>
