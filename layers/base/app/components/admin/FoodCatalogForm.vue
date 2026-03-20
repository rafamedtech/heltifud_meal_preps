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
] as const;

const state = reactive<FoodCatalogItemInput>(emptyState());
const saving = ref(false);
const invalidFields = reactive<Record<keyof FoodCatalogItemInput, boolean>>({
  nombre: false,
  descripcion: false,
  calorias: false,
  imagen: false,
  tipo: false,
});

const actionLabel = computed(() => (mode.value === 'edit' ? 'Guardar cambios' : 'Crear platillo'));

const { createFoodCatalogItem, updateFoodCatalogItem } = useFoodCatalog();

function clearValidationHighlights() {
  invalidFields.nombre = false;
  invalidFields.descripcion = false;
  invalidFields.calorias = false;
  invalidFields.imagen = false;
  invalidFields.tipo = false;
}

function applyValidationHighlights(issues: { path: (string | number)[] }[]) {
  clearValidationHighlights();

  for (const issue of issues) {
    const [field] = issue.path;

    if (typeof field === 'string' && field in invalidFields) {
      invalidFields[field as keyof FoodCatalogItemInput] = true;
    }
  }
}

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

    clearValidationHighlights();
  },
  { immediate: true }
);

watch(() => state.nombre, () => {
  invalidFields.nombre = false;
});

watch(() => state.descripcion, () => {
  invalidFields.descripcion = false;
});

watch(() => state.calorias, () => {
  invalidFields.calorias = false;
});

watch(() => state.imagen, () => {
  invalidFields.imagen = false;
});

watch(() => state.tipo, () => {
  invalidFields.tipo = false;
});

async function onSubmit() {
  const parsed = foodCatalogItemInputSchema.safeParse(state);

  if (!parsed.success) {
    applyValidationHighlights(parsed.error.issues);
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

    clearValidationHighlights();
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
        <section :class="['app-control-surface px-4 py-3', invalidFields.nombre ? 'app-control-surface-error' : '']">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Nombre</p>
          <UInput
            v-model="state.nombre"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="Ej. Pechuga a la plancha"
            :ui="{ base: 'px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section :class="['app-control-surface px-4 py-3', invalidFields.descripcion ? 'app-control-surface-error' : '']">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Descripción</p>
          <UInput
            v-model="state.descripcion"
            class="mt-2 w-full"
            variant="ghost"
            placeholder="Descripción breve"
            :ui="{ base: 'px-0 text-base bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent', leading: 'ps-0', trailing: 'pe-0' }"
          />
        </section>

        <section :class="['app-control-surface px-4 py-3', invalidFields.calorias ? 'app-control-surface-error' : '']">
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

        <section :class="['app-control-surface px-4 py-3', invalidFields.tipo ? 'app-control-surface-error' : '']">
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

        <section :class="['app-control-surface px-4 py-3', invalidFields.imagen ? 'app-control-surface-error' : '']">
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
