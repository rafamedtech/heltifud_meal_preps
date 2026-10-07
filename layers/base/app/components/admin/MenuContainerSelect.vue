<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const { layout = "select" } = defineProps<{
  layout?: "select" | "cards"
}>()

const model = defineModel<string>()
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
  <div
    v-if="layout === 'cards'"
    v-bind="attrs"
    role="radiogroup"
    aria-label="Tipo de contenedor"
    class="grid grid-cols-2 gap-2 sm:grid-cols-5"
  >
    <button
      v-for="option in contenedorOptions"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="contenedorModel === option.value"
      :aria-label="option.label"
      :class="[
        'relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        contenedorModel === option.value
          ? 'border-primary bg-primary/10 ring-1 ring-inset ring-primary'
          : 'border-default bg-default hover:border-accented hover:bg-elevated/50'
      ]"
      @click="contenedorModel = option.value"
    >
      <UIcon
        :name="option.icon"
        :class="['size-5', contenedorModel === option.value ? 'text-primary' : 'text-muted']"
      />
      <span class="min-w-0">
        <span class="block text-base font-semibold leading-tight text-highlighted">{{ option.capacidad }}</span>
        <span class="mt-0.5 block text-xs text-muted">{{ option.tipo }}</span>
      </span>
      <UIcon
        v-if="contenedorModel === option.value"
        name="i-lucide-circle-check"
        class="absolute right-2 top-2 size-4 text-primary"
      />
    </button>
  </div>

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
