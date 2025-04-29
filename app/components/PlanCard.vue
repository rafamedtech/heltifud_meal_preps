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
    card-style="complex"
    image-width="340"
    image-height="480"
  />
</template>
