-- T19: a plan variant used by an order can no longer be deleted.
--
-- The foreign key was ON DELETE SET NULL, so deleting a plan (which cascades to
-- its variants) or removing a variant while editing a plan silently cut the
-- link between historical orders and the variant they were sold under. The
-- application now refuses those deletes with a 409 and offers to pause the plan
-- or deactivate the variant; RESTRICT makes the database enforce the same rule
-- for any delete that slips past that check (for example, an order created
-- between the check and the delete).
ALTER TABLE "orders" DROP CONSTRAINT "orders_plan_variant_id_fkey";
ALTER TABLE "orders" ADD CONSTRAINT "orders_plan_variant_id_fkey"
  FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
