BEGIN;
SET LOCAL lock_timeout = '5s';

-- Additive only: existing menus keep every day, slot and component. Each one
-- is attached to the cycle of the week of its start date.

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'IN_PRODUCTION', 'COMPLETED');

-- CreateTable
CREATE TABLE "operation_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "cutoff_day" "DayOfWeek" NOT NULL DEFAULT 'VIERNES',
    "cutoff_time" TEXT NOT NULL DEFAULT '18:00',
    "first_delivery_allowed_days" "DayOfWeek"[] DEFAULT ARRAY['DOMINGO', 'LUNES']::"DayOfWeek"[],
    "second_delivery_allowed_days" "DayOfWeek"[] DEFAULT ARRAY['MIERCOLES', 'JUEVES']::"DayOfWeek"[],
    "first_delivery_meal_days" "DayOfWeek"[] DEFAULT ARRAY['LUNES', 'MARTES', 'MIERCOLES']::"DayOfWeek"[],
    "second_delivery_meal_days" "DayOfWeek"[] DEFAULT ARRAY['JUEVES', 'VIERNES']::"DayOfWeek"[],
    "time_zone" TEXT NOT NULL DEFAULT 'America/Tijuana',
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "operation_settings_single_row_check" CHECK ("id" = 1),
    CONSTRAINT "operation_settings_cutoff_time_check" CHECK ("cutoff_time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);

INSERT INTO "operation_settings" ("id") VALUES (1);

-- CreateTable
CREATE TABLE "weekly_cycles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "week_start" DATE NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'DRAFT',
    "order_cutoff_at" TIMESTAMPTZ(3) NOT NULL,
    "first_delivery_allowed_days" "DayOfWeek"[],
    "second_delivery_allowed_days" "DayOfWeek"[],
    "first_delivery_meal_days" "DayOfWeek"[],
    "second_delivery_meal_days" "DayOfWeek"[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_cycles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "weekly_cycles_week_start_monday_check" CHECK (EXTRACT(ISODOW FROM "week_start") = 1)
);

CREATE UNIQUE INDEX "weekly_cycles_week_start_key" ON "weekly_cycles"("week_start");
CREATE INDEX "weekly_cycles_status_week_idx" ON "weekly_cycles"("status", "week_start" DESC);

-- AlterTable
ALTER TABLE "WeeklyMenu"
  ADD COLUMN "cycle_id" UUID,
  ADD COLUMN "customer_id" UUID,
  ADD COLUMN "cycle_scope" TEXT;

-- Backfill: one cycle per week that already has a menu. Start dates are stored
-- as instants whose UTC calendar date is the Monday of the menu.
INSERT INTO "weekly_cycles" (
  "week_start", "status", "order_cutoff_at",
  "first_delivery_allowed_days", "second_delivery_allowed_days",
  "first_delivery_meal_days", "second_delivery_meal_days"
)
SELECT
  weeks.week_start,
  CASE
    WHEN weeks.has_active THEN 'OPEN'
    WHEN weeks.last_end < CURRENT_TIMESTAMP THEN 'COMPLETED'
    ELSE 'DRAFT'
  END::"CycleStatus",
  -- Friday before the week, at the default cutoff time in the business zone.
  ((weeks.week_start - 3)::timestamp + TIME '18:00') AT TIME ZONE 'America/Tijuana',
  settings."first_delivery_allowed_days", settings."second_delivery_allowed_days",
  settings."first_delivery_meal_days", settings."second_delivery_meal_days"
FROM (
  SELECT
    date_trunc('week', ("startDate" AT TIME ZONE 'UTC'))::date AS week_start,
    bool_or("isActive") AS has_active,
    max("endDate") AS last_end
  FROM "WeeklyMenu"
  GROUP BY 1
) AS weeks
CROSS JOIN "operation_settings" AS settings;

UPDATE "WeeklyMenu" AS menu
SET "cycle_id" = cycle."id",
    "cycle_scope" = menu."menuType"::text
FROM "weekly_cycles" AS cycle
WHERE cycle."week_start" = date_trunc('week', (menu."startDate" AT TIME ZONE 'UTC'))::date
  AND menu."menuType" <> 'PERSONALIZADO';

-- Personalised menus need a customer before they can join a cycle; any that
-- exist stay detached (cycle_id NULL) until one is assigned from the admin.

CREATE UNIQUE INDEX "weekly_menu_cycle_scope_key" ON "WeeklyMenu"("cycle_id", "cycle_scope");
CREATE INDEX "weekly_menu_customer_idx" ON "WeeklyMenu"("customer_id");

ALTER TABLE "WeeklyMenu"
  ADD CONSTRAINT "WeeklyMenu_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "weekly_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "WeeklyMenu_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "WeeklyMenu_personal_customer_check"
    CHECK (("menuType" = 'PERSONALIZADO') = ("customer_id" IS NOT NULL) OR "cycle_id" IS NULL);

-- Same policy as the other operational tables: only the Nuxt server reads them.
ALTER TABLE public."operation_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."weekly_cycles" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public."operation_settings",
  public."weekly_cycles"
FROM PUBLIC, anon, authenticated;

COMMIT;
