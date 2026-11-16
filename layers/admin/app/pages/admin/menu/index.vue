<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui"
import { cycleCutoffFormSchema, operationSettingsInputSchema } from "~~/layers/menu/shared/types/menuSchema"
import { MENU_TYPE_OPTIONS } from "~~/layers/menu/shared/types/types"
import type { CycleStatusValue, OperationSettingsInput, WeeklyMenu } from "~~/layers/menu/shared/types/types"
import { customerDeliveryDays } from "~~/layers/menu/shared/utils/customerDeliveryDays"
import {
  BUSINESS_TIME_ZONE,
  CYCLE_STATUS_LABELS,
  CYCLE_TRANSITIONS,
  isCutoffBeforeWeek,
  utcToZonedDateTime,
  zonedDateTimeToUtc
} from "~~/layers/menu/shared/utils/weeklyCycle"

const {
  data: menus,
  refresh,
  status
} = await useLazyFetch<WeeklyMenu[]>("/api/menu/all", {
  default: () => []
})

const isLoading = computed(() => status.value === "pending")
const openMenus = computed(() => menus.value.filter((menu) => menu.cycleStatus === "OPEN"))
const activeMenu = computed(() => openMenus.value.find((menu) => menu.menuType === "ESTANDAR") ?? openMenus.value[0] ?? null)
const nextMenu = computed(() => {
  const now = Date.now()

  return menus.value
    .filter((menu) => new Date(menu.startDate).getTime() > now)
    .toSorted(
      (firstMenu, secondMenu) =>
        new Date(firstMenu.startDate).getTime() - new Date(secondMenu.startDate).getTime()
    )[0] ?? null
})
const menuTableColumns: TableColumn<WeeklyMenu>[] = [
  {
    accessorKey: "name",
    header: "Menú"
  },
  {
    id: "dates",
    header: "Vigencia"
  },
  {
    id: "status",
    header: "Semana",
    meta: {
      class: {
        th: "text-center",
        td: "text-center"
      }
    }
  },
  {
    id: "actions",
    header: "Acciones",
    meta: {
      class: {
        th: "text-center",
        td: "text-center"
      }
    }
  }
]

const { deleteMenuOnDB } = useMenu()
const { updateCycle, getOperationSettings, updateOperationSettings } = useCycles()
const toast = useToast()
const deletingId = ref<string | null>(null)
const updatingCycleId = ref<string | null>(null)

const cycleStatusColors = {
  DRAFT: "neutral",
  OPEN: "success",
  CLOSED: "warning",
  IN_PRODUCTION: "primary",
  COMPLETED: "info"
} as const
const cycleActions: Record<CycleStatusValue, { label: string, icon: string }> = {
  DRAFT: { label: "Regresar a borrador", icon: "i-lucide-pencil-line" },
  OPEN: { label: "Abrir pedidos", icon: "i-lucide-door-open" },
  CLOSED: { label: "Cerrar pedidos", icon: "i-lucide-lock" },
  IN_PRODUCTION: { label: "Pasar a producción", icon: "i-lucide-chef-hat" },
  COMPLETED: { label: "Marcar completada", icon: "i-lucide-circle-check" }
}
const cutoffFormatter = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: BUSINESS_TIME_ZONE
})

function menuTypeLabel(menu: WeeklyMenu) {
  return MENU_TYPE_OPTIONS.find((option) => option.value === menu.menuType)?.label ?? menu.menuType
}

function actionItems(menu: WeeklyMenu): DropdownMenuItem[][] {
  const transitions = menu.cycleId && menu.cycleStatus
    ? CYCLE_TRANSITIONS[menu.cycleStatus].map((status) => ({
        ...cycleActions[status],
        onSelect: () => onCycleStatus(menu, status)
      }))
    : []

  return [
    [{ label: "Editar", icon: "i-lucide-square-pen", to: `/admin/menu/${menu.id}` }],
    ...(menu.cycleId
      ? [[...transitions, { label: "Editar corte", icon: "i-lucide-clock", onSelect: () => openCutoff(menu) }]]
      : []),
    [{ label: "Eliminar", icon: "i-lucide-trash", color: "error" as const, onSelect: () => requestDelete(menu) }]
  ]
}

