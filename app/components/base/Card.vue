<script setup lang="ts">
interface BaseCardProps {
  cardStyle?: "basic" | "complex";
  variant?: "outline" | "subtle";
  titleStyle?: "left" | "center";
  title: string;
  description?: string;
  button?: {
    label: string;
    icon: string;
    click: () => void;
  };
  image: string;
  imageWidth?: string;
  imageHeight?: string;
  imageAlt?: string;
}

const {
  cardStyle = "basic",
  variant = "subtle",
  title,
  titleStyle = "left",
  description,
  image,
  imageWidth = "400",
  imageHeight = "400",
  imageAlt = "",
  button,
} = defineProps<BaseCardProps>();
</script>

<template>
  <UCard :variant="variant" class="rounded-xl shadow">
    <template #header v-if="cardStyle === 'complex'">
      <h3 class="text-xl font-bold">{{ title }}</h3>
    </template>

    <figure class="mx-auto mb-4 overflow-hidden rounded-lg">
      <NuxtImg
        :src="image"
        :alt="imageAlt"
        :width="imageWidth"
        :height="imageHeight"
      />
    </figure>
    <h3
      class="text-primary-500 text-xl"
      :class="{ 'text-center': titleStyle === 'center' }"
      v-if="cardStyle === 'basic'"
    >
      {{ title }}
    </h3>
    <p v-if="description" class="text-lg md:text-base dark:text-gray-50">
      {{ description }}
    </p>

    <slot />

    <template v-if="button" #footer>
      <section class="flex items-center justify-center">
        <BaseButton
          :label="button.label"
          :icon="button.icon"
          @click="button.click"
        />
      </section>
    </template>
  </UCard>
</template>
