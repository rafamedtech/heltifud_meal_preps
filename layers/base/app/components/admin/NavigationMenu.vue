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
        class="app-nav-item group relative flex w-full max-w-[3.9rem] flex-col items-center justify-center gap-1.5 border px-1 py-2.5 text-center transition-all duration-200"
        :class="
          isCurrent(item)
            ? 'border-primary/20 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10'
            : 'border-default/70 bg-default/90 text-muted shadow-sm hover:-translate-y-0.5 hover:border-primary/15 hover:bg-default hover:text-highlighted'
        "
      >
        <UIcon
          :name="item.icon || 'i-heroicons-chevron-right'"
          class="size-6.5 shrink-0"
        />
        <span class="text-[12px] font-medium leading-tight">
          {{ item.label }}
        </span>
      </NuxtLink>
    </section>

    <section
      v-else
      class="flex flex-1 flex-col gap-6 py-2"
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
            class="app-nav-item group flex items-center gap-3 border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200"
            :class="
              isCurrent(item)
                ? 'border-primary/15 bg-primary/10 text-primary shadow-sm'
                : 'text-muted hover:border-default/70 hover:bg-default/90 hover:text-highlighted'
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
            class="space-y-2"
          >
            <div
              class="flex items-center gap-2.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted"
            >
              <UIcon
                :name="item.icon || 'i-heroicons-chevron-right'"
                class="size-4 shrink-0"
              />
              <span>{{ item.label }}</span>
            </div>

            <div class="ml-2 space-y-1.5 border-l border-default/60 pl-4">
              <NuxtLink
                v-for="child in item.children"
                :key="`${child.label}-${child.to}`"
                :to="child.to"
                class="app-nav-item flex items-center gap-2.5 border border-transparent px-3 py-2 text-sm transition-all duration-200"
                :class="
                  isCurrent(child)
                    ? 'border-primary/15 bg-primary/10 font-medium text-primary shadow-sm'
                    : 'text-muted hover:border-default/70 hover:bg-default/90 hover:text-highlighted'
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
