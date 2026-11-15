<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const router = useRouter();
const returnTo = computed(() => (typeof route.query.returnTo === 'string' ? route.query.returnTo : undefined));
const backTo = computed(() => returnTo.value ?? '/admin/platillos');
const hasUnsavedChanges = ref(false);
const leaveConfirmOpen = ref(false);

useSeoMeta({
  title: 'Gestión de platillos | Crear nuevo platillo | Heltifud Meal Preps',
  description: 'Crea un nuevo platillo dentro del catálogo reutilizable del panel administrativo de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
})

async function onSaved(itemId: string) {
  if (typeof route.query.returnTo === 'string') {
    const destination = router.resolve(route.query.returnTo);
    await navigateTo({
      path: destination.path,
      query: {
        ...destination.query,
        createdCatalogItemId: itemId,
      },
      hash: destination.hash,
    });
    return;
  }

  await navigateTo('/admin/platillos');
}

function onDirtyChange(value: boolean) {
  hasUnsavedChanges.value = value;
}

async function onBack() {
  if (hasUnsavedChanges.value) {
    leaveConfirmOpen.value = true;
    return;
  }

  await navigateTo(backTo.value);
}

async function leaveWithoutSaving() {
  leaveConfirmOpen.value = false;
  await navigateTo(backTo.value);
}
</script>

<template>
  <main class="space-y-6">
    <UPageHeader title="Crear nuevo platillo" description="Guarda un platillo reutilizable para los menús semanales.">
      <template #links><UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" label="Regresar" @click="onBack" /></template>
    </UPageHeader>

    <div class="mx-auto w-full max-w-5xl">
      <AdminFoodCatalogForm mode="create" @saved="onSaved" @dirty-change="onDirtyChange" />
    </div>

    <UModal
      v-model:open="leaveConfirmOpen"
      title="Salir sin guardar"
      description="Tienes cambios sin guardar. Si sales ahora, se perderán."
    >
      <template #body>
        <p class="text-sm text-muted">
          ¿Quieres regresar de todos modos?
        </p>
      </template>

      <template #footer>
        <div class="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <UButton
            color="neutral"
            variant="ghost"
            block
            class="sm:w-auto"
            @click="leaveConfirmOpen = false"
          >
            Seguir editando
          </UButton>
          <UButton
            color="warning"
            icon="i-lucide-arrow-left"
            block
            class="sm:w-auto"
            @click="leaveWithoutSaving"
          >
            Salir sin guardar
          </UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>
