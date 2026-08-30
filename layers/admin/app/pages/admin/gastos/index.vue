<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui';

import { expenseInputSchema } from '~~/layers/menu/shared/types/menuSchema';
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
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

const expenseTypeOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Fijo', value: 'fijo', icon: 'i-lucide-pin' },
  { label: 'Variable', value: 'variable', icon: 'i-lucide-chart-spline' },
] as const;

const invoiceStatusOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Facturado', value: 'true', icon: 'i-lucide-file-check-2' },
  { label: 'Pendiente', value: 'false', icon: 'i-lucide-file-clock' },
] as const;

const columns: TableColumn<Expense>[] = [
  {
    accessorKey: 'description',
    header: 'Descripción',
    meta: { class: { th: 'w-[36%]', td: 'w-[36%]' } },
  },
  { accessorKey: 'category', header: 'Categoría' },
  { id: 'billingStatus', header: 'Factura' },
  {
    accessorKey: 'amount',
    header: 'Monto',
    meta: { class: { th: 'text-right', td: 'text-right' } },
  },
];

const tabletColumns: TableColumn<Expense>[] = [
  {
    accessorKey: 'description',
    header: 'Descripción',
    meta: { class: { th: 'w-[40%]', td: 'w-[40%]' } },
  },
  { id: 'details', header: 'Categoría' },
  { id: 'billingStatus', header: 'Factura' },
  {
    accessorKey: 'amount',
    header: 'Monto',
    meta: { class: { th: 'text-right', td: 'text-right' } },
  },
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
const selectedExpenseType = ref('todos');
const selectedInvoiceStatus = ref('todos');
const draftCategory = ref('todas');
const draftExpenseType = ref('todos');
const draftInvoiceStatus = ref('todos');
const fromDate = ref('');
const toDate = ref('');
const isFormOpen = ref(false);
const isFiltersOpen = ref(false);
const expenseCreateRequest = useState<number>('admin-expense-create-request', () => 0);
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
  || selectedExpenseType.value !== 'todos'
  || selectedInvoiceStatus.value !== 'todos'
  || fromDate.value
  || toDate.value,
));
const activeAdvancedFilters = computed(() => [
  selectedCategory.value !== 'todas',
  selectedExpenseType.value !== 'todos',
  selectedInvoiceStatus.value !== 'todos',
].filter(Boolean).length);

