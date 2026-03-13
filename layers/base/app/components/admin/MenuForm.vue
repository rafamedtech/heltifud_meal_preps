<script setup lang="ts">
import { weeklyMenuInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import {
  DAY_OF_WEEK_VALUES,
  type DayOfWeek,
  type DayMenu,
  type FoodCatalogItem,
  type FoodItemDetail,
  type MenuSlot,
  type WeeklyMenu,
  type WeeklyMenuInput,
} from '~~/layers/menu/shared/types/types';

interface Props {
  menu?: WeeklyMenu | null;
  mode?: 'create' | 'edit';
}

type MenuSectionKey = 'desayuno' | 'comida' | 'cena' | 'snacks';

const props = defineProps<Props>();
const menu = computed(() => props.menu ?? null);
const mode = computed(() => props.mode ?? 'create');

const emit = defineEmits<{
  saved: [menuId: string];
}>();

const DAY_LABELS: Record<(typeof DAY_OF_WEEK_VALUES)[number], string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

function createEmptyFoodItem(): FoodItemDetail {
  return {
    catalogItemId: null,
    nombre: '',
    descripcion: '',
    calorias: 0,
    imagen: '',
    tipo: '',
  };
}

function createEmptySlot(): MenuSlot {
  return {
    platilloPrincipal: createEmptyFoodItem(),
    guarnicion1: createEmptyFoodItem(),
    guarnicion2: createEmptyFoodItem(),
    contenedor: '',
    adicionales: [],
  };
}

function createDay(dayOfWeek: (typeof DAY_OF_WEEK_VALUES)[number]): DayMenu {
  return {
    dayOfWeek,
    desayuno: createEmptySlot(),
    comida: createEmptySlot(),
    cena: createEmptySlot(),
    snack1: createEmptySlot(),
    snack2: createEmptySlot(),
  };
}

function cloneFoodItem(item?: FoodItemDetail | null): FoodItemDetail {
  if (!item) {
    return createEmptyFoodItem();
  }

  return {
    catalogItemId: item.catalogItemId ?? null,
    nombre: item.nombre ?? '',
    descripcion: item.descripcion ?? '',
    calorias: item.calorias ?? 0,
    imagen: item.imagen ?? '',
    tipo: item.tipo ?? '',
  };
}

function cloneSlot(slot?: MenuSlot | null): MenuSlot {
  return {
    platilloPrincipal: cloneFoodItem(slot?.platilloPrincipal),
    guarnicion1: cloneFoodItem(slot?.guarnicion1),
    guarnicion2: cloneFoodItem(slot?.guarnicion2),
    contenedor: slot?.contenedor ?? '',
    adicionales: (slot?.adicionales ?? []).map((item) => cloneFoodItem(item)),
  };
}

function createStateFromMenu(menu?: WeeklyMenu | null): WeeklyMenuInput {
  if (!menu) {
    return {
      name: '',
      startDate: new Date(),
      endDate: new Date(),
      days: DAY_OF_WEEK_VALUES.map((day) => createDay(day)),
    };
  }

  const byDay = new Map(menu.days.map((day) => [day.dayOfWeek, day]));

  return {
    name: menu.name,
    startDate: new Date(menu.startDate),
    endDate: new Date(menu.endDate),
    days: DAY_OF_WEEK_VALUES.map((dayOfWeek) => {
      const source = byDay.get(dayOfWeek);

      return {
        dayOfWeek,
        desayuno: cloneSlot(source?.desayuno),
        comida: cloneSlot(source?.comida),
        cena: cloneSlot(source?.cena),
        snack1: cloneSlot(source?.snack1),
        snack2: cloneSlot(source?.snack2),
      };
    }),
  };
}

const state = reactive<WeeklyMenuInput>(createStateFromMenu(menu.value));
const selectedDayIndex = ref(0);
const loading = ref(false);
const activeSection = ref<MenuSectionKey | null>('desayuno');
const hiddenDays = new Set<DayOfWeek>(['SABADO', 'DOMINGO']);
const markAsActive = ref(Boolean(menu.value?.isActive));

const selectedDay = computed<DayMenu>(() => state.days[selectedDayIndex.value] ?? createDay(DAY_OF_WEEK_VALUES[0]));
const title = computed(() => (mode.value === 'edit' ? 'Editar menú semanal' : 'Nuevo menú semanal'));
const actionLabel = computed(() => (mode.value === 'edit' ? 'Guardar cambios' : 'Crear menú'));
const activeActionLabel = computed(() => {
  if (menu.value?.isActive || markAsActive.value) {
    return 'Menú activo';
  }

  return 'Hacer menú activo';
});
const visibleDayEntries = computed(() =>
  state.days
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => !hiddenDays.has(day.dayOfWeek))
);
const snacksOpen = computed({
  get: () => activeSection.value === 'snacks',
  set: (value: boolean) => {
    activeSection.value = value ? 'snacks' : null;
  },
});
const desayunoOpen = computed({
  get: () => activeSection.value === 'desayuno',
  set: (value: boolean) => {
    setOpenSection('desayuno', value);
  },
});
const comidaOpen = computed({
  get: () => activeSection.value === 'comida',
  set: (value: boolean) => {
    setOpenSection('comida', value);
  },
});
const cenaOpen = computed({
  get: () => activeSection.value === 'cena',
  set: (value: boolean) => {
    setOpenSection('cena', value);
  },
});

