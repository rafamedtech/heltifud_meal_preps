<script setup lang="ts">
import type { Plan } from "~~/layers/menu/shared/types/types"

const { data: plans, status, error, refresh } = await useFetch<Plan[]>("/api/plans", {
  default: () => []
})

useSeoMeta({
  title: 'Planes semanales | Heltifud Meal Preps',
  description: 'Explora los planes semanales de Heltifud y elige la opción que mejor se adapte a tus objetivos y estilo de vida.',
  ogTitle: 'Planes semanales | Heltifud Meal Preps',
  ogDescription: 'Consulta los planes semanales disponibles y recibe tus comidas saludables en casa.',
  twitterTitle: 'Planes semanales | Heltifud Meal Preps',
  twitterDescription: 'Elige un plan semanal y recibe tus comidas saludables a domicilio.',
})
</script>

<template>
  <section>
    <BaseSection title="Planes semanales">
      <template #description>
        Elige el plan que mejor se adapte a tus necesidades y disfruta de la comodidad de recibir tus comidas en casa.
      </template>

      <section v-if="status === 'pending'" class="grid gap-8 py-8 md:grid-cols-4 md:gap-4">
        <USkeleton v-for="index in 4" :key="index" class="h-120 rounded-3xl" />
      </section>

      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="No pudimos cargar los planes"
        description="Intenta nuevamente en unos momentos."
        :actions="[{ label: 'Reintentar', onClick: () => refresh() }]"
        class="my-8"
      />

      <section v-else-if="plans.length" class="grid gap-8 py-8 md:grid-cols-2 xl:grid-cols-4 md:gap-4">
        <PlanCard v-for="plan in plans" :key="plan.id" v-bind="plan" />
      </section>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        icon="i-lucide-calendar-clock"
        title="Estamos preparando los próximos planes"
        description="Escríbenos por WhatsApp y con gusto te ayudamos."
        class="my-8"
      />
    </BaseSection>

    <BaseSeparator />
  </section>
</template>
