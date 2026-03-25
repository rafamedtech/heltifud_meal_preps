<script setup lang="ts">
import { AppModal } from "#components";
import type { WeeklyPlan } from '~~/layers/menu/shared/types/types';

const props = defineProps<WeeklyPlan>();
const overlay = useOverlay();

function openPlanModal() {
  const modal = overlay.create(AppModal, {
    props: {
      title: `Opciones del ${props.title.toLowerCase()}`,
      variants: props.variants,
      button: {
        icon: "i-heroicons-rocket-launch",
        label: "Ordenar",
        click: () => navigateTo("https://wa.me/c/5216648161284", { external: true, open: { target: "_blank" } })
      }
    }
  });

  modal.open();
}
</script>

<template>
  <BaseCard
    :title
    :description
    :image
    :button="{ ...button, click: openPlanModal }"
    card-style="complex"
    image-width="340"
    image-height="480"
  />
</template>