const toast = useToast();
const { createMenuOnDB, updateMenuOnDB, setActiveMenuOnDB } = useMenu();
const { data: catalogItems } = await useFetch<FoodCatalogItem[]>('/api/food-components', {
  default: () => [],
});
const resolvedCatalogItems = computed<FoodCatalogItem[]>(() => catalogItems.value ?? []);

watch(
  () => menu.value,
  (menu) => {
    Object.assign(state, createStateFromMenu(menu));
    selectedDayIndex.value = 0;
    activeSection.value = 'desayuno';
    markAsActive.value = Boolean(menu?.isActive);
  }
);

watch(selectedDayIndex, (index) => {
  const dayOfWeek = state.days[index]?.dayOfWeek;

  if (dayOfWeek && hiddenDays.has(dayOfWeek)) {
    selectedDayIndex.value = visibleDayEntries.value[0]?.index ?? 0;
  }
});

async function onSubmit() {
  const parsed = weeklyMenuInputSchema.safeParse(state);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    toast.add({
      title: 'Error de validación',
      description: firstIssue?.message ?? 'Verifica la información del menú.',
      color: 'error',
    });
    return;
  }

  loading.value = true;

  try {
    const savedMenu =
      mode.value === 'edit' && menu.value?.id
        ? await updateMenuOnDB(menu.value.id, parsed.data)
        : await createMenuOnDB(parsed.data);

    if (markAsActive.value && !savedMenu.isActive) {
      await setActiveMenuOnDB(savedMenu.id);
    }

    toast.add({
      title: mode.value === 'edit' ? 'Menú actualizado' : 'Menú creado',
      description: markAsActive.value
        ? 'La información se guardó y este menú quedó como activo.'
        : 'La información se guardó correctamente.',
      color: 'success',
    });

    emit('saved', savedMenu.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar el menú';
    toast.add({ title: 'Error', description: message, color: 'error' });
  } finally {
    loading.value = false;
  }
}

function beforeEnter(el: Element) {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.opacity = '0';
  element.style.transform = 'translateY(-8px)';
}

function enter(el: Element) {
  const element = el as HTMLElement;
  element.style.transition = 'height 220ms ease, opacity 180ms ease, transform 220ms ease';
  requestAnimationFrame(() => {
    element.style.height = `${element.scrollHeight}px`;
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });
}

function afterEnter(el: Element) {
  const element = el as HTMLElement;
  element.style.height = 'auto';
  element.style.transition = '';
}

function beforeLeave(el: Element) {
  const element = el as HTMLElement;
  element.style.height = `${element.scrollHeight}px`;
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
}

function leave(el: Element) {
  const element = el as HTMLElement;
  element.style.transition = 'height 220ms ease, opacity 160ms ease, transform 220ms ease';
  requestAnimationFrame(() => {
    element.style.height = '0';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-8px)';
  });
}

function afterLeave(el: Element) {
  const element = el as HTMLElement;
  element.style.transition = '';
}

function setOpenSection(section: MenuSectionKey, open: boolean) {
  activeSection.value = open ? section : null;
}
</script>

