-- Expense records are managed exclusively through authenticated server routes.
CREATE TABLE public.expenses (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    expense_date DATE NOT NULL,
    vendor TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT expenses_pkey PRIMARY KEY (id),
    CONSTRAINT expenses_description_check CHECK (char_length(btrim(description)) BETWEEN 2 AND 160),
    CONSTRAINT expenses_amount_check CHECK (amount > 0 AND amount <= 9999999999.99),
    CONSTRAINT expenses_category_check CHECK (category IN ('insumos', 'empaque', 'nomina', 'renta_servicios', 'transporte', 'marketing', 'equipo', 'otros')),
    CONSTRAINT expenses_payment_method_check CHECK (payment_method IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
    CONSTRAINT expenses_vendor_check CHECK (vendor IS NULL OR char_length(btrim(vendor)) <= 120),
    CONSTRAINT expenses_notes_check CHECK (notes IS NULL OR char_length(btrim(notes)) <= 500)
);

CREATE INDEX expenses_date_id_idx ON public.expenses (expense_date DESC, id);
CREATE INDEX expenses_category_date_idx ON public.expenses (category, expense_date DESC);

-- Defense in depth for the exposed public schema. No Data API policies are
-- created because access is intentionally limited to the authenticated server API.
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.expenses IS
    'Gastos administrados por las rutas autenticadas del panel; sin acceso directo por Data API.';
