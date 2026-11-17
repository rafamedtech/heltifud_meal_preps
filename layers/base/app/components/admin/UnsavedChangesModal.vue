<script setup lang="ts">
// Confirmation shown by `useLeaveGuard` before discarding unsaved changes.
const open = defineModel<boolean>('open', { required: true })

withDefaults(defineProps<{
  description?: string
}>(), {
  description: 'Tienes cambios sin guardar. Si sales ahora, se perderán.'
})

const emit = defineEmits<{
  leave: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    title="Salir sin guardar"
    :description="description"
    :ui="{ content: 'max-w-md' }"
  >
    <template #body>
      <p class="text-sm text-muted">
        ¿Quieres salir de todos modos?
      </p>
    </template>

    <template #footer>
      <div class="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          block
          class="sm:w-auto"
          @click="open = false"
        >
          Seguir editando
        </UButton>
        <UButton
          color="warning"
          icon="i-lucide-arrow-left"
          block
          class="sm:w-auto"
          @click="emit('leave')"
        >
          Salir sin guardar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
