<script setup lang="ts">
import type { FoodCatalogItem, FoodItemDetail } from '~~/layers/menu/shared/types/types';

interface Props {
  title: string;
  optional?: boolean;
  catalogItems?: FoodCatalogItem[];
}

const props = withDefaults(defineProps<Props>(), {
  optional: false,
  catalogItems: () => [],
});
const model = defineModel<FoodItemDetail>({ required: true });
const route = useRoute();

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
];

const selectedCatalogId = ref<string | undefined>();

const catalogOptions = computed(() =>
  props.catalogItems.map((item) => ({
    label: item.nombre,
    calorias: item.calorias,
    tipo: item.tipo,
    value: item.id,
  }))
);

const returnTo = computed(() => route.fullPath);

const createComponentLink = computed(() => ({
  path: '/admin/platillos/crear-nuevo',
  query: { returnTo: returnTo.value },
}));

const editComponentLink = computed(() => ({
  path: `/admin/platillos/${selectedCatalogId.value}`,
  query: {
    returnTo: returnTo.value,
  },
}));

function applyCatalogItem(itemId: string | undefined) {
  selectedCatalogId.value = itemId;

  if (!itemId) {
    return;
  }

  const selected = props.catalogItems.find((item) => item.id === itemId);

  if (!selected) {
    return;
  }

  model.value.nombre = selected.nombre;
  model.value.descripcion = selected.descripcion;
  model.value.calorias = selected.calorias;
  model.value.imagen = selected.imagen;
  model.value.tipo = selected.tipo;
}
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'space-y-3' }">
    <h4 class="font-semibold text-sm">
      {{ title }} <span v-if="optional" class="text-xs opacity-70">(opcional)</span>
    </h4>

    <UFormField label="Seleccionar platillo">
      <section class="flex flex-col gap-2 xl:flex-row">
        <USelect
          v-model="selectedCatalogId"
          :items="catalogOptions"
          value-key="value"
          class="flex-1"
          placeholder="Selecciona un platillo guardado"
          @update:model-value="applyCatalogItem"
        >
          <template #item-label="{ item }">
            <span class="flex items-center justify-between gap-3">
              <span>{{ item.label }}</span>
              <span class="flex items-center gap-2">
                <span class="text-primary">{{ item.calorias }} cal</span>
                <UBadge color="neutral" variant="soft" size="sm">{{ item.tipo }}</UBadge>
              </span>
            </span>
          </template>
        </USelect>

        <section class="flex gap-2">
          <UButton :to="createComponentLink" variant="outline" size="sm" icon="i-lucide-plus">Nuevo</UButton>
          <UButton
            :to="selectedCatalogId ? editComponentLink : createComponentLink"
            variant="ghost"
            size="sm"
            icon="i-lucide-pencil"
            :disabled="!selectedCatalogId"
          >
            Editar
          </UButton>
        </section>
      </section>
    </UFormField>

    <UFormField label="Nombre">
      <UInput v-model="model.nombre" placeholder="Nombre" />
    </UFormField>

    <UFormField label="Descripción">
      <UTextarea v-model="model.descripcion" :rows="2" placeholder="Descripción" />
    </UFormField>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <UFormField label="Calorías">
        <UInput v-model.number="model.calorias" type="number" min="0" />
      </UFormField>

      <UFormField label="Tipo">
        <USelect
          v-model="model.tipo"
          :items="typeOptions"
          value-key="value"
          placeholder="Selecciona un tipo"
        />
      </UFormField>
    </section>

    <UFormField label="Imagen (URL)">
      <UInput v-model="model.imagen" placeholder="https://..." />
    </UFormField>
  </UCard>
</template>
