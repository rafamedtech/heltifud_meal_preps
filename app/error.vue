<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error?: NuxtError
}>()

useSeoMeta({
  title: 'Página no encontrada | Heltifud Meal Preps',
  description: 'La página solicitada no está disponible en Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <UError
          :error="{
            statusCode: props.error?.statusCode,
            message: 'No se encontró la página que buscas.',
          }"
          :clear="{ label: 'Volver al inicio', icon: 'i-heroicons-home' }"
        />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
