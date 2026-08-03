ALTER TABLE public.customers
  DROP CONSTRAINT customers_tipo_cliente_check;

UPDATE public.customers
SET tipo_cliente = 'menu'
WHERE tipo_cliente NOT IN ('menu', 'vegetariano', 'dieta');

ALTER TABLE public.customers
  ALTER COLUMN tipo_cliente SET DEFAULT 'menu',
  ADD CONSTRAINT customers_tipo_cliente_check
    CHECK (tipo_cliente IN ('menu', 'vegetariano', 'dieta'));
