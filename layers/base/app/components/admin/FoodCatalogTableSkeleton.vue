<script setup lang="ts">
interface Props {
  mode?: "manage" | "select"
}

const props = defineProps<Props>()
const mode = computed(() => props.mode ?? "manage")
const isSelectMode = computed(() => mode.value === "select")
</script>

<template>
  <section class="space-y-0">
    <section
      class="border-b border-default/70"
      :class="isSelectMode ? 'px-4 py-4 sm:px-4' : 'px-5 py-4 sm:px-6'"
    >
      <div
        class="grid gap-4"
        :class="isSelectMode ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_740px] lg:items-center'"
      >
        <div
          v-if="!isSelectMode"
          class="flex flex-col gap-1"
        >
          <USkeleton class="h-5 w-28 rounded-lg" />
          <USkeleton class="h-4 w-40 rounded-lg" />
        </div>

        <div
          class="grid grid-cols-1 gap-3"
          :class="isSelectMode ? 'sm:grid-cols-[minmax(0,1fr)_220px]' : 'md:grid-cols-[360px_220px] md:justify-end'"
        >
          <USkeleton class="h-11 w-full rounded-xl" />
          <USkeleton class="h-11 w-full rounded-xl" />
        </div>
      </div>
    </section>

    <section
      class="space-y-3 px-5 py-5 sm:px-6"
      :class="isSelectMode ? 'sm:px-4' : ''"
    >
      <USkeleton
        v-for="index in 8"
        :key="index"
        class="h-12 w-full rounded-xl"
      />
    </section>
  </section>
</template>
