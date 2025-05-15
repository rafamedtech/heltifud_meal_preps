<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui';

const items = ref([
  {
    label: 'Regular',
    value: 'std',
    icon: 'i-lucide-beef',
  },
  {
    label: 'Vegetariano',
    value: 'veg',
    icon: 'i-lucide-leaf',
  },
] satisfies SelectItem[]);
const route = useRoute();
const value = ref(route.query.type === 'std' ? items.value[0]?.value : items.value[1]?.value);

const icon = computed(() => items.value.find((item) => item.value === value.value)?.icon);

const emits = defineEmits(['typeChanged']);

const typeChanged = (event: string) => {
  emits('typeChanged', event);
};
</script>

<template>
  <UFormField label="Tipo de menú" class="w-52">
    <USelect
      v-model="value"
      @update:model-value="typeChanged"
      :items="items"
      value-key="value"
      :icon="icon"
      class="w-52"
      :ui="{
        leadingIcon: value === 'std' ? 'text-amber-800' : 'text-primary-500',
      }"
    />
  </UFormField>
</template>
