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
          class="font-semibold tracking-tight text-primary"
          :class="{
            'text-2xl': titleSize === 'base',
            'text-3xl': titleSize === 'lg',
          }"
        >
          {{ title }}
        </h2>
        <p class="flex items-center gap-2 pt-2 text-sm text-muted">
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
