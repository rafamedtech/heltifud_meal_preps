BEGIN;
SET LOCAL lock_timeout = '5s';

-- Additive: no order, delivery or meal is removed or rewritten.

-- Readable consecutive number. Orders that already exist are numbered by the
-- sequence as the column is added.
ALTER TABLE "orders"
  ADD COLUMN "folio" SERIAL NOT NULL,
  ADD COLUMN "cycle_id" UUID,
  ADD COLUMN "captured_after_cutoff" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "orders_folio_key" ON "orders"("folio");

-- Each order belongs to the week of the menu it was copied from.
UPDATE "orders" AS o
SET "cycle_id" = menu."cycle_id"
FROM "WeeklyMenu" AS menu
WHERE menu."id" = o."source_weekly_menu_id";

-- Fails on purpose, rolling everything back, if an order cannot be tied to a
-- week (its source menu was deleted or never joined a cycle).
ALTER TABLE "orders" ALTER COLUMN "cycle_id" SET NOT NULL;

CREATE INDEX "orders_cycle_status_idx" ON "orders"("cycle_id", "status");

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "weekly_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Where each copied dish comes from in the week's menu. Filled on copy; the
-- swap rules of the next stage read them.
ALTER TABLE "order_menu_components"
  ADD COLUMN "source_day_of_week" "DayOfWeek",
  ADD COLUMN "source_slot_type" "SlotType",
  ADD COLUMN "is_substitution" BOOLEAN NOT NULL DEFAULT false;

-- The folio sequence follows the same policy as its table.
REVOKE ALL PRIVILEGES ON SEQUENCE public."orders_folio_seq" FROM PUBLIC, anon, authenticated;

COMMIT;
