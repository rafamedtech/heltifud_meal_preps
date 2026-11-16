BEGIN;
SET LOCAL lock_timeout = '5s';

-- DESTRUCTIVE: every existing order is test data and is removed here, together
-- with its menu copy (cascade). Deliveries become their own rows, so there is
-- nothing to carry over. Menus, customers and plans are not touched.
DELETE FROM "orders";

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED');

-- The two fixed deliveries leave the order row.
DROP INDEX "orders_status_first_delivery_idx";
DROP INDEX "orders_status_second_delivery_idx";

ALTER TABLE "orders"
  DROP CONSTRAINT "orders_first_delivery_location_check",
  DROP CONSTRAINT "orders_second_delivery_location_check",
  DROP CONSTRAINT "orders_first_delivery_address_check",
  DROP CONSTRAINT "orders_second_delivery_address_check",
  DROP CONSTRAINT "orders_delivery_dates_check",
  DROP COLUMN "first_delivery_date",
  DROP COLUMN "first_delivery_location",
  DROP COLUMN "first_delivery_address",
  DROP COLUMN "second_delivery_date",
  DROP COLUMN "second_delivery_location",
  DROP COLUMN "second_delivery_address";

CREATE INDEX "orders_status_created_idx" ON "orders"("status", "created_at" DESC);

-- CreateTable
CREATE TABLE "order_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "location_number" INTEGER NOT NULL,
    "address_snapshot" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "delivered_at" TIMESTAMPTZ(3),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_deliveries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_deliveries_sequence_check" CHECK ("sequence" IN (1, 2)),
    CONSTRAINT "order_deliveries_location_number_check" CHECK ("location_number" IN (1, 2)),
    CONSTRAINT "order_deliveries_address_snapshot_check"
      CHECK (char_length(btrim("address_snapshot")) BETWEEN 3 AND 300),
    CONSTRAINT "order_deliveries_notes_check"
      CHECK ("notes" IS NULL OR char_length(btrim("notes")) <= 1000)
);

CREATE UNIQUE INDEX "order_deliveries_order_sequence_key" ON "order_deliveries"("order_id", "sequence");
CREATE INDEX "order_deliveries_date_status_idx" ON "order_deliveries"("scheduled_date", "status");

ALTER TABLE "order_deliveries"
  ADD CONSTRAINT "order_deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Every meal belongs to the delivery that carries it. The table is empty at
-- this point, so the column can be required from the start.
ALTER TABLE "order_menu_slots" ADD COLUMN "delivery_id" UUID NOT NULL;

CREATE INDEX "order_menu_slots_delivery_idx" ON "order_menu_slots"("delivery_id");

ALTER TABLE "order_menu_slots"
  ADD CONSTRAINT "order_menu_slots_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "order_deliveries"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- Same policy as the other order tables: only the Nuxt server reads them.
ALTER TABLE public."order_deliveries" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public."order_deliveries" FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.orders IS
  'Pedidos con copias históricas del plan y precio; sus entregas viven en order_deliveries.';
COMMENT ON TABLE public.order_deliveries IS
  'Entregas de un pedido (1 o 2), cada una con fecha, dirección congelada y estado propio.';

COMMIT;
