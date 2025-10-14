<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps({
  error: Object as () => NuxtError,
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <UError
          :error="{
            statusCode: error?.statusCode,
            message: 'No se encontró la página que buscas.',
          }"
          :clear="{ label: 'Volver al inicio', icon: 'i-heroicons-home' }"
        />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
