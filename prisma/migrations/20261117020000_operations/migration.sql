-- AlterTable
ALTER TABLE "FoodCatalogItem" ADD COLUMN     "recipe_yield" DECIMAL(10,3);

-- AlterTable
ALTER TABLE "order_deliveries" ADD COLUMN     "assigned_to" TEXT,
ADD COLUMN     "evidence_url" TEXT,
ADD COLUMN     "incident" TEXT;

-- CreateTable
CREATE TABLE "order_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "received_at" DATE NOT NULL,
    "actor_id" UUID,
    "actor_label" TEXT,
    "idempotency_key" UUID NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cycle_id" UUID NOT NULL,
    "source_fingerprint" TEXT NOT NULL,
    "request_key" UUID NOT NULL,
    "snapshot" JSONB NOT NULL,
    "actor_label" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_lists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "production_run_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopping_list_id" UUID NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(16,3) NOT NULL,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "expense_id" UUID,
    "updated_by" TEXT,

    CONSTRAINT "shopping_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "delivery_id" UUID NOT NULL,
    "details" JSONB NOT NULL,
    "actor_label" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_payments_order_id_created_at_idx" ON "order_payments"("order_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "order_payments_order_id_idempotency_key_key" ON "order_payments"("order_id", "idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "production_runs_request_key_key" ON "production_runs"("request_key");

-- CreateIndex
CREATE INDEX "production_runs_cycle_id_created_at_idx" ON "production_runs"("cycle_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "shopping_lists_production_run_id_key" ON "shopping_lists"("production_run_id");

-- CreateIndex
CREATE INDEX "shopping_items_expense_id_idx" ON "shopping_items"("expense_id");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_items_shopping_list_id_ingredient_id_unit_key" ON "shopping_items"("shopping_list_id", "ingredient_id", "unit");

-- CreateIndex
CREATE INDEX "delivery_activities_delivery_id_created_at_idx" ON "delivery_activities"("delivery_id", "created_at");

-- AddForeignKey
ALTER TABLE "order_payments" ADD CONSTRAINT "order_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_runs" ADD CONSTRAINT "production_runs_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "weekly_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_production_run_id_fkey" FOREIGN KEY ("production_run_id") REFERENCES "production_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_activities" ADD CONSTRAINT "delivery_activities_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "order_deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Server-only operational data: authenticated administrators use the protected API.
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_activities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON order_payments, production_runs, shopping_lists, shopping_items, delivery_activities FROM PUBLIC, anon, authenticated;
ALTER TABLE "FoodCatalogItem" ADD CONSTRAINT food_recipe_yield_positive CHECK (recipe_yield > 0);
ALTER TABLE order_payments ADD CONSTRAINT payment_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT payment_kind_valid CHECK (kind IN ('PAYMENT', 'REFUND')),
  ADD CONSTRAINT payment_method_valid CHECK (method IN ('CASH', 'TRANSFER', 'CARD'));
ALTER TABLE shopping_items ADD CONSTRAINT shopping_quantity_positive CHECK (quantity > 0);
ALTER TABLE shopping_lists ADD CONSTRAINT shopping_version_positive CHECK (version > 0);
-- Corrections to the ledger are compensating entries; historical runs stay frozen.
CREATE FUNCTION reject_operational_history_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Operational history is immutable'; END;
$$;
CREATE TRIGGER order_payments_immutable BEFORE UPDATE OR DELETE ON order_payments FOR EACH ROW EXECUTE FUNCTION reject_operational_history_change();
CREATE TRIGGER production_runs_immutable BEFORE UPDATE OR DELETE ON production_runs FOR EACH ROW EXECUTE FUNCTION reject_operational_history_change();
