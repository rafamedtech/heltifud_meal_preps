-- Business policy of 17 Nov 2026.
--
-- 1. A delivery the customer never received after the retries ends as LOST
--    ("No entregada"). It closes the delivery without a refund.
ALTER TYPE "DeliveryStatus" ADD VALUE IF NOT EXISTS 'LOST';

-- 2. Store credit ("saldo a favor"). It is not a separate balance table: a
--    REFUND with method CREDIT adds to the customer's credit and a PAYMENT with
--    method CREDIT spends it. The ledger stays append-only (order_payments is
--    immutable), so the credit balance is always derived from it.
ALTER TABLE order_payments DROP CONSTRAINT payment_method_valid,
  ADD CONSTRAINT payment_method_valid CHECK (method IN ('CASH', 'TRANSFER', 'CARD', 'CREDIT'));
