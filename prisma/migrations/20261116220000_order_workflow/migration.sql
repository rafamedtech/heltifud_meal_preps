BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.orders ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE TABLE public.order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version > 0),
  from_status "OrderStatus",
  to_status "OrderStatus" NOT NULL,
  delivery_sequence INTEGER CHECK (delivery_sequence IN (1, 2)),
  from_delivery_status "DeliveryStatus",
  to_delivery_status "DeliveryStatus",
  actor_id UUID,
  actor_label TEXT,
  reason TEXT CHECK (reason IS NULL OR char_length(btrim(reason)) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT order_status_event_delivery_check CHECK (
    (delivery_sequence IS NULL AND from_delivery_status IS NULL AND to_delivery_status IS NULL)
    OR (delivery_sequence IS NOT NULL AND from_delivery_status IS NOT NULL AND to_delivery_status IS NOT NULL)
  )
);
CREATE INDEX order_status_events_order_version_idx ON public.order_status_events(order_id, version);
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_status_events FROM PUBLIC, anon, authenticated;

-- Existing orders keep their exact data; their first event is an explicit baseline.
INSERT INTO public.order_status_events(order_id, version, to_status, reason)
SELECT id, version, status, 'Estado al incorporar el historial' FROM public.orders;

CREATE SCHEMA IF NOT EXISTS private;
CREATE FUNCTION private.protect_order_status_events() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Order removal may cascade. An event of an existing order is immutable.
  IF TG_OP = 'DELETE' AND NOT EXISTS (SELECT 1 FROM public.orders WHERE id = OLD.order_id) THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'El historial de estados solo admite inserciones' USING ERRCODE = '55000';
END;
$$;
REVOKE ALL ON FUNCTION private.protect_order_status_events() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER order_status_events_immutable BEFORE UPDATE OR DELETE ON public.order_status_events
FOR EACH ROW EXECUTE FUNCTION private.protect_order_status_events();
COMMIT;
