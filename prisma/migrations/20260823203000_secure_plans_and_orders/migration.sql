-- Preserve database-side UUID generation for SQL clients and server routes.
ALTER TABLE public.customers ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.expenses ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.plans ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.plan_variants ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.orders ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.order_menu_slots ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.order_menu_components ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX plans_title_key ON public.plans (title);

ALTER TABLE public.plans
  ADD CONSTRAINT plans_title_check
    CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  ADD CONSTRAINT plans_description_check
    CHECK (char_length(btrim(description)) BETWEEN 2 AND 500),
  ADD CONSTRAINT plans_image_check
    CHECK (char_length(btrim(image)) BETWEEN 1 AND 500),
  ADD CONSTRAINT plans_slot_types_check
    CHECK (cardinality(slot_types) BETWEEN 1 AND 5);

ALTER TABLE public.plan_variants
  ADD CONSTRAINT plan_variants_title_check
    CHECK (char_length(btrim(title)) BETWEEN 1 AND 80),
  ADD CONSTRAINT plan_variants_days_count_check
    CHECK (days_count BETWEEN 1 AND 7),
  ADD CONSTRAINT plan_variants_price_check
    CHECK (price > 0);

ALTER TABLE public.orders
  ADD CONSTRAINT orders_plan_title_snapshot_check
    CHECK (char_length(btrim(plan_title_snapshot)) BETWEEN 2 AND 120),
  ADD CONSTRAINT orders_plan_variant_title_snapshot_check
    CHECK (char_length(btrim(plan_variant_title_snapshot)) BETWEEN 1 AND 80),
  ADD CONSTRAINT orders_price_snapshot_check
    CHECK (price_snapshot > 0),
  ADD CONSTRAINT orders_first_delivery_location_check
    CHECK (first_delivery_location IN (1, 2)),
  ADD CONSTRAINT orders_second_delivery_location_check
    CHECK (second_delivery_location IN (1, 2)),
  ADD CONSTRAINT orders_first_delivery_address_check
    CHECK (char_length(btrim(first_delivery_address)) BETWEEN 3 AND 300),
  ADD CONSTRAINT orders_second_delivery_address_check
    CHECK (char_length(btrim(second_delivery_address)) BETWEEN 3 AND 300),
  ADD CONSTRAINT orders_delivery_dates_check
    CHECK (second_delivery_date >= first_delivery_date),
  ADD CONSTRAINT orders_notes_check
    CHECK (notes IS NULL OR char_length(btrim(notes)) <= 1000);

ALTER TABLE public.order_menu_slots
  ADD CONSTRAINT order_menu_slots_day_order_check
    CHECK (day_order BETWEEN 1 AND 7);

ALTER TABLE public.order_menu_components
  ADD CONSTRAINT order_menu_components_position_check
    CHECK (position >= 0),
  ADD CONSTRAINT order_menu_components_nombre_check
    CHECK (char_length(btrim(nombre)) BETWEEN 1 AND 160),
  ADD CONSTRAINT order_menu_components_calorias_check
    CHECK (calorias >= 0);

-- These tables are managed through authenticated server routes. No public Data
-- API policies are created, so RLS denies direct anon/authenticated access.
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_menu_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_menu_components ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.plans IS
  'Tipos de plan y tiempos de comida incluidos.';
COMMENT ON TABLE public.plan_variants IS
  'Opciones de días y precio disponibles para cada plan.';
COMMENT ON TABLE public.orders IS
  'Pedidos con dos entregas independientes y copias históricas del plan, precio y direcciones.';
COMMENT ON TABLE public.order_menu_slots IS
  'Copia editable de los días y tiempos del menú activo al crear un pedido.';
COMMENT ON TABLE public.order_menu_components IS
  'Copia editable de los platillos del pedido; no modifica el menú semanal original.';
