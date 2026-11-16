BEGIN;
SET LOCAL lock_timeout = '5s';

-- Additive: existing orders keep both columns NULL; only new creations fill them.
ALTER TABLE "orders"
  ADD COLUMN "idempotency_key" UUID,
  ADD COLUMN "idempotency_fingerprint" TEXT,
  ADD CONSTRAINT "orders_idempotency_pair_check" CHECK (
    ("idempotency_key" IS NULL AND "idempotency_fingerprint" IS NULL)
    OR ("idempotency_key" IS NOT NULL AND "idempotency_fingerprint" ~ '^[0-9a-f]{64}$')
  );

-- The unique index is what serializes two simultaneous creations with the same key.
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

COMMIT;
