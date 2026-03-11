<script setup lang="ts">
import { foodCatalogItemInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type { FoodCatalogItem, FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

interface Props {
  item?: FoodCatalogItem | null;
  mode?: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
  mode: 'create',
});

const emit = defineEmits<{
  saved: [itemId: string];
}>();

const route = useRoute();
const toast = useToast();

const emptyState = (): FoodCatalogItemInput => ({
  nombre: '',
  descripcion: '',
  calorias: 0,
  imagen: '',
  tipo: '',
});

const typeOptions = [
  { label: 'Desayuno', value: 'desayuno' },
  { label: 'Comida', value: 'comida' },
  { label: 'Cena', value: 'cena' },
  { label: 'Snack', value: 'snack' },
  { label: 'Guarnición', value: 'guarnicion' },
  { label: 'Ramekin', value: 'ramekin' },
  { label: 'Proteína', value: 'proteina' },
  { label: 'Verdura', value: 'verdura' },
  { label: 'Fruta', value: 'fruta' },
  { label: 'Salsa', value: 'salsa' },
  { label: 'Adicional', value: 'adicional' },
] as const;

const state = reactive<FoodCatalogItemInput>(emptyState());
const saving = ref(false);

const returnTo = computed(() =>
  typeof route.query.returnTo === 'string' ? route.query.returnTo : undefined
);

const title = computed(() => (props.mode === 'edit' ? 'Editar platillo' : 'Nuevo platillo'));
const actionLabel = computed(() => (props.mode === 'edit' ? 'Guardar cambios' : 'Crear platillo'));

const { createFoodCatalogItem, updateFoodCatalogItem } = useFoodCatalog();

watch(
  () => props.item,
  (item) => {
    Object.assign(state, item ? {
      nombre: item.nombre,
      descripcion: item.descripcion,
      calorias: item.calorias,
      imagen: item.imagen,
      tipo: item.tipo,
    } : emptyState());
  },
  { immediate: true }
);

async function onSubmit() {
  const parsed = foodCatalogItemInputSchema.safeParse(state);

  if (!parsed.success) {
    toast.add({
      title: 'Error de validación',
      description: parsed.error.issues[0]?.message ?? 'Revisa la información del platillo.',
      color: 'error',
    });
    return;
  }

  saving.value = true;

  try {
    const savedItem =
      props.mode === 'edit' && props.item?.id
        ? await updateFoodCatalogItem(props.item.id, parsed.data)
        : await createFoodCatalogItem(parsed.data);

    toast.add({
      title: props.mode === 'edit' ? 'Platillo actualizado' : 'Platillo creado',
      color: 'success',
    });

    emit('saved', savedItem.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar el platillo';
    toast.add({ title: 'Error', description: message, color: 'error' });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <main class="space-y-4">
    <section v-if="returnTo" class="flex justify-start">
      <UButton
        :to="returnTo"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        Regresar
      </UButton>
    </section>

    <UCard>
      <template #header>
        <section class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-primary-500">
              {{ title }}
            </h3>
            <p class="text-sm text-muted mt-1">Guarda piezas reutilizables para insertarlas rápido en tus tiempos.</p>
          </div>
        </section>
      </template>

      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <section class="rounded-xl border border-default bg-default px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Nombre</p>
          <UInput
            v-model="state.nombre"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="Ej. Pechuga a la plancha"
            :ui="{ base: 'px-0 text-base', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section class="rounded-xl border border-default bg-default px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Descripción</p>
          <UTextarea
            v-model="state.descripcion"
            class="mt-2 w-full"
            variant="ghost"
            :rows="3"
            placeholder="Descripción breve"
            :ui="{ base: 'px-0 text-base' }"
          />
        </section>

        <section class="rounded-xl border border-default bg-default px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Calorías</p>
          <UInput
            v-model.number="state.calorias"
            class="mt-2 w-full"
            variant="ghost"
            type="number"
            min="0"
            :ui="{ base: 'px-0 text-base', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section class="rounded-xl border border-default bg-default px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Tipo</p>
          <USelect
            v-model="state.tipo"
            :items="typeOptions"
            value-key="value"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="Selecciona un tipo"
            :ui="{ base: 'px-0 text-base' }"
          />
        </section>

        <section class="rounded-xl border border-default bg-default px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Imagen (URL)</p>
          <UInput
            v-model="state.imagen"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="https://..."
            :ui="{ base: 'px-0 text-base', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section class="flex justify-end">
          <UButton type="submit" :loading="saving" icon="i-lucide-save">
            {{ actionLabel }}
          </UButton>
        </section>
      </UForm>
    </UCard>
  </main>
</template>
