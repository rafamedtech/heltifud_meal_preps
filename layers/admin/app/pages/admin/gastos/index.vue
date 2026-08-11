<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';

import { expenseInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
  ExpensePaymentMethod,
  ExpenseSummary,
  ExpenseType,
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

const expenseTypeOptions = [
  { label: 'Todos los tipos', value: 'todos' },
  { label: 'Fijo', value: 'fijo', icon: 'i-lucide-pin' },
  { label: 'Variable', value: 'variable', icon: 'i-lucide-chart-spline' },
] as const;

const invoiceStatusOptions = [
  { label: 'Toda facturación', value: 'todos' },
  { label: 'Facturado', value: 'true', icon: 'i-lucide-file-check-2' },
  { label: 'Pendiente', value: 'false', icon: 'i-lucide-file-clock' },
] as const;

const columns: TableColumn<Expense>[] = [
  { accessorKey: 'description', header: 'Gasto' },
  { accessorKey: 'category', header: 'Categoría' },
  { id: 'billing', header: 'Facturación' },
  { accessorKey: 'expenseType', header: 'Tipo' },
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
const { createExpense, updateExpense, deleteExpense, getExpenses, getExpenseVendors } = useExpenses();
const expenses = ref<Expense[]>([]);
const vendorOptions = ref<string[]>([]);
const summary = ref<ExpenseSummary>({ total: 0, count: 0, average: 0, currentMonthTotal: 0 });
const nextCursor = ref<string | null>(null);
const loading = ref(true);
const loadingMore = ref(false);
const loadError = ref('');
const saving = ref(false);
const deleting = ref(false);
const loadingVendors = ref(false);
const search = ref('');
const selectedCategory = ref('todas');
const selectedPayment = ref('todos');
const selectedExpenseType = ref('todos');
const selectedInvoiceStatus = ref('todos');
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
  const expenseDate = localToday();

  return {
    description: buildExpenseDescription('insumos', '', expenseDate),
    amount: 0,
    category: 'insumos',
    paymentMethod: 'transferencia',
    expenseDate,
    vendor: '',
    billingReference1: '',
    billingReference2: '',
    expenseType: 'variable',
    isInvoiced: false,
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
  || selectedExpenseType.value !== 'todos'
  || selectedInvoiceStatus.value !== 'todos'
  || fromDate.value
  || toDate.value,
));

function currentQuery(cursor?: string | null) {
  return {
    q: search.value.trim() || undefined,
    category: selectedCategory.value !== 'todas' ? selectedCategory.value : undefined,
    paymentMethod: selectedPayment.value !== 'todos' ? selectedPayment.value : undefined,
    expenseType: selectedExpenseType.value !== 'todos' ? selectedExpenseType.value : undefined,
    invoiced: selectedInvoiceStatus.value !== 'todos' ? selectedInvoiceStatus.value : undefined,
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

async function loadVendors() {
  loadingVendors.value = true;

  try {
    vendorOptions.value = await getExpenseVendors();
  } catch {
    vendorOptions.value = [];
  } finally {
    loadingVendors.value = false;
  }
}

function createVendor(value: string) {
  const vendor = value.trim().slice(0, 120);
  if (!vendor) return;

  const existing = vendorOptions.value.find(option => option.localeCompare(vendor, 'es', { sensitivity: 'base' }) === 0);
  formState.vendor = existing ?? vendor;

  if (!existing) {
    vendorOptions.value = [...vendorOptions.value, vendor]
      .sort((first, second) => first.localeCompare(second, 'es'));
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
    billingReference1: expense.billingReference1,
    billingReference2: expense.billingReference2,
    expenseType: expense.expenseType,
    isInvoiced: expense.isInvoiced,
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
    await Promise.all([loadExpenses(), loadVendors()]);
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
  selectedExpenseType.value = 'todos';
  selectedInvoiceStatus.value = 'todos';
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

function buildExpenseDescription(category: ExpenseCategory, vendor: string, expenseDate: string) {
  const categoryLabel = optionLabel(categoryOptions, category);
  const vendorLabel = vendor.trim() || 'Sin proveedor';
  const parsedDate = new Date(`${expenseDate}T12:00:00.000Z`);
  const weekday = Number.isNaN(parsedDate.getTime())
    ? 'día pendiente'
    : new Intl.DateTimeFormat('es-MX', { weekday: 'long', timeZone: 'UTC' }).format(parsedDate);

  return `${categoryLabel} en ${vendorLabel} el ${weekday}`;
}

function updateExpenseDescription() {
  formState.description = buildExpenseDescription(
    formState.category,
    formState.vendor,
    formState.expenseDate,
  );
}

function categoryIcon(category: ExpenseCategory) {
  return categoryOptions.find((option) => option.value === category)?.icon ?? 'i-lucide-receipt';
}

function paymentIcon(method: ExpensePaymentMethod) {
  return paymentOptions.find((option) => option.value === method)?.icon ?? 'i-lucide-wallet';
}

function expenseTypeIcon(type: ExpenseType) {
  return type === 'fijo' ? 'i-lucide-pin' : 'i-lucide-chart-spline';
}

function actionItems(expense: Expense) {
  return [[
    { label: 'Editar', icon: 'i-lucide-square-pen', onSelect: () => openEdit(expense) },
    { label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => { pendingDelete.value = expense; } },
  ]];
}

watch([
  selectedCategory,
  selectedPayment,
  selectedExpenseType,
  selectedInvoiceStatus,
  fromDate,
  toDate,
], () => loadExpenses());
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadExpenses(), 300);
});
watch(
  [() => formState.category, () => formState.vendor, () => formState.expenseDate],
  updateExpenseDescription,
  { immediate: true },
);

onMounted(() => Promise.all([loadExpenses(), loadVendors()]));
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
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <UInput v-model="search" icon="i-lucide-search" size="lg" placeholder="Buscar gasto, proveedor o referencia" class="xl:col-span-2" />
        <USelect v-model="selectedCategory" :items="categoryOptions" value-key="value" size="lg" />
        <USelect v-model="selectedPayment" :items="paymentOptions" value-key="value" size="lg" />
        <USelect v-model="selectedExpenseType" :items="expenseTypeOptions" value-key="value" size="lg" />
        <USelect v-model="selectedInvoiceStatus" :items="invoiceStatusOptions" value-key="value" size="lg" />
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
              <div class="mt-3 flex flex-wrap gap-2">
                <UBadge color="neutral" variant="soft"><UIcon :name="expenseTypeIcon(expense.expenseType)" class="size-3" />{{ optionLabel(expenseTypeOptions, expense.expenseType) }}</UBadge>
                <UBadge :color="expense.isInvoiced ? 'success' : 'warning'" variant="soft"><UIcon :name="expense.isInvoiced ? 'i-lucide-file-check-2' : 'i-lucide-file-clock'" class="size-3" />{{ expense.isInvoiced ? 'Facturado' : 'Pendiente' }}</UBadge>
              </div>
              <p v-if="expense.billingReference1 || expense.billingReference2" class="mt-2 truncate text-xs text-muted">
                Ref: {{ [expense.billingReference1, expense.billingReference2].filter(Boolean).join(' · ') }}
              </p>
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
          <template #billing-cell="{ row }">
            <div class="space-y-1.5">
              <UBadge :color="row.original.isInvoiced ? 'success' : 'warning'" variant="soft"><UIcon :name="row.original.isInvoiced ? 'i-lucide-file-check-2' : 'i-lucide-file-clock'" class="size-3" />{{ row.original.isInvoiced ? 'Facturado' : 'Pendiente' }}</UBadge>
              <p v-if="row.original.billingReference1 || row.original.billingReference2" class="max-w-44 truncate text-xs text-muted">{{ [row.original.billingReference1, row.original.billingReference2].filter(Boolean).join(' · ') }}</p>
              <p v-else class="text-xs text-dimmed">Sin referencias</p>
            </div>
          </template>
          <template #expenseType-cell="{ row }"><UBadge color="neutral" variant="outline"><UIcon :name="expenseTypeIcon(row.original.expenseType)" class="size-3" />{{ optionLabel(expenseTypeOptions, row.original.expenseType) }}</UBadge></template>
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

    <UModal v-model:open="isFormOpen" :title="formTitle" :description="formDescription" :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <UForm :schema="expenseInputSchema" :state="formState" class="space-y-5" @submit="saveExpense">
          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Descripción automática" name="description" hint="Se genera con la categoría, el proveedor y el día" class="sm:col-span-2">
              <UInput :model-value="formState.description" icon="i-lucide-wand-sparkles" size="lg" readonly class="w-full" />
            </UFormField>
            <UFormField label="Monto" name="amount" required><UInputNumber v-model="formState.amount" :min="0" :step="0.01" :format-options="{ style: 'currency', currency: 'MXN' }" size="lg" class="w-full" /></UFormField>
            <UFormField label="Fecha" name="expenseDate" required><CalendarInput v-model="formState.expenseDate" aria-label="Fecha del gasto" /></UFormField>
            <UFormField label="Categoría" name="category" required><USelect v-model="formState.category" :items="categoryOptions.slice(1)" value-key="value" size="lg" class="w-full" /></UFormField>
            <UFormField label="Método de pago" name="paymentMethod" required><USelect v-model="formState.paymentMethod" :items="paymentOptions.slice(1)" value-key="value" size="lg" class="w-full" /></UFormField>
            <UFormField label="Tipo de gasto" name="expenseType" required><USelect v-model="formState.expenseType" :items="expenseTypeOptions.slice(1)" value-key="value" size="lg" class="w-full" /></UFormField>
            <UFormField label="Proveedor" name="vendor" hint="Opcional" class="sm:col-span-2">
              <USelectMenu
                v-model="formState.vendor"
                :items="vendorOptions"
                searchable
                create-item
                :loading="loadingVendors"
                icon="i-lucide-store"
                placeholder="Buscar o crear proveedor"
                size="lg"
                class="w-full"
                @create="createVendor"
              >
                <template #create-item-label="{ item }">
                  <span class="flex min-w-0 items-center gap-2">
                    <UIcon name="i-lucide-plus" class="size-4 shrink-0" />
                    <span class="truncate">Crear “{{ item }}”</span>
                  </span>
                </template>
              </USelectMenu>
            </UFormField>
            <USeparator label="Facturación" class="sm:col-span-2" />
            <UFormField label="Referencia de facturación 1" name="billingReference1" hint="Opcional"><UInput v-model="formState.billingReference1" icon="i-lucide-hash" placeholder="Folio u orden de compra" size="lg" class="w-full" /></UFormField>
            <UFormField label="Referencia de facturación 2" name="billingReference2" hint="Opcional"><UInput v-model="formState.billingReference2" icon="i-lucide-fingerprint" placeholder="UUID, ticket u otra referencia" size="lg" class="w-full" /></UFormField>
            <UFormField label="Estado de facturación" name="isInvoiced" class="sm:col-span-2">
              <USwitch v-model="formState.isInvoiced" label="Este gasto ya fue facturado" description="Actívalo cuando el comprobante fiscal esté disponible." />
            </UFormField>
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
