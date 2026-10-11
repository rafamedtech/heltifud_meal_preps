BEGIN;
SET LOCAL lock_timeout = '5s';

-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('ESTANDAR', 'VEGETARIANO', 'PERSONALIZADO');

-- AlterTable
ALTER TABLE "WeeklyMenu" ADD COLUMN     "menuType" "MenuType" NOT NULL DEFAULT 'ESTANDAR';

COMMIT;
