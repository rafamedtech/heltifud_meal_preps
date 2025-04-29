<script setup lang="ts">
type Step = {
  title: string;
  description: string;
  button: {
    label: string;
    icon: string;
    click: () => void;
  };
  image: string;
};

const { step } = defineProps<{ step: Step }>();

const { title, description, image, button } = step;
</script>

<template>
  <UCard :key="title" variant="subtle" class="rounded-xl shadow">
    <template #header>
      <h3 class="text-primary-500 text-xl">{{ title }}</h3>
    </template>

    <figure class="mx-auto h-56 w-56">
      <img :src="image" :alt="title" class="h-full w-full" >
    </figure>
    <p class="text-dark text-lg dark:text-gray-50">{{ description }}</p>

    <template v-if="button" #footer>
      <section class="flex items-center justify-center">
        <UButton
          :label="button.label"
          size="xl"
          :icon="button.icon"
          trailing
          @click="button.click"
        />
      </section>
    </template>
  </UCard>
</template>
