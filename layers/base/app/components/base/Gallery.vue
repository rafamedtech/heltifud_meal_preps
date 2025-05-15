<script setup lang="ts">
interface Item {
  id: number;
  title: string;
  description?: string;
  image: string;
}

interface GalleryProps {
  items: Item[];
  autoplay?: number | false;
  arrows?: boolean;
  dots?: boolean;
  loop?: boolean;
}

const { items, autoplay = false, arrows = false, dots = false, loop = false } = defineProps<GalleryProps>();
</script>

<template>
  <UCarousel
    v-slot="{ item }"
    :loop
    :dots
    :arrows
    :autoplay="autoplay ? { delay: Number(autoplay) } : false"
    :items="items"
    :ui="{ item: 'md:basis-1/3', dots: '-bottom-4' }"
  >
    <section class="p-2">
      <BaseCard
        :key="item.id"
        :title="item.title"
        title-style="center"
        :description="item.description"
        :image="item.image"
      />
    </section>
  </UCarousel>
</template>