<template>
  <section class="space-y-6">
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <section class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-muted">Nuxt UI Admin</p>
            <h2 class="text-2xl font-bold text-primary-500">{{ title }}</h2>
            <p class="text-sm text-muted mt-1">Captura una semana completa y vuelve a editarla cuando lo necesites.</p>
          </div>

          <UButton to="/admin/menu" variant="ghost" icon="i-lucide-arrow-left">Volver</UButton>
        </section>
      </template>

      <UForm class="space-y-6" @submit="onSubmit">
        <section class="px-6 pt-6 space-y-6 sm:px-6">
          <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <UFormField label="Nombre del menú" name="name">
              <UInput v-model="state.name" placeholder="Ej. Menú Semana 12" icon="i-lucide-notebook-pen" />
            </UFormField>

            <UFormField label="Fecha de inicio" name="startDate">
              <DatePicker v-model="state.startDate" />
            </UFormField>

            <UFormField label="Fecha final" name="endDate">
              <DatePicker v-model="state.endDate" />
            </UFormField>
          </section>

          <UCard variant="subtle">
            <template #header>
              <section class="flex items-center justify-between gap-4">
                <div>
                  <h3 class="font-semibold text-lg">Días de la semana</h3>
                  <p class="text-sm text-muted">Edita un día a la vez para mantener el formulario compacto.</p>
                </div>
                <UButton
                  size="sm"
                  :variant="markAsActive || menu?.isActive ? 'soft' : 'outline'"
                  :color="markAsActive || menu?.isActive ? 'success' : 'primary'"
                  icon="i-lucide-badge-check"
                  @click="markAsActive = true"
                >
                  {{ activeActionLabel }}
                </UButton>
              </section>
            </template>

            <section class="grid grid-cols-5 gap-2 pb-2">
              <UButton
                v-for="entry in visibleDayEntries"
                :key="entry.day.dayOfWeek"
                block
                class="justify-center"
                :variant="selectedDayIndex === entry.index ? 'solid' : 'outline'"
                :color="selectedDayIndex === entry.index ? 'primary' : 'neutral'"
                size="sm"
                @click="selectedDayIndex = entry.index"
              >
                {{ DAY_LABELS[entry.day.dayOfWeek] }}
              </UButton>
            </section>
          </UCard>
        </section>

        <section class="space-y-4 px-0">
          <AdminMenuSlotEditor
            v-model="selectedDay.desayuno"
            v-model:open="desayunoOpen"
            title="Desayuno"
            :catalog-items="resolvedCatalogItems"
          />
          <AdminMenuSlotEditor
            v-model="selectedDay.comida"
            v-model:open="comidaOpen"
            title="Comida"
            :catalog-items="resolvedCatalogItems"
          />
          <AdminMenuSlotEditor
            v-model="selectedDay.cena"
            v-model:open="cenaOpen"
            title="Cena"
            :catalog-items="resolvedCatalogItems"
          />
        </section>

        <UCard :ui="{ body: 'space-y-4' }">
          <template #header>
            <section class="flex items-center justify-between gap-3">
              <div>
                <h3 class="font-bold">Snacks</h3>
                <p v-if="!snacksOpen" class="mt-1 text-xs text-muted">
                  Snack 1 y Snack 2 ocultos
                </p>
              </div>

              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                :icon="snacksOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                @click="snacksOpen = !snacksOpen"
              >
                {{ snacksOpen ? 'Ocultar' : 'Mostrar' }}
              </UButton>
            </section>
          </template>

          <Transition
            @before-enter="beforeEnter"
            @enter="enter"
            @after-enter="afterEnter"
            @before-leave="beforeLeave"
            @leave="leave"
            @after-leave="afterLeave"
          >
            <section v-if="snacksOpen" class="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-hidden">
              <AdminMenuSlotEditor
                v-model="selectedDay.snack1"
                title="Snack 1"
                :show-sides="false"
                :show-toggle="false"
                :catalog-items="resolvedCatalogItems"
              />
              <AdminMenuSlotEditor
                v-model="selectedDay.snack2"
                title="Snack 2"
                :show-sides="false"
                :show-toggle="false"
                :catalog-items="resolvedCatalogItems"
              />
            </section>
          </Transition>
        </UCard>

        <section class="flex justify-end px-6 pb-6 sm:px-6">
          <UButton type="submit" :loading="loading" icon="i-lucide-save">
            {{ actionLabel }}
          </UButton>
        </section>
      </UForm>
    </UCard>
  </section>
</template>
