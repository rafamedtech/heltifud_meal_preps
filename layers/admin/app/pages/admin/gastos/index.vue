<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';

import { expenseInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
  ExpensePaymentMethod,
  ExpenseSummary,
} from '~~/layers/menu/shared/types/types';

definePageMeta({ layout: 'admin' });

useSeoMeta({
  title: 'Control de gastos | Heltifud Meal Preps',
  description: 'Registra, consulta y analiza los gastos operativos de Heltifud Meal Preps.',
  robots: 'noindex, nofollow',
});

const categoryOptions = [
  { label: 'Todas las categorías', value: 'todas' },
  { label: 'Insumos', value: 'insumos', icon: 'i-lucide-carrot' },
  { label: 'Empaque', value: 'empaque', icon: 'i-lucide-package' },
  { label: 'Nómina', value: 'nomina', icon: 'i-lucide-users' },
  { label: 'Renta y servicios', value: 'renta_servicios', icon: 'i-lucide-house-plug' },
  { label: 'Transporte', value: 'transporte', icon: 'i-lucide-truck' },
  { label: 'Marketing', value: 'marketing', icon: 'i-lucide-megaphone' },
  { label: 'Equipo', value: 'equipo', icon: 'i-lucide-cooking-pot' },
  { label: 'Otros', value: 'otros', icon: 'i-lucide-ellipsis' },
] as const;

const paymentOptions = [
  { label: 'Todos los métodos', value: 'todos' },
  { label: 'Efectivo', value: 'efectivo', icon: 'i-lucide-banknote' },
  { label: 'Transferencia', value: 'transferencia', icon: 'i-lucide-arrow-left-right' },
  { label: 'Tarjeta', value: 'tarjeta', icon: 'i-lucide-credit-card' },
  { label: 'Otro', value: 'otro', icon: 'i-lucide-circle-dollar-sign' },
] as const;

const columns: TableColumn<Expense>[] = [
  { accessorKey: 'description', header: 'Gasto' },
  { accessorKey: 'category', header: 'Categoría' },
  { accessorKey: 'expenseDate', header: 'Fecha' },
  { accessorKey: 'paymentMethod', header: 'Pago' },
  {
    accessorKey: 'amount',
    header: 'Monto',
    meta: { class: { th: 'text-right', td: 'text-right' } },
  },
  { id: 'actions', header: '' },
];

const toast = useToast();
const { createExpense, updateExpense, deleteExpense, getExpenses } = useExpenses();
const expenses = ref<Expense[]>([]);
const summary = ref<ExpenseSummary>({ total: 0, count: 0, average: 0, currentMonthTotal: 0 });
const nextCursor = ref<string | null>(null);
const loading = ref(true);
const loadingMore = ref(false);
const loadError = ref('');
const saving = ref(false);
const deleting = ref(false);
const search = ref('');
const selectedCategory = ref('todas');
const selectedPayment = ref('todos');
const fromDate = ref('');
const toDate = ref('');
const isFormOpen = ref(false);
const editingExpense = ref<Expense | null>(null);
const pendingDelete = ref<Expense | null>(null);
let requestId = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

function localToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function emptyExpense(): ExpenseInput {
  return {
    description: '',
    amount: 0,
    category: 'insumos',
    paymentMethod: 'transferencia',
    expenseDate: localToday(),
    vendor: '',
    notes: '',
  };
}

const formState = reactive<ExpenseInput>(emptyExpense());
const formTitle = computed(() => editingExpense.value ? 'Editar gasto' : 'Registrar gasto');
const formDescription = computed(() => editingExpense.value
  ? 'Actualiza la información de este movimiento.'
  : 'Agrega un gasto operativo al control financiero.');
const isDeleteOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (open) => {
    if (!open) pendingDelete.value = null;
  },
});
const isFiltering = computed(() => Boolean(
  search.value.trim()
  || selectedCategory.value !== 'todas'
  || selectedPayment.value !== 'todos'
  || fromDate.value
  || toDate.value,
));

function currentQuery(cursor?: string | null) {
  return {
    q: search.value.trim() || undefined,
    category: selectedCategory.value !== 'todas' ? selectedCategory.value : undefined,
    paymentMethod: selectedPayment.value !== 'todos' ? selectedPayment.value : undefined,
    from: fromDate.value || undefined,
    to: toDate.value || undefined,
    cursor: cursor || undefined,
    limit: 30,
  };
}

