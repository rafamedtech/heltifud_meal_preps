<script setup lang="ts">
interface SectionProps {
  title: string;
  titleSize?: 'base' | 'lg';
  layout?: 'rows' | 'columns';
}

const { layout = 'rows', titleSize = 'base' } = defineProps<SectionProps>();
</script>

<template>
  <section class="py-8">
    <section
      class="flex"
      :class="{
        'flex-col': layout === 'rows',

        'flex-col-reverse gap-4 md:flex-row-reverse md:items-center md:justify-between': layout === 'columns',
      }"
    >
      <article :class="{ 'md:w-1/2': layout === 'columns' }">
        <h2
          class="text-primary-500 font-bold"
          :class="{
            'text-3xl': titleSize === 'base',
            'text-4xl': titleSize === 'lg',
          }"
        >
          {{ title }}
        </h2>
        <p class="py-4 text-lg flex items-center gap-2" :class="{ 'lg:w-1/2': layout === 'rows' }">
          <slot name="description" />
        </p>

        <section v-if="layout === 'columns'" class="flex justify-center md:justify-start">
          <slot name="actions" />
        </section>
      </article>

      <article :class="{ 'md:w-1/2': layout === 'columns' }">
        <slot />
      </article>
    </section>

    <article class="flex flex-col items-center justify-center gap-4">
      <slot name="footer" />
    </article>
  </section>
</template>
