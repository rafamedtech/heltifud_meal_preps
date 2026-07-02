<script setup lang="ts">
useSeoMeta({
  title: "Preguntas frecuentes | Heltifud Meal Preps",
  description:
    "Encuentra respuestas a las preguntas más comunes sobre nuestro servicio de meal prep, entregas y personalización de comidas.",
  ogTitle: "Preguntas frecuentes | Heltifud Meal Preps",
  ogDescription:
    "Respuestas a tus dudas sobre planes de alimentación, envíos a domicilio y menús saludables en Tijuana.",
  twitterTitle: "Preguntas frecuentes | Heltifud Meal Preps",
  twitterDescription: "Todo lo que necesitas saber sobre Heltifud Meal Preps, entregas y comidas saludables."
})
</script>

<template>
  <section>
    <BaseSection title="Preguntas frecuentes">
      <template #description>
        Aquí encontrarás respuestas a las preguntas más comunes sobre nuestro servicio. Si tienes alguna duda adicional,
        no dudes en contactarnos.
      </template>

      <section class="mx-auto flex flex-col justify-between gap-8 py-8 md:w-2/3 lg:w-1/2">
        <FaqQuestion
          v-for="question in faqQuestions"
          :key="question.id"
          :question="question.question"
          :answer="question.answer"
        />
      </section>
    </BaseSection>

    <BaseSeparator />
  </section>
</template>
