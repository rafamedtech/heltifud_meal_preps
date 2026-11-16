-- The week (WeeklyCycle.status) is the only source of a menu's availability.
-- `isActive` was a mirror kept in sync by updateCycle; no reader uses it.
DROP INDEX IF EXISTS "WeeklyMenu_isActive_idx";

ALTER TABLE "WeeklyMenu" DROP COLUMN "isActive";