async function loadExpenses(append = false) {
  const currentRequest = ++requestId;

  if (append) loadingMore.value = true;
  else {
    loading.value = true;
    loadError.value = '';
  }

  try {
    const response = await getExpenses(currentQuery(append ? nextCursor.value : null));
    if (currentRequest !== requestId) return;

    expenses.value = append ? [...expenses.value, ...response.items] : response.items;
    nextCursor.value = response.nextCursor;
    summary.value = response.summary;
  } catch (error) {
    if (currentRequest !== requestId) return;

    const message = error instanceof Error ? error.message : 'No se pudieron cargar los gastos.';
    loadError.value = message;
    toast.add({ title: 'No se pudieron cargar los gastos', description: message, color: 'error', icon: 'i-lucide-circle-alert' });
  } finally {
    if (currentRequest === requestId) {
      loading.value = false;
      loadingMore.value = false;
    }
  }
}

function openCreate() {
  editingExpense.value = null;
  Object.assign(formState, emptyExpense());
  isFormOpen.value = true;
}

function openEdit(expense: Expense) {
  editingExpense.value = expense;
  Object.assign(formState, {
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    paymentMethod: expense.paymentMethod,
    expenseDate: expense.expenseDate,
    vendor: expense.vendor,
    notes: expense.notes,
  });
  isFormOpen.value = true;
}

async function saveExpense() {
  saving.value = true;

  try {
    const saved = editingExpense.value
      ? await updateExpense(editingExpense.value.id, formState)
      : await createExpense(formState);

    isFormOpen.value = false;
    toast.add({
      title: editingExpense.value ? 'Gasto actualizado' : 'Gasto registrado',
      description: `${saved.description} quedó guardado correctamente.`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    });
    await loadExpenses();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar el gasto.';
    toast.add({ title: 'Error al guardar', description: message, color: 'error', icon: 'i-lucide-circle-alert' });
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) return;

  deleting.value = true;
  try {
    const deleted = pendingDelete.value;
    await deleteExpense(deleted.id);
    pendingDelete.value = null;
    toast.add({ title: 'Gasto eliminado', description: `${deleted.description} fue eliminado.`, color: 'success', icon: 'i-lucide-check-circle' });
    await loadExpenses();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el gasto.';
    toast.add({ title: 'Error al eliminar', description: message, color: 'error', icon: 'i-lucide-circle-alert' });
  } finally {
    deleting.value = false;
  }
}

function resetFilters() {
  search.value = '';
  selectedCategory.value = 'todas';
  selectedPayment.value = 'todos';
  fromDate.value = '';
  toDate.value = '';
}

