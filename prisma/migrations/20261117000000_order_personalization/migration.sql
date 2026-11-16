BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TYPE "MenuChangeKind" AS ENUM ('SUSTITUCION', 'RESTAURACION', 'AUTOMATICA');
CREATE TYPE "ExclusionKind" AS ENUM ('ALERGIA', 'INGREDIENTE', 'PLATILLO');

-- Additive: existing menus and orders start at version 1.
ALTER TABLE "WeeklyMenu" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "orders" ADD COLUMN "offer_version" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "order_menu_changes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "order_version" INTEGER NOT NULL,
    "kind" "MenuChangeKind" NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "slot_type" "SlotType" NOT NULL,
    "component_role" "ComponentRole" NOT NULL,
    "position" INTEGER NOT NULL,
    "from_nombre" TEXT NOT NULL,
    "to_nombre" TEXT NOT NULL,
    "from_catalog_item_id" TEXT,
    "to_catalog_item_id" TEXT,
    "reason" TEXT,
    "actor_id" UUID,
    "actor_label" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_menu_changes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_exclusions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" UUID NOT NULL,
    "kind" "ExclusionKind" NOT NULL,
    "ingredient_id" TEXT,
    "catalog_item_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_exclusions_pkey" PRIMARY KEY ("id"),
    -- A dish exclusion names a dish; allergies and ingredient exclusions name an ingredient.
    CONSTRAINT "customer_exclusions_target_check" CHECK (
      ("kind" = 'PLATILLO' AND "catalog_item_id" IS NOT NULL AND "ingredient_id" IS NULL)
      OR ("kind" <> 'PLATILLO' AND "ingredient_id" IS NOT NULL AND "catalog_item_id" IS NULL)
    )
);

CREATE INDEX "order_menu_changes_order_created_idx" ON "order_menu_changes"("order_id", "created_at");
CREATE INDEX "customer_exclusions_ingredient_idx" ON "customer_exclusions"("ingredient_id");
CREATE INDEX "customer_exclusions_item_idx" ON "customer_exclusions"("catalog_item_id");
CREATE UNIQUE INDEX "customer_exclusions_customer_ingredient_key" ON "customer_exclusions"("customer_id", "ingredient_id");
CREATE UNIQUE INDEX "customer_exclusions_customer_item_key" ON "customer_exclusions"("customer_id", "catalog_item_id");

ALTER TABLE "order_menu_changes" ADD CONSTRAINT "order_menu_changes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_exclusions" ADD CONSTRAINT "customer_exclusions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_exclusions" ADD CONSTRAINT "customer_exclusions_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "customer_exclusions" ADD CONSTRAINT "customer_exclusions_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "FoodCatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Server-only tables, like the rest of orders and customers.
ALTER TABLE public.order_menu_changes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_menu_changes FROM PUBLIC, anon, authenticated;
ALTER TABLE public.customer_exclusions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_exclusions FROM PUBLIC, anon, authenticated;

COMMIT;
