<script setup lang="ts">
import { AppModal } from "#components";
import type { Plan } from '~~/layers/menu/shared/types/types';

const props = defineProps<Plan>();

function openPlanModal() {
  const overlay = useOverlay();
  const modal = overlay.create(AppModal, {
    props: {
      title: `Opciones del ${props.title.toLowerCase()}`,
      variants: props.variants.map(variant => ({
        title: variant.title,
        price: new Intl.NumberFormat('es-MX').format(variant.price)
      })),
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
    :button="{ label: 'Ver opciones', icon: 'i-heroicons-numbered-list', click: openPlanModal }"
    card-style="complex"
    image-width="340"
    image-height="480"
  />
</template>