const dayOptions = customerDeliveryDays.filter((day) => day.value !== "sin_definir")
const isSettingsOpen = ref(false)
const settingsLoading = ref(false)
const settingsSaving = ref(false)
const settingsState = reactive<OperationSettingsInput>({
  cutoffDay: "VIERNES",
  cutoffTime: "18:00",
  firstDeliveryAllowedDays: [],
  secondDeliveryAllowedDays: [],
  firstDeliveryMealDays: [],
  secondDeliveryMealDays: []
})

async function openSettings() {
  isSettingsOpen.value = true
  settingsLoading.value = true

  try {
    const { timeZone: _timeZone, updatedAt: _updatedAt, ...settings } = await getOperationSettings()
    Object.assign(settingsState, settings)
  } catch (error) {
    isSettingsOpen.value = false
    const message = error instanceof Error ? error.message : "No se pudieron cargar los ajustes"
    toast.add({ title: "Error", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    settingsLoading.value = false
  }
}

async function saveSettings() {
  settingsSaving.value = true

  try {
    await updateOperationSettings(settingsState)
    isSettingsOpen.value = false
    toast.add({
      title: "Ajustes guardados",
      description: "Se aplicarán a las semanas que se creen a partir de ahora.",
      color: "success",
      icon: "i-lucide-circle-check"
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron guardar los ajustes"
    toast.add({ title: "Error al guardar", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    settingsSaving.value = false
  }
}
const cutoffMenu = ref<WeeklyMenu | null>(null)
const cutoffSaving = ref(false)
const cutoffState = reactive({ date: "", time: "" })
const isCutoffOpen = computed({
  get: () => Boolean(cutoffMenu.value),
  set: (value) => {
    if (!value && !cutoffSaving.value) cutoffMenu.value = null
  }
})
const cutoffDescription = computed(() =>
  cutoffMenu.value?.weekStart
    ? `Semana del ${formatDate(cutoffMenu.value.weekStart)}. Aplica a todos los menús de esa semana.`
    : undefined
)
const cutoffInstant = computed(() =>
  cycleCutoffFormSchema.safeParse(cutoffState).success
    ? zonedDateTimeToUtc(cutoffState.date, cutoffState.time, BUSINESS_TIME_ZONE)
    : null
)
const cutoffOutsideWeek = computed(() =>
  Boolean(
    cutoffInstant.value
    && cutoffMenu.value?.weekStart
    && !isCutoffBeforeWeek(cutoffInstant.value, cutoffMenu.value.weekStart, BUSINESS_TIME_ZONE)
  )
)
const cutoffUnchanged = computed(() =>
  Boolean(
    cutoffInstant.value
    && cutoffMenu.value?.orderCutoffAt
    && cutoffInstant.value.getTime() === new Date(cutoffMenu.value.orderCutoffAt).getTime()
  )
)

function openCutoff(menu: WeeklyMenu) {
  if (!menu.cycleId || !menu.orderCutoffAt) return
  Object.assign(cutoffState, utcToZonedDateTime(menu.orderCutoffAt, BUSINESS_TIME_ZONE))
  cutoffMenu.value = menu
}

async function saveCutoff() {
  const menu = cutoffMenu.value
  if (!menu?.cycleId || !cutoffInstant.value || cutoffOutsideWeek.value) return
  cutoffSaving.value = true

  try {
    const cycle = await updateCycle(menu.cycleId, { orderCutoffAt: cutoffInstant.value.toISOString() })
    await refresh()
    cutoffMenu.value = null
    toast.add({
      title: "Corte actualizado",
      description: `Nuevo corte: ${cutoffFormatter.format(new Date(cycle.orderCutoffAt))}.`,
      color: "success",
      icon: "i-lucide-circle-check"
    })
  } catch (error) {
    const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage
      ?? "Revisa la fecha y la hora e intenta de nuevo."
    toast.add({ title: "No se pudo actualizar el corte", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    cutoffSaving.value = false
  }
}

const pendingDeleteMenu = ref<WeeklyMenu | null>(null)
const deleteModalDescription = computed(() =>
  pendingDeleteMenu.value
    ? `Se eliminará "${pendingDeleteMenu.value.name}". Esta acción no se puede deshacer.`
    : undefined
)
const isDeleteModalOpen = computed({
  get: () => Boolean(pendingDeleteMenu.value),
  set: (value) => {
    if (!value) {
      pendingDeleteMenu.value = null
    }
  }
})

function requestDelete(menu: WeeklyMenu) {
  pendingDeleteMenu.value = menu
}

async function onDelete(id: string) {
  deletingId.value = id

  try {
    await deleteMenuOnDB(id)
    await refresh()
    toast.add({ title: "Menú eliminado", color: "success", icon: "i-lucide-check-circle" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar"
    toast.add({ title: "Error", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    deletingId.value = null
    pendingDeleteMenu.value = null
  }
}

async function onCycleStatus(menu: WeeklyMenu, status: CycleStatusValue) {
  if (!menu.cycleId) return
  updatingCycleId.value = menu.cycleId

  try {
    await updateCycle(menu.cycleId, { status })
    await refresh()
    toast.add({
      title: "Semana actualizada",
      description: `Estado: ${CYCLE_STATUS_LABELS[status]}.`,
      color: "success",
      icon: "i-lucide-circle-check"
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la semana"
    toast.add({ title: "Error", description: message, color: "error", icon: "i-lucide-circle-alert" })
  } finally {
    updatingCycleId.value = null
  }
}

definePageMeta({
  layout: "admin"
})

useSeoMeta({
  title: "Gestión de menús semanales | Heltifud Meal Preps",
  description: "Administra la rotación semanal de menús dentro del panel administrativo de Heltifud Meal Preps.",
  robots: "noindex, nofollow"
})
</script>

<template>
  <main class="flex min-h-full flex-col space-y-6">
    <section class="space-y-4">
      <AdminMenuIndexSkeleton v-if="isLoading" />

      <section
        v-else
        class="grid gap-3 lg:grid-cols-3"
      >
        <UCard>
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">Pedidos abiertos</p>
              <div class="mt-3 space-y-1">
                <p class="line-clamp-1 text-base font-semibold text-highlighted">
                  {{ activeMenu?.name ?? "Ninguna semana abierta" }}
                </p>
                <p class="text-sm text-muted">
                  {{
                    activeMenu
                      ? `${formatDate(activeMenu.startDate)} - ${formatDate(activeMenu.endDate)}`
                      : "Abre pedidos de una semana desde la lista inferior."
                  }}
                </p>
              </div>
            </div>

            <div v-if="activeMenu" class="flex shrink-0 flex-col gap-2">
              <UButton
                :to="`/admin/menu/${activeMenu.id}`"
                size="sm"
                variant="outline"
                color="neutral"
                icon="i-lucide-square-pen"
              >
                Editar
              </UButton>
              <UButton
                to="/menu"
                size="sm"
                variant="outline"
                color="neutral"
                icon="i-lucide-eye"
              >
                Ver público
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard>
          <p class="pr-20 text-xs uppercase tracking-[0.18em] text-muted">Siguiente menú</p>
          <UButton
            v-if="nextMenu"
            :to="`/admin/menu/${nextMenu.id}`"
            size="sm"
            variant="outline"
            color="neutral"
            icon="i-lucide-square-pen"
            class="absolute right-4 top-4"
          >
            Editar
          </UButton>
          <div class="mt-3 space-y-1">
            <p class="line-clamp-1 text-base font-semibold text-highlighted">
              {{ nextMenu?.name ?? "Sin menú programado" }}
            </p>
            <p class="text-sm text-muted">
              {{
                nextMenu
                  ? `${formatDate(nextMenu.startDate)} - ${formatDate(nextMenu.endDate)}`
                  : "Crea un menú con una fecha de inicio futura."
              }}
            </p>
          </div>
        </UCard>

        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Menús creados</p>
          <div class="mt-3 space-y-1">
            <p class="text-2xl font-bold text-highlighted">
              {{ menus.length }}
            </p>
            <p class="text-sm text-muted">Total de menús semanales registrados.</p>
          </div>
        </UCard>
      </section>

      <section
        v-if="isLoading"
        role="status"
        aria-live="polite"
        class="flex min-h-64 flex-col items-center justify-center gap-3 text-muted"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-12 animate-spin"
          aria-hidden="true"
        />
        <span>Cargando</span>
      </section>

      <UAlert
        v-if="!isLoading && !menus.length"
        title="Aún no hay menús"
        description="Empieza creando el primer menú semanal desde el botón de arriba."
        color="neutral"
        variant="soft"
        icon="i-lucide-notebook-tabs"
      />

      <div v-if="!isLoading" class="flex justify-end">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-settings-2"
          label="Ajustes de operación"
          @click="openSettings"
        />
      </div>

      <section
        v-if="!isLoading && menus.length"
        class="overflow-hidden"
      >
        <UTable
          :data="menus"
          :columns="menuTableColumns"
          :meta="{
            class: {
              tr: (row) => row.original.cycleStatus === 'OPEN' ? 'bg-primary/10' : ''
            }
          }"
          :ui="{
            th: 'px-5 py-3.5',
            td: 'px-5 py-4'
          }"
        >
          <template #name-cell="{ row }">
            <div class="flex flex-wrap items-center gap-2">
              <ULink
                :to="`/admin/menu/${row.original.id}`"
                class="font-semibold"
                :class="row.original.cycleStatus === 'OPEN' ? 'text-primary' : 'text-highlighted'"
              >
                {{ row.original.name }}
              </ULink>
              <UBadge color="neutral" variant="subtle" :label="menuTypeLabel(row.original)" />
              <span v-if="row.original.customerName" class="text-sm text-muted">{{ row.original.customerName }}</span>
            </div>
          </template>

          <template #dates-cell="{ row }">
            <span class="text-muted">
              {{ formatDate(row.original.startDate) }} - {{ formatDate(row.original.endDate) }}
            </span>
          </template>

          <template #status-cell="{ row }">
            <div v-if="row.original.cycleStatus" class="flex flex-col items-center gap-1">
              <UBadge
                :color="cycleStatusColors[row.original.cycleStatus]"
                variant="subtle"
                :label="CYCLE_STATUS_LABELS[row.original.cycleStatus]"
              />
              <span v-if="row.original.orderCutoffAt" class="text-xs text-muted">
                Corte: {{ cutoffFormatter.format(new Date(row.original.orderCutoffAt)) }}
              </span>
            </div>
            <UBadge v-else color="warning" variant="subtle" label="Sin semana asignada" />
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="actionItems(row.original)" :content="{ align: 'end' }">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                :loading="deletingId === row.original.id || (!!row.original.cycleId && updatingCycleId === row.original.cycleId)"
                :aria-label="`Acciones de ${row.original.name}`"
              />
            </UDropdownMenu>
          </template>
        </UTable>
      </section>
    </section>

    <UModal
      v-model:open="isSettingsOpen"
      title="Ajustes de operación"
      description="Valores por defecto para las semanas nuevas. Las semanas ya creadas conservan los suyos."
      :ui="{ content: 'max-w-3xl' }"
    >
      <template #body>
        <div v-if="settingsLoading" role="status" aria-live="polite" class="grid gap-5 md:grid-cols-2">
          <span class="sr-only">Cargando ajustes</span>
          <USkeleton v-for="index in 6" :key="index" class="h-10" />
        </div>

        <UForm v-else :schema="operationSettingsInputSchema" :state="settingsState" class="space-y-5" @submit="saveSettings">
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Día de corte" name="cutoffDay" required>
              <USelect v-model="settingsState.cutoffDay" :items="dayOptions" value-key="value" class="w-full" />
            </UFormField>
            <UFormField label="Hora de corte" name="cutoffTime" required>
              <UInput v-model="settingsState.cutoffTime" type="time" icon="i-lucide-clock" class="w-full" />
            </UFormField>
            <UFormField label="Días de la primera entrega" name="firstDeliveryAllowedDays" required>
              <USelectMenu v-model="settingsState.firstDeliveryAllowedDays" :items="dayOptions" value-key="value" multiple class="w-full" />
            </UFormField>
            <UFormField label="Comidas de la primera entrega" name="firstDeliveryMealDays" required>
              <USelectMenu v-model="settingsState.firstDeliveryMealDays" :items="dayOptions" value-key="value" multiple class="w-full" />
            </UFormField>
            <UFormField label="Días de la segunda entrega" name="secondDeliveryAllowedDays" required>
              <USelectMenu v-model="settingsState.secondDeliveryAllowedDays" :items="dayOptions" value-key="value" multiple class="w-full" />
            </UFormField>
            <UFormField label="Comidas de la segunda entrega" name="secondDeliveryMealDays" required>
              <USelectMenu v-model="settingsState.secondDeliveryMealDays" :items="dayOptions" value-key="value" multiple class="w-full" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 border-t border-default pt-5">
            <UButton color="neutral" variant="ghost" type="button" :disabled="settingsSaving" @click="isSettingsOpen = false">Cancelar</UButton>
            <UButton type="submit" icon="i-lucide-save" :loading="settingsSaving">Guardar cambios</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isCutoffOpen"
      title="Editar corte de la semana"
      :description="cutoffDescription"
      :ui="{ content: 'max-w-3xl' }"
    >
      <template #body>
        <UForm :schema="cycleCutoffFormSchema" :state="cutoffState" class="space-y-5" @submit="saveCutoff">
          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Fecha de corte" name="date" required>
              <CalendarInput v-model="cutoffState.date" label="Fecha de corte" />
            </UFormField>
            <UFormField label="Hora de corte" name="time" help="Hora de Tijuana." required>
              <UInput v-model="cutoffState.time" type="time" icon="i-lucide-clock" class="w-full" />
            </UFormField>
          </div>

          <UAlert
            v-if="cutoffOutsideWeek"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            title="Corte fuera de rango"
            description="El corte debe ser anterior al lunes en que inicia la semana."
          />

          <div class="flex justify-end gap-3 border-t border-default pt-5">
            <UButton color="neutral" variant="ghost" type="button" :disabled="cutoffSaving" @click="isCutoffOpen = false">Cancelar</UButton>
            <UButton type="submit" icon="i-lucide-save" :loading="cutoffSaving" :disabled="cutoffOutsideWeek || cutoffUnchanged">Guardar cambios</UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteModalOpen"
      title="Eliminar menú"
      :description="deleteModalDescription"
      :ui="{ content: 'max-w-md' }"
    >
      <template #body>
        <section class="space-y-4">
          <UAlert
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="Confirma la eliminación"
            description="Si continúas, el menú semanal y su configuración asociada dejarán de estar disponibles."
          />
        </section>
      </template>

      <template #footer>
        <section class="flex w-full justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            @click="pendingDeleteMenu = null"
          >
            Cancelar
          </UButton>
          <UButton
            color="error"
            :loading="deletingId === pendingDeleteMenu?.id"
            icon="i-lucide-trash"
            @click="pendingDeleteMenu && onDelete(pendingDeleteMenu.id)"
          >
            Eliminar menú
          </UButton>
        </section>
      </template>
    </UModal>
  </main>
</template>
