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
}

const {
  cardStyle = "basic",
  variant = "subtle",
  title,
  titleStyle = "left",
  description,
  image,
  button,
} = defineProps<BaseCardProps>();
</script>

<template>
  <UCard :variant="variant" class="rounded-xl shadow">
    <template #header v-if="cardStyle === 'complex'">
      <h3 class="text-primary-500 text-xl">{{ title }}</h3>
    </template>

    <figure class="mx-auto mb-4 overflow-hidden rounded-lg">
      <NuxtImg :src="image" :alt="title" width="400" height="400" />
    </figure>
    <h3
      class="text-primary-500 text-xl"
      :class="{ 'text-center': titleStyle === 'center' }"
      v-if="cardStyle === 'basic'"
    >
      {{ title }}
    </h3>
    <p v-if="description" class="text-lg lg:text-base dark:text-gray-50">
      {{ description }}
    </p>

    <template v-if="button" #footer>
      <section class="flex items-center justify-center">
        <UButton
          :label="button.label"
          size="lg"
          :icon="button.icon"
          @click="button.click"
          trailing
        />
      </section>
    </template>
  </UCard>
</template>
