<script setup lang="ts">
import type { NuxtError } from '#app'

interface ErrorProps {
  error: NuxtError
}

const { error } = defineProps<ErrorProps>()
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <UError
          :error="{
            statusCode: error.statusCode,
            message: 'No se encontró la página que buscas.',
          }"
          :clear="{ label: 'Volver al inicio', icon: 'i-heroicons-home' }"
        />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
