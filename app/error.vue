<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error?: NuxtError
}>()
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
