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

const totalItemsLabel = computed(() =>
  `${filteredItems.value.length} ${filteredItems.value.length === 1 ? 'platillo' : 'platillos'}`
);

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
  <main class="flex min-h-full flex-col space-y-6">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Catálogo
        </p>
        <div class="space-y-1">
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
            Platillos
          </h1>
          <p class="max-w-2xl text-sm text-muted">
            Administra tu catálogo, filtra por tipo y mantén cada platillo listo para usar dentro del menú semanal.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 lg:justify-end">
        <UButton
          v-if="returnTo"
          :to="returnTo"
          variant="ghost"
          color="neutral"
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
      </div>
    </section>

    <UCard
      class="flex-1 overflow-hidden border-default/70 bg-default/95 shadow-sm"
      :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0', footer: 'p-0 sm:p-0' }"
    >
      <template #header>
        <section class="border-b border-default/70 px-5 py-4 sm:px-6">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex flex-col gap-1">
              <h2 class="text-sm font-semibold text-highlighted">
                Todos los platillos
              </h2>
              <p class="text-sm text-muted">
                Busca por nombre o tipo y mantén visible el total de resultados en tiempo real.
              </p>
            </div>

            <div class="flex flex-col gap-3 md:flex-row md:items-center xl:min-w-[640px] xl:justify-end">
              <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="Buscar platillo"
                size="lg"
                class="w-full md:max-w-[360px]"
              />

              <USelect
                v-model="selectedType"
                :items="typeOptions"
                value-key="value"
                placeholder="Filtrar por tipo"
                size="lg"
                class="w-full md:max-w-[220px]"
              />

              <UBadge
                color="neutral"
                variant="subtle"
                class="justify-center rounded-full px-3 py-2 text-xs font-medium md:min-w-[120px]"
              >
                {{ totalItemsLabel }}
              </UBadge>
            </div>
          </div>
        </section>
      </template>

      <section v-if="status === 'pending'" class="space-y-3 px-5 py-5 sm:px-6">
        <USkeleton v-for="index in 8" :key="index" class="h-12 w-full rounded-xl" />
      </section>

      <section
        v-else-if="!items.length"
        class="flex min-h-[360px] items-center justify-center px-5 py-10 sm:px-6"
      >
        <div class="max-w-md space-y-3 text-center">
          <div class="mx-auto flex size-12 items-center justify-center rounded-2xl border border-default bg-elevated">
            <UIcon name="i-lucide-package-open" class="size-5 text-muted" />
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-semibold text-highlighted">No hay platillos guardados</h3>
            <p class="text-sm text-muted">
              Empieza creando el primero para que aparezca disponible en los tiempos del menú semanal.
            </p>
          </div>
        </div>
      </section>

      <section
        v-else-if="!filteredItems.length"
        class="flex min-h-[360px] items-center justify-center px-5 py-10 sm:px-6"
      >
        <div class="max-w-md space-y-3 text-center">
          <div class="mx-auto flex size-12 items-center justify-center rounded-2xl border border-default bg-elevated">
            <UIcon name="i-lucide-search-x" class="size-5 text-muted" />
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-semibold text-highlighted">Sin resultados</h3>
            <p class="text-sm text-muted">
              Ajusta la búsqueda o cambia el filtro para volver a ver platillos.
            </p>
          </div>
        </div>
      </section>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full table-fixed text-sm">
          <colgroup>
            <col class="w-[72px]">
            <col class="w-[46%]">
            <col class="w-[20%]">
            <col class="w-[14%]">
            <col class="w-[20%]">
          </colgroup>

          <thead class="bg-elevated/70">
            <tr class="border-b border-default/70">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">
                #
              </th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">
                Nombre
              </th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">
                Tipo
              </th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">
                Calorías
              </th>
              <th class="px-5 py-3 text-right text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in filteredItems"
              :key="item.id"
              class="border-b border-default/60 transition-colors hover:bg-elevated/40 last:border-b-0"
            >
              <td class="px-5 py-4 text-sm text-muted sm:px-6">
                {{ index + 1 }}
              </td>
              <td class="px-5 py-4 sm:px-6">
                <div class="min-w-0 space-y-1">
                  <p class="truncate font-medium text-highlighted">{{ item.nombre }}</p>
                  <p class="truncate text-xs text-muted">
                    {{ item.imagen || 'Sin imagen asignada' }}
                  </p>
                </div>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <UBadge color="neutral" variant="subtle" class="rounded-full px-2.5 py-1">
                  {{ item.tipo || 'Sin tipo' }}
                </UBadge>
              </td>
              <td class="px-5 py-4 font-medium text-highlighted sm:px-6">
                {{ item.calorias }}
              </td>
              <td class="px-5 py-4 sm:px-6">
                <div class="flex justify-end gap-2">
                  <UButton
                    size="sm"
                    variant="ghost"
                    color="neutral"
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <section class="flex flex-col gap-3 border-t border-default/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p class="text-sm text-muted">
            Mostrando <span class="font-medium text-highlighted">{{ filteredItems.length }}</span> de
            <span class="font-medium text-highlighted">{{ items.length }}</span> platillos registrados.
          </p>

          <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1.5">
            Catálogo listo para menú semanal
          </UBadge>
        </section>
      </template>
    </UCard>
  </main>
</template>
