BEGIN;
SET LOCAL lock_timeout = '5s';
CREATE UNIQUE INDEX "weekly_cycles_single_open_key" ON "weekly_cycles" ((1)) WHERE "status" = 'OPEN';
ALTER TABLE "orders" ADD COLUMN "contact_snapshot" JSONB;
ALTER TABLE "order_menu_slots" ADD COLUMN "notes" TEXT;
CREATE TABLE "order_access_links" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "token_hash" TEXT NOT NULL,
  "customer_id" UUID NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "order_id" UUID REFERENCES "orders"("id") ON DELETE CASCADE,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "revoked_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "order_access_links_token_hash_key" ON "order_access_links"("token_hash");
CREATE INDEX "order_access_links_customer_id_idx" ON "order_access_links"("customer_id");
CREATE INDEX "order_access_links_order_id_idx" ON "order_access_links"("order_id");
ALTER TABLE "order_access_links" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "order_access_links" FROM PUBLIC, anon, authenticated;
COMMIT;
