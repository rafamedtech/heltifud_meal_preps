ALTER TABLE public.expenses
ADD COLUMN billing_reference_1 TEXT,
ADD COLUMN billing_reference_2 TEXT,
ADD COLUMN expense_type TEXT NOT NULL DEFAULT 'variable',
ADD COLUMN is_invoiced BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT expenses_billing_reference_1_check
  CHECK (billing_reference_1 IS NULL OR char_length(btrim(billing_reference_1)) <= 160),
ADD CONSTRAINT expenses_billing_reference_2_check
  CHECK (billing_reference_2 IS NULL OR char_length(btrim(billing_reference_2)) <= 160),
ADD CONSTRAINT expenses_type_check
  CHECK (expense_type IN ('fijo', 'variable'));

CREATE INDEX expenses_type_date_idx
ON public.expenses (expense_type, expense_date DESC);

CREATE INDEX expenses_invoiced_date_idx
ON public.expenses (is_invoiced, expense_date DESC);

COMMENT ON COLUMN public.expenses.billing_reference_1 IS
  'Primera referencia libre para identificar o solicitar la factura.';

COMMENT ON COLUMN public.expenses.billing_reference_2 IS
  'Segunda referencia libre para identificar o solicitar la factura.';

COMMENT ON COLUMN public.expenses.expense_type IS
  'Clasificación operativa del gasto: fijo o variable.';

COMMENT ON COLUMN public.expenses.is_invoiced IS
  'Indica si el comprobante fiscal del gasto ya fue emitido.';
