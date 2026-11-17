<script setup lang="ts">
import type { ProductionRunDto } from '~~/layers/menu/shared/types/operations'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Etiquetas de producción | Heltifud', robots: 'noindex, nofollow' })
const route = useRoute()
const requestFetch = useRequestFetch()
const { data: runs, error, refresh } = await useAsyncData('label-runs', () => route.query.ciclo ? requestFetch<ProductionRunDto[]>(`/api/operations/production/${String(route.query.ciclo)}`) : Promise.resolve([]))
const run = computed(() => runs.value?.find(r => r.id === route.query.version))
const delivery = ref('all')
const deliveryItems = computed(() => [{ label: 'Todas las entregas', value: 'all' }, ...[...new Set(run.value?.snapshot.meals.map(m => m.scheduledDate) ?? [])].map(d => ({ label: formatDate(d), value: d }))])
const meals = computed(() => run.value?.snapshot.meals.filter(m => delivery.value === 'all' || m.scheduledDate === delivery.value) ?? [])
function printLabels() { window.print() }
</script>

<template>
  <main class="labels-page">
    <div class="print-toolbar space-y-4 py-4">
      <UButton :to="`/admin/produccion?ciclo=${String(route.query.ciclo ?? '')}`" label="Volver a producción" color="neutral" variant="outline" />
      <USelect v-model="delivery" :items="deliveryItems" aria-label="Filtrar entrega" />
      <UButton label="Imprimir etiquetas" icon="i-lucide-printer" :disabled="!run || run.stale || !!error" @click="printLabels" />
      <p class="text-sm text-muted">Formato de referencia 100 × 70 mm. Imprime al 100 % y comprueba una hoja antes del lote. No incluye caducidad ni información nutricional.</p>
      <UAlert v-if="error" color="error" title="No fue posible cargar las etiquetas" :actions="[{ label: 'Reintentar', onClick: () => refresh() }]" />
      <UAlert v-else-if="!run" title="Consolidación no encontrada" description="Vuelve a producción y abre las etiquetas de una versión disponible." color="warning" />
      <UAlert v-else-if="run.stale" title="Consolidación desactualizada" description="Consolida los cambios antes de imprimir este lote." color="warning" />
    </div>
    <div v-if="run && !run.stale && !error" class="label-grid">
      <article v-for="(meal, i) in meals" :key="i" class="meal-label border border-default p-3">
        <p class="font-semibold text-highlighted">HELTIFUD · #{{ meal.folio }} · {{ meal.customer }}</p>
        <p class="text-sm">{{ meal.dayOfWeek }} · {{ meal.slotType }} · Entrega {{ meal.deliverySequence }}: {{ formatDate(meal.scheduledDate) }}</p>
        <ul class="text-sm"><li v-for="(c, j) in meal.components" :key="j">{{ c.name }}{{ c.substitution ? ' · Sustitución' : '' }}</li></ul>
        <p v-if="meal.notes || meal.orderNotes" class="text-sm">{{ [meal.notes, meal.orderNotes].filter(Boolean).join(' · ') }}</p>
        <p v-if="meal.exclusions.length" class="text-sm font-semibold">Revisar: {{ meal.exclusions.join(' · ') }}</p>
        <p class="text-sm text-muted">{{ meal.container || 'Sin contenedor' }} · {{ i + 1 }}/{{ meals.length }}</p>
      </article>
    </div>
  </main>
</template>

<style scoped>
.labels-page { max-width: 210mm; margin: auto; }
.label-grid { display: grid; grid-template-columns: repeat(auto-fit, 100mm); gap: 3mm; }
.meal-label { width: 100mm; min-height: 70mm; overflow-wrap: anywhere; break-inside: avoid; }
@page { size: A4; margin: 3.5mm; }
@media print {
  .print-toolbar { display: none; }
  .meal-label { color: black; border-color: black; }
  .text-muted, .text-highlighted { color: inherit; }
}
</style>
