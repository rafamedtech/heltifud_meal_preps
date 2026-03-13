<script setup lang="ts">
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

      <section class="grid gap-8 py-8 md:grid-cols-4 md:gap-4">
        <PlanCard v-for="plan in weeklyPlans" :key="plan.id" v-bind="plan" />
      </section>
    </BaseSection>

    <USeparator />
  </section>
</template>
