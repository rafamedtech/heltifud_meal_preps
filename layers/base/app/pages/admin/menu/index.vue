<script setup lang="ts">
import type { WeeklyMenu } from '~~/layers/menu/shared/types/types';

const { data: menus, refresh, status } = await useFetch<WeeklyMenu[]>('/api/menu/all', {
  default: () => [],
});

const { deleteMenuOnDB, setActiveMenuOnDB } = useMenu();
const toast = useToast();
const deletingId = ref<string | null>(null);
const activatingId = ref<string | null>(null);

async function onDelete(id: string) {
  deletingId.value = id;

  try {
    await deleteMenuOnDB(id);
    await refresh();
    toast.add({ title: 'Menú eliminado', color: 'success' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar';
    toast.add({ title: 'Error', description: message, color: 'error' });
  } finally {
    deletingId.value = null;
  }
}

async function onSetActive(id: string) {
  activatingId.value = id;

  try {
    await setActiveMenuOnDB(id);
    await refresh();
    toast.add({ title: 'Menú activo actualizado', color: 'success' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el menú activo';
    toast.add({ title: 'Error', description: message, color: 'error' });
  } finally {
    activatingId.value = null;
  }
}

definePageMeta({
  layout: 'admin',
});
</script>

<template>
  <main>
    <AdminSection title="Menú semanal" title-size="lg">
      <template #description>
        <span>Crea nuevos menús, edita los existentes y mantén visible la próxima rotación semanal.</span>
      </template>

      <template #footer>
        <section class="w-full flex justify-end">
          <UButton to="/admin/menu/crear-nuevo" icon="i-lucide-plus">Nuevo menú</UButton>
        </section>
      </template>

      <section class="space-y-4">
        <UCard variant="subtle">
          <section class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-muted">Panel</p>
              <h3 class="text-2xl font-bold text-primary-500">Administra tu rotación semanal</h3>
              <p class="text-sm text-muted mt-1">Cada menú guarda 7 días con desayuno, comida, cena y dos snacks.</p>
            </div>

            <div class="grid grid-cols-2 gap-3 lg:w-[300px]">
              <UCard>
                <p class="text-xs text-muted">Menús creados</p>
                <p class="text-2xl font-bold">{{ menus.length }}</p>
              </UCard>
              <UCard>
                <p class="text-xs text-muted">Activo manual</p>
                <p class="text-2xl font-bold">{{ menus.filter((menu) => menu.isActive).length }}</p>
              </UCard>
            </div>
          </section>
        </UCard>

        <section v-if="status === 'pending'" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <USkeleton v-for="index in 4" :key="index" class="h-48 w-full" />
        </section>

        <UAlert
          v-else-if="!menus.length"
          title="Aún no hay menús"
          description="Empieza creando el primer menú semanal desde el botón de arriba."
          color="neutral"
          variant="soft"
          icon="i-lucide-notebook-tabs"
        />

        <section v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <UCard v-for="menu in menus" :key="menu.id" class="border border-primary-100/80">
            <template #header>
              <section class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-bold text-primary-500">{{ menu.name }}</h3>
                  <p class="text-sm text-muted mt-1">
                    {{ formatDate(menu.startDate) }} - {{ formatDate(menu.endDate) }}
                  </p>
                </div>

                <UBadge :color="menu.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ menu.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </section>
            </template>

              <section class="space-y-3">
              <p class="text-sm text-muted">
                {{ menu.days.length }} días configurados con 5 momentos por día.
              </p>

              <section class="grid grid-cols-2 gap-2 text-sm">
                <div class="rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
                  <span class="text-muted">Creado</span>
                  <p class="font-medium">{{ formatDate(menu.createdAt) }}</p>
                </div>
                <div class="rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
                  <span class="text-muted">Actualizado</span>
                  <p class="font-medium">{{ formatDate(menu.updatedAt) }}</p>
                </div>
              </section>
            </section>

            <template #footer>
              <section class="flex flex-wrap justify-end gap-2">
                <UButton
                  :variant="menu.isActive ? 'soft' : 'outline'"
                  :color="menu.isActive ? 'success' : 'primary'"
                  icon="i-lucide-badge-check"
                  :loading="activatingId === menu.id"
                  :disabled="menu.isActive"
                  @click="onSetActive(menu.id)"
                >
                  {{ menu.isActive ? 'Activo' : 'Activar' }}
                </UButton>
                <UButton :to="`/admin/menu/${menu.id}`" variant="outline" icon="i-lucide-pencil">
                  Editar
                </UButton>
                <UButton :to="'/menu'" variant="ghost" icon="i-lucide-eye">
                  Ver público
                </UButton>
                <UButton
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash"
                  :loading="deletingId === menu.id"
                  @click="onDelete(menu.id)"
                >
                  Eliminar
                </UButton>
              </section>
            </template>
          </UCard>
        </section>
      </section>
    </AdminSection>
  </main>
</template>
