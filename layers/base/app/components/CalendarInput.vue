<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date';
import type { ButtonProps } from '@nuxt/ui';
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date';

interface Props {
  label: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  buttonUi?: ButtonProps['ui'];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: undefined,
  buttonUi: undefined,
  disabled: false,
});

const model = defineModel<string>({ required: true });
const open = ref(false);
const dateFormatter = new DateFormatter('es-MX', { dateStyle: 'medium' });

const calendarValue = computed<CalendarDate | null>({
  get() {
    return model.value ? parseDate(model.value.slice(0, 10)) : null;
  },
  set(value) {
    model.value = value?.toString() ?? '';
    // Choosing a day completes the input, as in DatePicker.
    if (value) open.value = false;
  },
});

const displayDate = computed(() => calendarValue.value
  ? dateFormatter.format(calendarValue.value.toDate(getLocalTimeZone()))
  : props.label);
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'start' }">
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
      :size="props.size"
      :ui="props.buttonUi"
      :disabled="props.disabled"
      :aria-label="`Abrir calendario para ${props.label.toLocaleLowerCase('es-MX')}`"
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
