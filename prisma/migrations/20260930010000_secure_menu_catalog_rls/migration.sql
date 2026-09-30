BEGIN;

-- Nuxt/Prisma owns menu and catalog access. Browser clients use the public
-- Nuxt DTOs or admin-authorized routes, never these tables through the Data API.
-- Keep the server's owner/BYPASSRLS access; do not add client policies.
ALTER TABLE public."WeeklyMenu" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MenuDay" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DaySlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FoodComponent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FoodCatalogItem" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public."WeeklyMenu",
  public."MenuDay",
  public."DaySlot",
  public."FoodComponent",
  public."FoodCatalogItem"
FROM PUBLIC, anon, authenticated;

COMMIT;
