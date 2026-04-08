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
    class="min-w-0 h-full min-h-90 overflow-hidden md:min-h-0"
    :ui="{ root: 'h-full min-w-0 overflow-hidden', body: 'p-0 sm:p-0 h-full' }"
  >
    <template #header>
      <h3 class="text-xl font-bold text-primary-500">{{ labels[day.dayOfWeek] }}</h3>
    </template>

    <section class="grid grid-cols-1 gap-0 divide-y divide-default/70 md:grid-cols-3 md:divide-y-0 md:divide-x">
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
