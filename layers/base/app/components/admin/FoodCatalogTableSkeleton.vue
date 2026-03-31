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

    <div class="overflow-x-auto">
      <table class="min-w-full table-fixed text-sm">
        <colgroup>
          <col class="w-[72%] sm:w-[58%]">
          <col class="hidden sm:table-column sm:w-[18%]">
          <col class="w-[28%] sm:w-[24%]">
        </colgroup>

        <thead class="bg-elevated/50">
          <tr class="border-b border-default/70">
            <th class="px-5 py-3 text-left sm:px-6">
              <USkeleton class="h-4 w-20 rounded-lg" />
            </th>
            <th class="hidden px-5 py-3 text-center sm:table-cell sm:px-6">
              <div class="flex justify-center">
                <USkeleton class="h-4 w-20 rounded-lg" />
              </div>
            </th>
            <th class="px-5 py-3 text-right sm:px-6">
              <div class="flex justify-end">
                <USkeleton class="h-4 w-20 rounded-lg" />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="index in 8"
            :key="index"
            class="border-b border-default/60 last:border-b-0"
          >
            <td class="px-5 py-4 sm:px-6">
              <div class="min-w-0 space-y-2">
                <USkeleton
                  class="h-6 rounded-lg"
                  :class="index % 3 === 0 ? 'w-52' : index % 2 === 0 ? 'w-44' : 'w-36'"
                />

                <div class="flex flex-wrap items-center gap-2">
                  <USkeleton
                    class="h-8 rounded-[var(--app-control-radius)]"
                    :class="index % 3 === 0 ? 'w-24' : index % 2 === 0 ? 'w-28' : 'w-22'"
                  />

                  <USkeleton
                    class="h-5 w-14 rounded-lg sm:hidden"
                  />
                </div>
              </div>
            </td>

            <td class="hidden px-5 py-4 sm:table-cell sm:px-6">
              <div class="flex justify-center">
                <USkeleton class="h-5 w-16 rounded-lg" />
              </div>
            </td>

            <td class="px-5 py-4 sm:px-6">
              <div class="flex justify-end">
                <div
                  v-if="!isSelectMode"
                  class="hidden items-center justify-end gap-4 lg:flex"
                >
                  <div class="flex flex-col items-center gap-1">
                    <USkeleton class="size-5 rounded-md" />
                    <USkeleton class="h-3 w-10 rounded-lg" />
                  </div>
                  <div class="flex flex-col items-center gap-1">
                    <USkeleton class="size-5 rounded-md" />
                    <USkeleton class="h-3 w-12 rounded-lg" />
                  </div>
                </div>

                <USkeleton
                  v-if="!isSelectMode"
                  class="size-8 rounded-lg lg:hidden"
                />

                <USkeleton
                  v-else
                  class="h-9 w-28 rounded-xl"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section
      v-if="!isSelectMode"
      class="flex flex-col gap-3 border-t border-default/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <USkeleton class="h-5 w-56 rounded-lg" />
    </section>
  </section>
</template>
