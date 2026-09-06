<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date';
import type { ButtonProps } from '@nuxt/ui';
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date';

interface Props {
  ariaLabel: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  buttonUi?: ButtonProps['ui'];
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  buttonUi: undefined,
});

const model = defineModel<string>({ required: true });
const dateFormatter = new DateFormatter('es-MX', { dateStyle: 'medium' });

const calendarValue = computed<CalendarDate | null>({
  get() {
    return model.value ? parseDate(model.value.slice(0, 10)) : null;
  },
  set(value) {
    model.value = value?.toString() ?? '';
  },
});

const displayDate = computed(() => calendarValue.value
  ? dateFormatter.format(calendarValue.value.toDate(getLocalTimeZone()))
  : props.ariaLabel);
</script>

<template>
  <UPopover :content="{ align: 'start' }">
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
      :size="props.size"
      :ui="props.buttonUi"
      :aria-label="`Abrir calendario para ${props.ariaLabel.toLocaleLowerCase('es-MX')}`"
      class="w-full justify-start"
      :class="calendarValue ? 'text-highlighted' : 'text-muted'"
    >
      {{ displayDate }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="calendarValue"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
