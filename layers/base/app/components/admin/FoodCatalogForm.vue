<script setup lang="ts">
import { foodCatalogItemInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type { FoodCatalogItem, FoodCatalogItemInput } from '~~/layers/menu/shared/types/types';

interface Props {
  item?: FoodCatalogItem | null;
  mode?: 'create' | 'edit';
}

const props = defineProps<Props>();
const item = computed(() => props.item ?? null);
const mode = computed(() => props.mode ?? 'create');

const emit = defineEmits<{
  saved: [itemId: string];
}>();

const route = useRoute();
const toast = useToast();
function getSingleQueryValue(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0].trim();
  }

  return '';
}

const prefilledName = computed(() =>
  getSingleQueryValue(route.query.nombre)
);
const prefilledType = computed(() =>
  getSingleQueryValue(route.query.tipo)
);

const emptyState = (nombre = '', tipo = ''): FoodCatalogItemInput => ({
  nombre,
  descripcion: '',
  calorias: 0,
  imagen: '',
  tipo,
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

const actionLabel = computed(() => (mode.value === 'edit' ? 'Guardar cambios' : 'Crear platillo'));

const { createFoodCatalogItem, updateFoodCatalogItem } = useFoodCatalog();

watch(
  [() => item.value, () => prefilledName.value, () => prefilledType.value],
  ([item, nombre, tipo]) => {
    Object.assign(state, item ? {
      nombre: item.nombre,
      descripcion: item.descripcion,
      calorias: item.calorias,
      imagen: item.imagen,
      tipo: item.tipo,
    } : emptyState(mode.value === 'create' ? nombre : '', mode.value === 'create' ? tipo : ''));
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
      mode.value === 'edit' && item.value?.id
        ? await updateFoodCatalogItem(item.value.id, parsed.data)
        : await createFoodCatalogItem(parsed.data);

    toast.add({
      title: mode.value === 'edit' ? 'Platillo actualizado' : 'Platillo creado',
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
    <UCard class="app-surface">
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <section class="app-control-surface px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Nombre</p>
          <UInput
            v-model="state.nombre"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="Ej. Pechuga a la plancha"
            :ui="{ base: 'px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section class="app-control-surface px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Descripción</p>
          <UTextarea
            v-model="state.descripcion"
            class="mt-2 w-full"
            variant="ghost"
            :rows="3"
            placeholder="Descripción breve"
            :ui="{ base: 'px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent' }"
          />
        </section>

        <section class="app-control-surface px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Calorías</p>
          <UInput
            v-model.number="state.calorias"
            class="mt-2 w-full"
            variant="ghost"
            type="number"
            min="0"
            :ui="{ base: 'px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section class="app-control-surface px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Tipo</p>
          <USelect
            v-model="state.tipo"
            :items="typeOptions"
            value-key="value"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="Selecciona un tipo"
            :ui="{ base: 'px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent' }"
          />
        </section>

        <section class="app-control-surface px-4 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Imagen (URL)</p>
          <UInput
            v-model="state.imagen"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="https://..."
            :ui="{ base: 'px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section class="flex justify-end pt-2">
          <UButton type="submit" :loading="saving" icon="i-lucide-save" class="shadow-sm">
            {{ actionLabel }}
          </UButton>
        </section>
      </UForm>
    </UCard>
  </main>
</template>