function currency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T12:00:00`));
}

function optionLabel(options: readonly { label: string; value: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function categoryIcon(category: ExpenseCategory) {
  return categoryOptions.find((option) => option.value === category)?.icon ?? 'i-lucide-receipt';
}

function paymentIcon(method: ExpensePaymentMethod) {
  return paymentOptions.find((option) => option.value === method)?.icon ?? 'i-lucide-wallet';
}

function actionItems(expense: Expense) {
  return [[
    { label: 'Editar', icon: 'i-lucide-square-pen', onSelect: () => openEdit(expense) },
    { label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => { pendingDelete.value = expense; } },
  ]];
}

watch([selectedCategory, selectedPayment, fromDate, toDate], () => loadExpenses());
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadExpenses(), 300);
});

onMounted(() => loadExpenses());
onBeforeUnmount(() => clearTimeout(searchTimer));
</script>

<template>
  <main class="flex min-h-full flex-col space-y-6">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold tracking-tight text-primary">Control de gastos</h1>
        <p class="max-w-2xl text-sm text-muted">Registra cada salida, consulta su historial y mantén visible el costo operativo.</p>
      </div>

      <UButton icon="i-lucide-plus" size="lg" class="w-full justify-center sm:w-auto" @click="openCreate">
        Registrar gasto
      </UButton>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <UCard class="app-surface" :ui="{ body: 'p-5 sm:p-5' }">
        <div class="flex items-start justify-between gap-3">
          <div><p class="text-xs font-medium uppercase tracking-wider text-muted">Total filtrado</p><p class="mt-2 text-2xl font-semibold text-highlighted">{{ currency(summary.total) }}</p></div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UIcon name="i-lucide-circle-dollar-sign" class="size-5" /></div>
        </div>
      </UCard>
      <UCard class="app-surface" :ui="{ body: 'p-5 sm:p-5' }">
        <div class="flex items-start justify-between gap-3">
          <div><p class="text-xs font-medium uppercase tracking-wider text-muted">Este mes</p><p class="mt-2 text-2xl font-semibold text-highlighted">{{ currency(summary.currentMonthTotal) }}</p></div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info"><UIcon name="i-lucide-calendar-days" class="size-5" /></div>
        </div>
      </UCard>
      <UCard class="app-surface" :ui="{ body: 'p-5 sm:p-5' }">
        <div class="flex items-start justify-between gap-3">
          <div><p class="text-xs font-medium uppercase tracking-wider text-muted">Movimientos</p><p class="mt-2 text-2xl font-semibold text-highlighted">{{ summary.count }}</p></div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success"><UIcon name="i-lucide-receipt-text" class="size-5" /></div>
        </div>
      </UCard>
      <UCard class="app-surface" :ui="{ body: 'p-5 sm:p-5' }">
        <div class="flex items-start justify-between gap-3">
          <div><p class="text-xs font-medium uppercase tracking-wider text-muted">Promedio</p><p class="mt-2 text-2xl font-semibold text-highlighted">{{ currency(summary.average) }}</p></div>
          <div class="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning"><UIcon name="i-lucide-chart-no-axes-column-increasing" class="size-5" /></div>
        </div>
      </UCard>
    </section>

    <UCard class="app-surface" :ui="{ body: 'p-5 sm:p-6' }">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_190px_170px_170px]">
        <UInput v-model="search" icon="i-lucide-search" size="lg" placeholder="Buscar gasto o proveedor" />
        <USelect v-model="selectedCategory" :items="categoryOptions" value-key="value" size="lg" />
        <USelect v-model="selectedPayment" :items="paymentOptions" value-key="value" size="lg" />
        <CalendarInput v-model="fromDate" aria-label="Fecha inicial" />
        <CalendarInput v-model="toDate" aria-label="Fecha final" />
      </div>
      <div v-if="isFiltering" class="mt-3 flex justify-end">
        <UButton label="Limpiar filtros" icon="i-lucide-filter-x" variant="ghost" color="neutral" size="sm" @click="resetFilters" />
      </div>
    </UCard>

    <section v-if="loading" class="grid gap-3">
      <USkeleton v-for="row in 6" :key="row" class="h-22 w-full rounded-xl" />
    </section>

    <UCard v-else-if="loadError" class="app-surface" :ui="{ body: 'py-14 sm:py-16' }">
      <div class="mx-auto max-w-md space-y-4 text-center">
        <UIcon name="i-lucide-cloud-alert" class="mx-auto size-10 text-error" />
        <div><h2 class="font-semibold text-highlighted">No fue posible cargar los gastos</h2><p class="mt-1 text-sm text-muted">{{ loadError }}</p></div>
        <UButton icon="i-lucide-refresh-cw" variant="soft" @click="loadExpenses()">Reintentar</UButton>
      </div>
    </UCard>

    <UCard v-else-if="!expenses.length" class="app-surface" :ui="{ body: 'py-14 sm:py-16' }">
      <div class="mx-auto max-w-md space-y-4 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-xl border border-default bg-elevated"><UIcon :name="isFiltering ? 'i-lucide-search-x' : 'i-lucide-receipt-text'" class="size-5 text-muted" /></div>
        <div><h2 class="font-semibold text-highlighted">{{ isFiltering ? 'No encontramos gastos' : 'Aún no hay gastos' }}</h2><p class="mt-1 text-sm text-muted">{{ isFiltering ? 'Ajusta la búsqueda o limpia los filtros.' : 'Registra el primer movimiento para comenzar el control.' }}</p></div>
        <UButton v-if="isFiltering" variant="soft" icon="i-lucide-filter-x" @click="resetFilters">Limpiar filtros</UButton>
        <UButton v-else icon="i-lucide-plus" @click="openCreate">Registrar gasto</UButton>
      </div>
    </UCard>

    <template v-else>
      <section class="grid gap-3 lg:hidden">
        <UCard v-for="expense in expenses" :key="expense.id" class="app-surface" :ui="{ body: 'p-5 sm:p-5' }">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2"><UIcon :name="categoryIcon(expense.category)" class="size-4 shrink-0 text-primary" /><h2 class="truncate font-semibold text-highlighted">{{ expense.description }}</h2></div>
              <p class="mt-1 text-sm text-muted">{{ expense.vendor || 'Sin proveedor' }}</p>
            </div>
            <UDropdownMenu :items="actionItems(expense)"><UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones del gasto" /></UDropdownMenu>
          </div>
          <div class="mt-5 flex items-end justify-between gap-4 border-t border-default/70 pt-4">
            <div class="space-y-1 text-sm text-muted"><p>{{ displayDate(expense.expenseDate) }}</p><p class="flex items-center gap-1.5"><UIcon :name="paymentIcon(expense.paymentMethod)" class="size-3.5" />{{ optionLabel(paymentOptions, expense.paymentMethod) }}</p></div>
            <p class="text-xl font-semibold text-highlighted">{{ currency(expense.amount) }}</p>
          </div>
        </UCard>
      </section>

      <UCard class="app-surface hidden overflow-hidden lg:block" :ui="{ body: 'p-0 sm:p-0' }">
        <UTable :data="expenses" :columns="columns" :ui="{ th: 'px-5 py-3.5', td: 'px-5 py-4' }">
          <template #description-cell="{ row }">
            <div class="flex min-w-0 items-center gap-3"><div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><UIcon :name="categoryIcon(row.original.category)" class="size-4" /></div><div class="min-w-0"><p class="truncate font-semibold text-highlighted">{{ row.original.description }}</p><p class="truncate text-xs text-muted">{{ row.original.vendor || 'Sin proveedor' }}</p></div></div>
          </template>
          <template #category-cell="{ row }"><UBadge color="neutral" variant="soft">{{ optionLabel(categoryOptions, row.original.category) }}</UBadge></template>
          <template #expenseDate-cell="{ row }"><span class="text-toned">{{ displayDate(row.original.expenseDate) }}</span></template>
          <template #paymentMethod-cell="{ row }"><span class="flex items-center gap-2 text-toned"><UIcon :name="paymentIcon(row.original.paymentMethod)" class="size-4 text-muted" />{{ optionLabel(paymentOptions, row.original.paymentMethod) }}</span></template>
          <template #amount-cell="{ row }"><span class="font-semibold text-highlighted">{{ currency(row.original.amount) }}</span></template>
          <template #actions-cell="{ row }"><UDropdownMenu :items="actionItems(row.original)"><UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones del gasto" /></UDropdownMenu></template>
        </UTable>
      </UCard>

      <div v-if="nextCursor" class="text-center">
        <UButton color="neutral" variant="soft" icon="i-lucide-chevrons-down" :loading="loadingMore" @click="loadExpenses(true)">Cargar más gastos</UButton>
      </div>
    </template>

    <UModal v-model:open="isFormOpen" :title="formTitle" :description="formDescription" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <UForm :schema="expenseInputSchema" :state="formState" class="space-y-5" @submit="saveExpense">
          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Descripción" name="description" required class="sm:col-span-2"><UInput v-model="formState.description" icon="i-lucide-receipt-text" placeholder="Ej. Compra de verduras" size="lg" class="w-full" autofocus /></UFormField>
            <UFormField label="Monto" name="amount" required><UInputNumber v-model="formState.amount" :min="0" :step="0.01" :format-options="{ style: 'currency', currency: 'MXN' }" size="lg" class="w-full" /></UFormField>
            <UFormField label="Fecha" name="expenseDate" required><CalendarInput v-model="formState.expenseDate" aria-label="Fecha del gasto" /></UFormField>
            <UFormField label="Categoría" name="category" required><USelect v-model="formState.category" :items="categoryOptions.slice(1)" value-key="value" size="lg" class="w-full" /></UFormField>
            <UFormField label="Método de pago" name="paymentMethod" required><USelect v-model="formState.paymentMethod" :items="paymentOptions.slice(1)" value-key="value" size="lg" class="w-full" /></UFormField>
            <UFormField label="Proveedor" name="vendor" hint="Opcional" class="sm:col-span-2"><UInput v-model="formState.vendor" icon="i-lucide-store" placeholder="Nombre del proveedor" size="lg" class="w-full" /></UFormField>
            <UFormField label="Notas" name="notes" hint="Opcional" class="sm:col-span-2"><UTextarea v-model="formState.notes" placeholder="Detalles, folio o contexto adicional" autoresize :rows="3" class="w-full" /></UFormField>
          </div>
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><UButton type="button" color="neutral" variant="ghost" @click="isFormOpen = false">Cancelar</UButton><UButton type="submit" icon="i-lucide-save" :loading="saving">{{ editingExpense ? 'Guardar cambios' : 'Registrar gasto' }}</UButton></div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteOpen" title="Eliminar gasto" :description="pendingDelete ? `Se eliminará ${pendingDelete.description}.` : undefined" :ui="{ content: 'max-w-md' }">
      <template #body><UAlert color="error" variant="soft" icon="i-lucide-triangle-alert" title="Esta acción no se puede deshacer" description="El movimiento dejará de aparecer en el historial y en los totales." /></template>
      <template #footer><div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="ghost" @click="pendingDelete = null">Cancelar</UButton><UButton color="error" icon="i-lucide-trash" :loading="deleting" @click="confirmDelete">Eliminar gasto</UButton></div></template>
    </UModal>
  </main>
</template>
