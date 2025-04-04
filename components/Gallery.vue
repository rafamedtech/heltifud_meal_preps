<script setup lang="ts">
const items = [
  {
    id: 1,
    title: "Albondigas",
    image: "/albondigas.jpeg",
  },
  {
    id: 2,
    title: "Pechuga a la plancha",
    image: "/pechuga-plancha.jpeg",
  },
  {
    id: 3,
    title: "Pechuga al chipotle",
    image: "/pechuga-chipotle.jpeg",
  },
  {
    id: 4,
    title: "Carne asada",
    image: "/carne-asada.jpeg",
  },
];
</script>

<template>
  <UCarousel
    v-slot="{ item }"
    loop
    arrows
    dots
    :autoplay="{ delay: 2000 }"
    :items="items"
    :ui="{ item: 'md:basis-1/3' }"
  >
    <section class="p-2 md:p-4">
      <BaseCard
        :key="item.id"
        :title="item.title"
        title-style="center"
        :image="item.image"
      />
    </section>
  </UCarousel>
</template>
