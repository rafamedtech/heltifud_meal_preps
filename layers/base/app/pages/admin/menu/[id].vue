<script setup lang="ts">
import type { WeeklyMenu } from '~~/layers/menu/shared/types/types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();

const { data: menu, status, refresh, error } = useLazyFetch<WeeklyMenu>(`/api/menu/${route.params.id}`, {
  key: `admin-menu-${route.params.id}`,
});

const isLoading = computed(() => status.value === 'idle' || status.value === 'pending');

useSeoMeta({
  title: 'Gestión de menús semanales | Editar menú | Heltifud Meal Preps',
  description: 'Edita un menú semanal existente dentro del panel de gestión de menús de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})

async function onSaved() {
  await refresh();
  await navigateTo('/admin/menu');
}
</script>

<template>
  <main class="min-h-full space-y-6">
    <section
      v-if="isLoading"
      class="flex min-h-[70vh] items-center justify-center"
    >
      <div class="flex flex-col items-center gap-4 text-center">
        <div class="flex size-14 items-center justify-center rounded-full border border-default/70 bg-elevated shadow-sm">
          <UIcon
            name="i-lucide-loader-circle"
            class="size-7 animate-spin text-primary"
          />
        </div>

        <div class="space-y-1">
          <p class="text-lg font-semibold text-primary">Cargando</p>
          <p class="text-sm text-muted">Estamos preparando el menú semanal para editarlo.</p>
        </div>
      </div>
    </section>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      title="No se pudo cargar el menú"
      :description="error.statusMessage || 'Intenta de nuevo en unos segundos.'"
      icon="i-lucide-circle-alert"
    />

    <AdminMenuForm v-else-if="menu" :menu="menu" mode="edit" @saved="onSaved" />
  </main>
</template>
