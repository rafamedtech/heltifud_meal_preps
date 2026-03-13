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
  <main class="space-y-6">
    <section v-if="isLoading" class="space-y-6">
      <section class="space-y-2">
        <USkeleton class="h-4 w-24 rounded-lg" />
        <USkeleton class="h-10 w-80 rounded-lg" />
        <USkeleton class="h-5 w-full max-w-2xl rounded-lg" />
      </section>

      <section class="space-y-4">
        <USkeleton class="h-[180px] w-full rounded-xl" />
        <USkeleton class="h-[720px] w-full rounded-xl" />
      </section>
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
