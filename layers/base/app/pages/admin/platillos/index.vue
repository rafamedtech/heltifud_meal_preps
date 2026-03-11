<script setup lang="ts">
import type { FoodCatalogItem } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const toast = useToast();
const deletingId = ref<string | null>(null);

const { data: items, refresh, status } = await useFetch<FoodCatalogItem[]>('/api/food-components', {
  default: () => [],
});

const { deleteFoodCatalogItem } = useFoodCatalog();

const returnTo = computed(() =>
  typeof route.query.returnTo === 'string' ? route.query.returnTo : undefined
);

const search = ref('');
const selectedType = ref<'todos' | string>('todos');

const typeOptions = computed(() => [
  { label: 'Todos', value: 'todos' },
  ...Array.from(new Set(items.value.map((item) => item.tipo).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((tipo) => ({
      label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      value: tipo,
    })),
]);

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase();

  return items.value.filter((item) => {
    const matchesType = selectedType.value === 'todos' || item.tipo === selectedType.value;
    const matchesSearch =
      !query ||
      item.nombre.toLowerCase().includes(query) ||
      item.descripcion.toLowerCase().includes(query) ||
      item.tipo.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });
});

async function onDelete(id: string) {
  deletingId.value = id;

  try {
    await deleteFoodCatalogItem(id);
    await refresh();
    toast.add({ title: 'Platillo eliminado', color: 'success' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el platillo';
    toast.add({ title: 'Error', description: message, color: 'error' });
  } finally {
    deletingId.value = null;
  }
}
</script>

<template>
  <main>
    <AdminSection title="Platillos" title-size="lg">
      <template #description>
        <span>Explora tu catálogo, busca rápido por nombre y filtra por tipo.</span>
      </template>

      <section class="space-y-4 w-full">
        <UCard variant="subtle" class="w-full min-w-[1120px]">
          <section class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <section class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(420px,640px)_240px]">
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Buscar por nombre, descripción o tipo"
                class="w-full"
              />

              <USelect
                v-model="selectedType"
                :items="typeOptions"
                value-key="value"
                placeholder="Filtrar por tipo"
                class="w-full"
              />
            </section>

            <section class="flex items-center justify-between gap-3 lg:justify-end">
              <UButton
                v-if="returnTo"
                :to="returnTo"
                variant="ghost"
                icon="i-lucide-arrow-left"
              >
                Regresar
              </UButton>

              <UButton
                :to="{ path: '/admin/platillos/crear-nuevo', query: returnTo ? { returnTo } : {} }"
                icon="i-lucide-plus"
              >
                Nuevo platillo
              </UButton>
            </section>
          </section>
        </UCard>

        <section v-if="status === 'pending'" class="space-y-3">
          <USkeleton v-for="index in 5" :key="index" class="h-14 w-full" />
        </section>

        <UAlert
          v-else-if="!items.length"
          class="w-full min-w-[1120px]"
          title="No hay platillos guardados"
          description="Empieza creando el primero desde el botón de arriba."
          color="neutral"
          variant="soft"
          icon="i-lucide-package-open"
        />

        <UAlert
          v-else-if="!filteredItems.length"
          class="w-full min-w-[1120px]"
          title="Sin resultados"
          description="Ajusta la búsqueda o cambia el filtro por tipo."
          color="neutral"
          variant="soft"
          icon="i-lucide-search-x"
        />

        <UCard v-else :ui="{ body: 'p-0 sm:p-0' }">
          <div class="overflow-x-auto">
            <table class="min-w-[1120px] w-[1120px] table-fixed text-sm">
              <colgroup>
                <col class="w-[260px]">
                <col class="w-[160px]">
                <col class="w-[120px]">
                <col class="w-[420px]">
                <col class="w-[160px]">
              </colgroup>

              <thead class="bg-neutral-50 dark:bg-neutral-900/60">
                <tr class="border-b border-default">
                  <th class="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th class="px-4 py-3 text-left font-semibold">Tipo</th>
                  <th class="px-4 py-3 text-left font-semibold">Calorías</th>
                  <th class="px-4 py-3 text-left font-semibold">Descripción</th>
                  <th class="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in filteredItems"
                  :key="item.id"
                  class="border-b border-default last:border-b-0"
                >
                  <td class="px-4 py-3 font-medium text-highlighted truncate">{{ item.nombre }}</td>
                  <td class="px-4 py-3">
                    <UBadge color="neutral" variant="soft">{{ item.tipo }}</UBadge>
                  </td>
                  <td class="px-4 py-3">{{ item.calorias }}</td>
                  <td class="px-4 py-3 text-muted truncate">
                    {{ item.descripcion || 'Sin descripción.' }}
                  </td>
                  <td class="px-4 py-3">
                    <section class="flex justify-end gap-2">
                      <UButton
                        size="sm"
                        variant="outline"
                        icon="i-lucide-pencil"
                        :to="{ path: `/admin/platillos/${item.id}`, query: returnTo ? { returnTo } : {} }"
                      >
                        Editar
                      </UButton>
                      <UButton
                        size="sm"
                        color="error"
                        variant="ghost"
                        icon="i-lucide-trash"
                        :loading="deletingId === item.id"
                        @click="onDelete(item.id)"
                      />
                    </section>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>
    </AdminSection>
  </main>
</template>
