-- T03: database hardening.
--
-- 1. Runtime role. The application server should not connect as `postgres`
--    (BYPASSRLS + CREATEROLE + CREATEDB, member of service_role/authenticator,
--    owner of every table). `heltifud_app` can only read and write rows:
--    no DDL, no TRUNCATE, no ownership, so it cannot drop or disable the
--    immutability triggers below. Migrations keep running as `postgres`
--    through DIRECT_URL.
--
--    BYPASSRLS keeps the current model: RLS is enabled with no policies so the
--    Supabase Data API (anon/authenticated) sees nothing, and only the server
--    reads the tables. The role is created NOLOGIN; enabling login and setting
--    its password is an operational step done outside version control (see
--    docs/runbook-base-de-datos.md).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'heltifud_app') THEN
    CREATE ROLE heltifud_app NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO heltifud_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO heltifud_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO heltifud_app;
REVOKE ALL ON TABLE public._prisma_migrations FROM heltifud_app;

-- Tables and sequences created by later migrations (run as postgres) are
-- usable by the runtime role without repeating these grants.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO heltifud_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO heltifud_app;

-- 2. Prisma's migration ledger: not reachable today (anon/authenticated have no
--    USAGE on public), but keep it closed if that ever changes.
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public._prisma_migrations FROM PUBLIC, anon, authenticated;

-- 3. Trigger functions are not callable by client roles.
REVOKE ALL ON FUNCTION public.reject_operational_history_change() FROM PUBLIC, anon, authenticated;

-- 4. Append-only history for delivery activity and menu changes. As with
--    order_status_events, a row may only disappear through the cascade of its
--    parent (editing an order replaces its deliveries; deleting a customer or
--    order removes its history).
CREATE FUNCTION private.protect_child_history() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  parent_exists boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %s WHERE id = $1)', TG_ARGV[0])
      INTO parent_exists
      USING (to_jsonb(OLD) ->> TG_ARGV[1])::uuid;
    IF NOT parent_exists THEN
      RETURN OLD;
    END IF;
  END IF;
  RAISE EXCEPTION 'El historial de % solo admite inserciones', TG_TABLE_NAME USING ERRCODE = '55000';
END;
$$;
REVOKE ALL ON FUNCTION private.protect_child_history() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER delivery_activities_immutable BEFORE UPDATE OR DELETE ON public.delivery_activities
  FOR EACH ROW EXECUTE FUNCTION private.protect_child_history('public.order_deliveries', 'delivery_id');
CREATE TRIGGER order_menu_changes_immutable BEFORE UPDATE OR DELETE ON public.order_menu_changes
  FOR EACH ROW EXECUTE FUNCTION private.protect_child_history('public.orders', 'order_id');

-- 5. TRUNCATE skips row triggers; block it on every history table.
CREATE TRIGGER order_payments_no_truncate BEFORE TRUNCATE ON public.order_payments
  FOR EACH STATEMENT EXECUTE FUNCTION public.reject_operational_history_change();
CREATE TRIGGER production_runs_no_truncate BEFORE TRUNCATE ON public.production_runs
  FOR EACH STATEMENT EXECUTE FUNCTION public.reject_operational_history_change();
CREATE TRIGGER order_status_events_no_truncate BEFORE TRUNCATE ON public.order_status_events
  FOR EACH STATEMENT EXECUTE FUNCTION public.reject_operational_history_change();
CREATE TRIGGER delivery_activities_no_truncate BEFORE TRUNCATE ON public.delivery_activities
  FOR EACH STATEMENT EXECUTE FUNCTION public.reject_operational_history_change();
CREATE TRIGGER order_menu_changes_no_truncate BEFORE TRUNCATE ON public.order_menu_changes
  FOR EACH STATEMENT EXECUTE FUNCTION public.reject_operational_history_change();
