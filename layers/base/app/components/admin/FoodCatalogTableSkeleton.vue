<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
defineProps<{ mode?: "manage" | "select" }>()
const columns: TableColumn<{ nombre: string; calorias: number }>[] = [
  { accessorKey: "nombre", header: "Platillo" },
  { accessorKey: "calorias", header: "Calorías" },
  { id: "actions", header: "Acciones" }
]
</script>

<template>
  <UTable :data="[]" :columns="columns" loading aria-label="Cargando platillos">
    <template #loading><div class="space-y-4"><USkeleton v-for="index in 5" :key="index" class="h-10 w-full rounded-md" /></div></template>
  </UTable>
</template>
