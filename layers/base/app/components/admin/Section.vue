<script setup lang="ts">
interface SectionProps {
  title: string;
  titleSize?: 'base' | 'lg';
}

const { titleSize = 'base' } = defineProps<SectionProps>();
</script>

<template>
  <section class="py-6">
    <section class="flex flex-col gap-6">
      <article>
        <h2
          class="font-semibold text-highlighted"
          :class="{
            'text-2xl': titleSize === 'base',
            'text-3xl': titleSize === 'lg',
          }"
        >
          {{ title }}
        </h2>
        <p class="pt-2 text-sm text-muted flex items-center gap-2">
          <slot name="description" />
        </p>
      </article>

      <article>
        <slot />
      </article>
    </section>

    <article class="flex flex-col items-center justify-center gap-4 pt-6">
      <slot name="footer" />
    </article>
  </section>
</template>
