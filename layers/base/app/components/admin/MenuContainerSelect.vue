<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const { layout = "select" } = defineProps<{
  layout?: "select" | "cards"
}>()

const model = defineModel<string | null>()
const attrs = useAttrs()

const contenedorOptions = [
  { label: "Sin división 28oz", value: "Sin división 28oz", tipo: "Sin división", capacidad: "28oz", icon: "i-lucide-square" },
  { label: "Sin división 38oz", value: "Sin división 38oz", tipo: "Sin división", capacidad: "38oz", icon: "i-lucide-square" },
  { label: "Sin división 12oz", value: "Sin división 12oz", tipo: "Sin división", capacidad: "12oz", icon: "i-lucide-square" },
  { label: "Con división 30oz", value: "Con división 30oz", tipo: "Con división", capacidad: "30oz", icon: "i-lucide-layout-panel-left" },
  { label: "Redondo 24oz", value: "Redondo 24oz", tipo: "Redondo", capacidad: "24oz", icon: "i-lucide-circle" }
]

const contenedorModel = computed<string | undefined>({
  get: () => model.value ?? undefined,
  set: (value) => {
    model.value = value ?? ""
  }
})
</script>

<template>
  <URadioGroup
    v-if="layout === 'cards'"
    v-bind="attrs"
    v-model="contenedorModel"
    :items="contenedorOptions.map(option => ({ ...option, label: option.capacidad, description: option.tipo }))"
    variant="card"
    orientation="horizontal"
    aria-label="Tipo de contenedor"
    :ui="{ fieldset: 'grid grid-cols-2 gap-2 sm:grid-cols-5' }"
  />

  <USelect
    v-else
    v-bind="attrs"
    v-model="contenedorModel"
    :items="contenedorOptions"
    placeholder="Selecciona un contenedor"
    aria-label="Tipo de contenedor"
    icon="i-lucide-package"
  />
</template>
