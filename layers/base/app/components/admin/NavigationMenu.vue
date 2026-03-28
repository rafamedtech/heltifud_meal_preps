<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

interface Props {
  collapsed?: boolean
}

const props = defineProps<Props>()
const collapsed = computed(() => props.collapsed ?? false)

const route = useRoute()

const collapsedItemIconClass = "size-7 shrink-0"
const collapsedItemLabelClass = "text-[11px] font-medium leading-tight"
const expandedItemIconClass = "size-[18px] shrink-0"
const expandedItemLabelClass = "text-[15px] font-medium"

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

  const normalizeAdminPath = (path: string) => path.replace(/\/$/, "").split("/").filter(Boolean).slice(1)

  const currentSegments = normalizeAdminPath(route.path)
  const itemSegments = normalizeAdminPath(item.to)

  if (!itemSegments.length) {
    return currentSegments.length === 0
  }

  return itemSegments.every((segment, index) => currentSegments[index] === segment)
}
</script>

<template>
  <nav class="flex h-full flex-col">
    <section
      v-if="collapsed"
      class="flex flex-1 flex-col items-center gap-2 py-1"
    >
      <NuxtLink
        v-for="item in flatItems"
        :key="`${item.label}-${item.to}`"
        :to="item.to"
        class="app-nav-item app-sidebar-link group relative flex w-full max-w-15 flex-col items-center justify-center gap-1.5 px-1 py-2.5 text-center transition-all duration-200"
        :class="isCurrent(item) ? 'app-sidebar-link-active text-primary' : 'text-muted hover:text-highlighted'"
      >
        <UIcon
          :name="item.icon || 'i-heroicons-chevron-right'"
          :class="collapsedItemIconClass"
        />
        <span :class="collapsedItemLabelClass">
          {{ item.label }}
        </span>
      </NuxtLink>
    </section>

    <section
      v-else
      class="flex flex-1 flex-col gap-2.5 py-0.5"
    >
      <section
        v-for="(group, groupIndex) in sections"
        :key="groupIndex"
        class="space-y-1"
      >
        <template
          v-for="item in group"
          :key="`${item.label}-${item.to ?? item.value}`"
        >
          <NuxtLink
            v-if="!item.children?.length && item.to"
            :to="item.to"
            class="app-nav-item app-sidebar-link group flex items-center gap-3 px-3 py-1.5 text-sm font-medium transition-all duration-200"
            :class="isCurrent(item) ? 'app-sidebar-link-active text-primary' : 'text-muted hover:text-highlighted'"
          >
            <UIcon
              :name="item.icon || 'i-heroicons-chevron-right'"
              :class="expandedItemIconClass"
            />
            <span :class="expandedItemLabelClass">{{ item.label }}</span>
          </NuxtLink>

          <section
            v-else
            class="space-y-0.5"
          >
            <div class="flex items-center gap-2.5 px-3 py-0.5 text-[14px] font-medium text-muted">
              <UIcon
                :name="item.icon || 'i-heroicons-chevron-right'"
                :class="expandedItemIconClass"
              />
              <span>{{ item.label }}</span>
            </div>

            <div class="app-sidebar-subtree ml-2 space-y-0 pl-4">
              <NuxtLink
                v-for="child in item.children"
                :key="`${child.label}-${child.to}`"
                :to="child.to"
                class="app-nav-item app-sidebar-link flex items-center gap-2.5 px-3 py-1 text-[14px] transition-all duration-200"
                :class="
                  isCurrent(child)
                    ? 'app-sidebar-link-active font-medium text-primary'
                    : 'text-muted hover:text-highlighted'
                "
              >
                <UIcon
                  :name="child.icon || 'i-heroicons-chevron-right'"
                  :class="expandedItemIconClass"
                />
                <span :class="expandedItemLabelClass">{{ child.label }}</span>
              </NuxtLink>
            </div>
          </section>
        </template>
      </section>
    </section>
  </nav>
</template>
