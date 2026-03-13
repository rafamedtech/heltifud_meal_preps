<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

interface Props {
  collapsed?: boolean
}

const props = defineProps<Props>()
const collapsed = computed(() => props.collapsed ?? false)

const route = useRoute()

type AdminLinkItem = NavigationMenuItem & {
  label?: string
  to?: string
  icon?: string
  children?: AdminLinkItem[]
}

const sections = computed<AdminLinkItem[][]>(() => adminLinks as AdminLinkItem[][])

const flatItems = computed<AdminLinkItem[]>(() =>
  sections.value.flatMap((group) =>
    group.flatMap((item) => {
      if (item.children?.length) {
        return item.children
      }

      return [item]
    })
  )
)

function isCurrent(item: AdminLinkItem) {
  if (!item.to) {
    return false
  }

  return route.path === item.to
}
</script>

<template>
  <nav class="flex h-full flex-col">
    <section
      v-if="collapsed"
      class="flex flex-1 flex-col items-center gap-3 py-1"
    >
      <NuxtLink
        v-for="item in flatItems"
        :key="`${item.label}-${item.to}`"
        :to="item.to"
        class="flex w-full max-w-[3.75rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-center transition"
        :class="
          isCurrent(item)
            ? 'border-primary/20 bg-primary/8 text-primary shadow-sm'
            : 'border-default bg-elevated text-muted shadow-sm hover:bg-elevated hover:text-highlighted'
        "
      >
        <UIcon
          :name="item.icon || 'i-heroicons-chevron-right'"
          class="size-7 shrink-0"
        />
        <span class="text-[12px] font-medium leading-tight">
          {{ item.label }}
        </span>
      </NuxtLink>
    </section>

    <section
      v-else
      class="flex flex-1 flex-col gap-6 py-1"
    >
      <section
        v-for="(group, groupIndex) in sections"
        :key="groupIndex"
        class="space-y-2"
      >
        <template
          v-for="item in group"
          :key="`${item.label}-${item.to ?? item.value}`"
        >
          <NuxtLink
            v-if="!item.children?.length && item.to"
            :to="item.to"
            class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isCurrent(item)
                ? 'bg-elevated text-highlighted'
                : 'text-muted hover:bg-elevated/80 hover:text-highlighted'
            "
          >
            <UIcon
              :name="item.icon || 'i-heroicons-chevron-right'"
              class="size-5 shrink-0"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>

          <section
            v-else
            class="space-y-1.5"
          >
            <div
              class="flex items-center gap-2.5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted uppercase"
            >
              <UIcon
                :name="item.icon || 'i-heroicons-chevron-right'"
                class="size-4 shrink-0"
              />
              <span>{{ item.label }}</span>
            </div>

            <div class="ml-2 space-y-1 pl-5">
              <NuxtLink
                v-for="child in item.children"
                :key="`${child.label}-${child.to}`"
                :to="child.to"
                class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors"
                :class="
                  isCurrent(child)
                    ? 'bg-elevated font-medium text-highlighted'
                    : 'text-muted hover:bg-elevated/80 hover:text-highlighted'
                "
              >
                <UIcon
                  :name="child.icon || 'i-heroicons-chevron-right'"
                  class="size-4 shrink-0"
                />
                <span>{{ child.label }}</span>
              </NuxtLink>
            </div>
          </section>
        </template>
      </section>
    </section>
  </nav>
</template>
