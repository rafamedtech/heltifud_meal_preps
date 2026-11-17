<script setup lang="ts">
import type { Plan } from '~~/layers/menu/shared/types/types';

const props = defineProps<Plan>();
function openPlanModal() {
  return navigateTo({ path: '/pedido', query: { plan: props.id, variante: props.variants[0]?.id } });
}
</script>

<template>
  <BaseCard
    :title
    :description
    :image
    :button="{ label: 'Elegir plan', icon: 'i-lucide-utensils', click: openPlanModal }"
    card-style="complex"
    image-width="340"
    image-height="480"
  />
</template>
