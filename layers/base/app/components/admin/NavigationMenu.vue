<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

interface Props {
  collapsed?: boolean;
}

const props = defineProps<Props>();
const collapsed = computed(() => props.collapsed ?? false);

const route = useRoute();

type AdminLinkItem = NavigationMenuItem & {
  label?: string;
  to?: string;
  icon?: string;
  children?: AdminLinkItem[];
};

const sections = computed<AdminLinkItem[][]>(() => adminLinks as AdminLinkItem[][]);

const flatItems = computed<AdminLinkItem[]>(() =>
  sections.value.flatMap((group) =>
    group.flatMap((item) => {
      if (item.children?.length) {
        return item.children;
      }

      return [item];
    })
  )
);

function isCurrent(item: AdminLinkItem) {
  if (!item.to) {
    return false;
  }

  return route.path === item.to || route.path.startsWith(`${item.to}/`);
}
</script>

<template>
  <nav class="flex h-full flex-col">
    <section
      v-if="collapsed"
      class="flex flex-1 flex-col items-center gap-2 py-1"
    >
      <UTooltip
        v-for="item in flatItems"
        :key="`${item.label}-${item.to}`"
        :text="item.label"
        :content="{ side: 'right' }"
      >
        <UButton
          :to="item.to"
          square
          size="lg"
          :color="isCurrent(item) ? 'primary' : 'neutral'"
          :variant="isCurrent(item) ? 'soft' : 'ghost'"
          class="size-10 rounded-2xl"
          :icon="item.icon"
        />
      </UTooltip>
    </section>

    <section v-else class="flex flex-1 flex-col gap-6 py-2">
      <section
        v-for="(group, groupIndex) in sections"
        :key="groupIndex"
        class="space-y-2"
      >
        <template v-for="item in group" :key="`${item.label}-${item.to ?? item.value}`">
          <NuxtLink
            v-if="!item.children?.length && item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition"
            :class="isCurrent(item) ? 'bg-primary/10 text-primary' : 'text-highlighted hover:bg-default'"
          >
            <UIcon :name="item.icon || 'i-heroicons-chevron-right'" class="size-5 shrink-0" />
            <span>{{ item.label }}</span>
          </NuxtLink>

          <section v-else class="space-y-2">
            <div class="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-highlighted">
              <UIcon :name="item.icon || 'i-heroicons-chevron-right'" class="size-5 shrink-0" />
              <span>{{ item.label }}</span>
            </div>

            <div class="ml-4 space-y-1 border-l border-default pl-3">
              <NuxtLink
                v-for="child in item.children"
                :key="`${child.label}-${child.to}`"
                :to="child.to"
                class="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition"
                :class="isCurrent(child) ? 'bg-primary/10 font-medium text-primary' : 'text-muted hover:bg-default hover:text-highlighted'"
              >
                <UIcon :name="child.icon || 'i-heroicons-chevron-right'" class="size-4 shrink-0" />
                <span>{{ child.label }}</span>
              </NuxtLink>
            </div>
          </section>
        </template>
      </section>
    </section>
  </nav>
</template>