function currentQuery(cursor?: string | null) {
  return {
    q: search.value.trim() || undefined,
    category: selectedCategory.value !== 'todas' ? selectedCategory.value : undefined,
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

watch(expenseCreateRequest, openCreate);

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

function selectExpense(_event: Event, row: TableRow<Expense>) {
  openEdit(row.original);
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
  selectedExpenseType.value = 'todos';
  selectedInvoiceStatus.value = 'todos';
  draftCategory.value = 'todas';
  draftExpenseType.value = 'todos';
  draftInvoiceStatus.value = 'todos';
  fromDate.value = '';
  toDate.value = '';
  isFiltersOpen.value = false;
}

function openFilters() {
  draftCategory.value = selectedCategory.value;
  draftExpenseType.value = selectedExpenseType.value;
  draftInvoiceStatus.value = selectedInvoiceStatus.value;
  isFiltersOpen.value = true;
}

function closeFilters() {
  isFiltersOpen.value = false;
}

function clearDraftFilters() {
  draftCategory.value = 'todas';
  draftExpenseType.value = 'todos';
  draftInvoiceStatus.value = 'todos';
}

function applyFilters() {
  selectedCategory.value = draftCategory.value;
  selectedExpenseType.value = draftExpenseType.value;
  selectedInvoiceStatus.value = draftInvoiceStatus.value;
  isFiltersOpen.value = false;
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

function actionItems(expense: Expense) {
  return [[
    { label: 'Editar', icon: 'i-lucide-square-pen', onSelect: () => openEdit(expense) },
    { label: 'Eliminar', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => { pendingDelete.value = expense; } },
  ]];
}

watch([
  selectedCategory,
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
    <section class="grid gap-3 sm:grid-cols-3">
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
    </section>

    <UCard class="app-surface" :ui="{ body: 'p-5 sm:p-6' }">
      <div class="grid gap-3 min-[744px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto]">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar gasto, proveedor o referencia" />
        <CalendarRangeInput v-model:start="fromDate" v-model:end="toDate" />
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-sliders-horizontal"
          :label="activeAdvancedFilters ? `Filtros (${activeAdvancedFilters})` : 'Filtros'"
          class="w-full justify-center min-[744px]:w-auto"
          @click="openFilters"
        />
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
      <section class="grid gap-3 min-[744px]:landscape:hidden min-[1025px]:portrait:hidden">
        <UCard v-for="expense in expenses" :key="expense.id" class="app-surface" :ui="{ body: 'p-5 sm:p-5' }">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2"><UIcon :name="categoryIcon(expense.category)" class="size-4 shrink-0 text-primary" /><h2 class="truncate font-semibold text-highlighted">{{ expense.description }}</h2></div>
              <p class="mt-1 text-sm text-muted">{{ displayDate(expense.expenseDate) }}</p>
              <p v-if="expense.billingReference1 || expense.billingReference2" class="mt-3 truncate text-xs text-muted">
                Ref: {{ [expense.billingReference1, expense.billingReference2].filter(Boolean).join(' · ') }}
              </p>
            </div>
            <UDropdownMenu :items="actionItems(expense)"><UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Acciones del gasto" /></UDropdownMenu>
          </div>
          <div class="mt-5 flex items-end justify-between gap-4 border-t border-default/70 pt-4">
            <UBadge :color="expense.isInvoiced ? 'success' : 'warning'" variant="soft">
              <UIcon :name="expense.isInvoiced ? 'i-lucide-file-check-2' : 'i-lucide-file-clock'" class="size-3" />
              {{ expense.isInvoiced ? 'Facturado' : 'Pendiente' }}
            </UBadge>
            <p class="text-xl font-semibold text-highlighted">{{ currency(expense.amount) }}</p>
          </div>
        </UCard>
      </section>

      <UCard class="app-surface hidden overflow-hidden min-[744px]:landscape:block min-[1025px]:portrait:block 2xl:hidden" :ui="{ body: 'p-0 sm:p-0' }">
        <UTable
          :data="expenses"
          :columns="tabletColumns"
          :ui="{
            th: 'px-4 py-3',
            td: 'px-4 py-3.5 align-middle',
            tr: 'cursor-pointer transition-colors hover:bg-elevated/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary'
          }"
          @select="selectExpense"
        >
          <template #description-cell="{ row }">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UIcon :name="categoryIcon(row.original.category)" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="break-words font-semibold leading-snug text-highlighted">{{ row.original.description }}</p>
                <p class="whitespace-nowrap text-xs text-muted">{{ displayDate(row.original.expenseDate) }}</p>
              </div>
            </div>
          </template>
          <template #details-cell="{ row }">
            <div class="flex max-w-48 flex-wrap gap-1.5">
              <UBadge color="neutral" variant="soft">{{ optionLabel(categoryOptions, row.original.category) }}</UBadge>
            </div>
          </template>
          <template #billingStatus-cell="{ row }">
            <UBadge :color="row.original.isInvoiced ? 'success' : 'warning'" variant="soft">
              <UIcon :name="row.original.isInvoiced ? 'i-lucide-file-check-2' : 'i-lucide-file-clock'" class="size-3" />
              {{ row.original.isInvoiced ? 'Facturado' : 'Pendiente' }}
            </UBadge>
          </template>
          <template #amount-cell="{ row }"><span class="whitespace-nowrap font-semibold text-highlighted">{{ currency(row.original.amount) }}</span></template>
        </UTable>
      </UCard>

      <UCard class="app-surface hidden overflow-hidden 2xl:block" :ui="{ body: 'p-0 sm:p-0' }">
        <UTable
          :data="expenses"
          :columns="columns"
          :ui="{
            th: 'px-5 py-3.5',
            td: 'px-5 py-4',
            tr: 'cursor-pointer transition-colors hover:bg-elevated/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary'
          }"
          @select="selectExpense"
        >
          <template #description-cell="{ row }">
            <div class="flex min-w-0 items-center gap-3"><div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><UIcon :name="categoryIcon(row.original.category)" class="size-4" /></div><div class="min-w-0"><p class="break-words font-semibold leading-snug text-highlighted">{{ row.original.description }}</p><p class="whitespace-nowrap text-xs text-muted">{{ displayDate(row.original.expenseDate) }}</p></div></div>
          </template>
          <template #category-cell="{ row }"><UBadge color="neutral" variant="soft">{{ optionLabel(categoryOptions, row.original.category) }}</UBadge></template>
          <template #billingStatus-cell="{ row }">
            <div class="space-y-1.5">
              <UBadge :color="row.original.isInvoiced ? 'success' : 'warning'" variant="soft"><UIcon :name="row.original.isInvoiced ? 'i-lucide-file-check-2' : 'i-lucide-file-clock'" class="size-3" />{{ row.original.isInvoiced ? 'Facturado' : 'Pendiente' }}</UBadge>
              <p v-if="row.original.billingReference1 || row.original.billingReference2" class="max-w-44 truncate text-xs text-muted">{{ [row.original.billingReference1, row.original.billingReference2].filter(Boolean).join(' · ') }}</p>
              <p v-else class="text-xs text-dimmed">Sin referencias</p>
            </div>
          </template>
          <template #amount-cell="{ row }"><span class="font-semibold text-highlighted">{{ currency(row.original.amount) }}</span></template>
        </UTable>
      </UCard>

      <div v-if="nextCursor" class="text-center">
        <UButton color="neutral" variant="soft" icon="i-lucide-chevrons-down" :loading="loadingMore" @click="loadExpenses(true)">Cargar más gastos</UButton>
      </div>
    </template>

    <UModal v-model:open="isFiltersOpen" title="Filtrar gastos" description="Selecciona los criterios y aplícalos al historial." :ui="{ content: 'max-w-lg' }">
      <template #body>
        <div class="space-y-5">
          <UFormField label="Categoría">
            <USelect v-model="draftCategory" :items="categoryOptions" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="Tipo de gasto">
            <URadioGroup
              v-model="draftExpenseType"
              :items="[...expenseTypeOptions]"
              value-key="value"
              orientation="horizontal"
              variant="table"
              :ui="{ fieldset: 'w-full', item: 'min-w-0 flex-1' }"
            />
          </UFormField>
          <UFormField label="Estado de facturación">
            <URadioGroup
              v-model="draftInvoiceStatus"
              :items="[...invoiceStatusOptions]"
              value-key="value"
              orientation="horizontal"
              variant="table"
              :ui="{ fieldset: 'w-full', item: 'min-w-0 flex-1' }"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <UButton color="neutral" variant="ghost" icon="i-lucide-filter-x" @click="clearDraftFilters">Limpiar</UButton>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="closeFilters">Cancelar</UButton>
            <UButton icon="i-lucide-check" @click="applyFilters">Aplicar filtros</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="isFormOpen" :title="formTitle" :description="formDescription" :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <UForm :schema="expenseInputSchema" :state="formState" class="space-y-5" @submit="saveExpense">
          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Fecha" name="expenseDate" required><CalendarInput v-model="formState.expenseDate" aria-label="Fecha del gasto" /></UFormField>
            <UFormField label="Monto" name="amount" required><UInputNumber v-model="formState.amount" :min="0" :step="0.01" :format-options="{ style: 'currency', currency: 'MXN' }" size="lg" class="w-full" /></UFormField>
            <UFormField label="Categoría" name="category" required><USelect v-model="formState.category" :items="categoryOptions.slice(1)" value-key="value" class="w-full" /></UFormField>
            <UFormField label="Método de pago" name="paymentMethod" required><USelect v-model="formState.paymentMethod" :items="paymentOptions.slice(1)" value-key="value" class="w-full" /></UFormField>
            <UFormField label="Tipo de gasto" name="expenseType" required><USelect v-model="formState.expenseType" :items="expenseTypeOptions.slice(1)" value-key="value" class="w-full" /></UFormField>
            <UFormField label="Proveedor" name="vendor" hint="Opcional">
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
            <UFormField label="Referencia de facturación 1" name="billingReference1" hint="Opcional"><UInput v-model="formState.billingReference1" icon="i-lucide-hash" placeholder="Folio u orden de compra" class="w-full" /></UFormField>
            <UFormField label="Referencia de facturación 2" name="billingReference2" hint="Opcional"><UInput v-model="formState.billingReference2" icon="i-lucide-fingerprint" placeholder="UUID, ticket u otra referencia" class="w-full" /></UFormField>
            <UFormField label="Estado de facturación" name="isInvoiced">
              <USwitch v-model="formState.isInvoiced" label="Este gasto ya fue facturado" description="Actívalo cuando el comprobante fiscal esté disponible." />
            </UFormField>
            <UFormField label="Notas" name="notes" hint="Opcional"><UTextarea v-model="formState.notes" placeholder="Detalles, folio o contexto adicional" autoresize :rows="3" class="w-full" /></UFormField>
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
