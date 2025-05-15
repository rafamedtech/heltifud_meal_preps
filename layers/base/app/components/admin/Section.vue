<script setup lang="ts">
interface SectionProps {
  title: string;
  titleSize?: 'base' | 'lg';
}

const { titleSize = 'base' } = defineProps<SectionProps>();
</script>

<template>
  <section class="py-8">
    <section class="flex flex-col">
      <article>
        <h2
          class="text-primary-500 font-bold"
          :class="{
            'text-3xl': titleSize === 'base',
            'text-4xl': titleSize === 'lg',
          }"
        >
          {{ title }}
        </h2>
        <p class="py-4 text-lg flex items-center gap-2">
          <slot name="description" />
        </p>
      </article>

      <article>
        <slot />
      </article>
    </section>

    <article class="flex flex-col items-center justify-center gap-4">
      <slot name="footer" />
    </article>
  </section>
</template>
