<script setup lang="ts">
// Aquí podrías importar composables o datos si se requiere
</script>

<template>
  <UContainer>
    <BaseSection title="Planes semanales">
      <template #description>
        Elige el plan que mejor se adapte a tus necesidades y disfruta de la
        comodidad de recibir tus comidas en casa.
      </template>

      <section class="grid gap-8 py-8 md:grid-cols-4 md:gap-4">
        <PlanCard v-for="plan in weeklyPlans" :key="plan.id" v-bind="plan" />
      </section>
    </BaseSection>

    <USeparator />
  </UContainer>
</template>
