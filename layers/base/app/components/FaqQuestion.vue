<script setup lang="ts">
interface FaqQuestionProps {
  question: string;
  answer: string;
}
const { question, answer } = defineProps<FaqQuestionProps>();
</script>

<template>
  <UCollapsible default-open class="flex flex-col gap-4 px-2">
    <UButton
      class="group text-primary-500 font-bold md:text-xl"
      :label="question"
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
      block
    />

    <template #content>
      <p>{{ answer }}</p>
    </template>
  </UCollapsible>
</template>
