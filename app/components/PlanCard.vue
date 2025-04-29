<script setup lang="ts">
import type { WeeklyPlan } from "@/types";

defineProps<WeeklyPlan>();
</script>

<template>
  <BaseCard
    :title
    :description
    :image
    :button
    cardStyle="complex"
    imageWidth="340"
    imageHeight="480"
  >
  </BaseCard>
</template>
