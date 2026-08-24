-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PREPARING', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "slot_types" "SlotType"[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_variants" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "days_count" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "plan_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "plan_variant_id" UUID,
    "source_weekly_menu_id" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "plan_title_snapshot" TEXT NOT NULL,
    "plan_variant_title_snapshot" TEXT NOT NULL,
    "price_snapshot" DECIMAL(10,2) NOT NULL,
    "first_delivery_date" DATE NOT NULL,
    "first_delivery_location" INTEGER NOT NULL,
    "first_delivery_address" TEXT NOT NULL,
    "second_delivery_date" DATE NOT NULL,
    "second_delivery_location" INTEGER NOT NULL,
    "second_delivery_address" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_menu_slots" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "day_order" INTEGER NOT NULL,
    "slot_type" "SlotType" NOT NULL,
    "contenedor" TEXT,

    CONSTRAINT "order_menu_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_menu_components" (
    "id" UUID NOT NULL,
    "order_menu_slot_id" UUID NOT NULL,
    "catalog_item_id" TEXT,
    "component_role" "ComponentRole" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "calorias" INTEGER NOT NULL,
    "imagen" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "order_menu_components_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plans_active_title_idx" ON "plans"("is_active", "title");

-- CreateIndex
CREATE INDEX "plan_variants_active_price_idx" ON "plan_variants"("is_active", "price");

-- CreateIndex
CREATE UNIQUE INDEX "plan_variants_plan_days_key" ON "plan_variants"("plan_id", "days_count");

-- CreateIndex
CREATE INDEX "orders_customer_created_idx" ON "orders"("customer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_status_first_delivery_idx" ON "orders"("status", "first_delivery_date");

-- CreateIndex
CREATE INDEX "orders_status_second_delivery_idx" ON "orders"("status", "second_delivery_date");

-- CreateIndex
CREATE INDEX "orders_plan_variant_idx" ON "orders"("plan_variant_id");

-- CreateIndex
CREATE INDEX "orders_source_menu_idx" ON "orders"("source_weekly_menu_id");

-- CreateIndex
CREATE INDEX "order_menu_slots_order_sequence_idx" ON "order_menu_slots"("order_id", "day_order", "slot_type");

-- CreateIndex
CREATE UNIQUE INDEX "order_menu_slots_order_day_slot_key" ON "order_menu_slots"("order_id", "day_of_week", "slot_type");

-- CreateIndex
CREATE INDEX "order_menu_components_catalog_item_idx" ON "order_menu_components"("catalog_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_menu_components_slot_role_position_key" ON "order_menu_components"("order_menu_slot_id", "component_role", "position");

-- AddForeignKey
ALTER TABLE "plan_variants" ADD CONSTRAINT "plan_variants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_plan_variant_id_fkey" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_source_weekly_menu_id_fkey" FOREIGN KEY ("source_weekly_menu_id") REFERENCES "WeeklyMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_menu_slots" ADD CONSTRAINT "order_menu_slots_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_menu_components" ADD CONSTRAINT "order_menu_components_order_menu_slot_id_fkey" FOREIGN KEY ("order_menu_slot_id") REFERENCES "order_menu_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_menu_components" ADD CONSTRAINT "order_menu_components_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "FoodCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
