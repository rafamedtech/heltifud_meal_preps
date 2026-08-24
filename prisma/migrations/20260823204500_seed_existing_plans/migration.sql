-- Move the plans currently published on the site into the database. Stable UUIDs
-- keep this migration deterministic across local, staging, and production.
INSERT INTO public.plans (
  id, title, description, image, slot_types, is_active, updated_at
) VALUES
  (
    'f0000000-0000-4000-8000-000000000001',
    'Plan desayunos',
    'Desayunos saludables a domicilio para empezar tu día con energía.',
    'v1746204413/heltifud/desayunos_xoypat.png',
    ARRAY['DESAYUNO'::"SlotType"],
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'f0000000-0000-4000-8000-000000000002',
    'Plan comidas',
    'Comidas caseras y balanceadas listas para tu semana sin cocinar.',
    'v1746204412/heltifud/comidas_zjbuum.png',
    ARRAY['COMIDA'::"SlotType"],
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'f0000000-0000-4000-8000-000000000003',
    'Plan cenas',
    'Cenas ligeras y deliciosas, entregadas listas para servir.',
    'v1746204411/heltifud/cenas_wfp48j.png',
    ARRAY['CENA'::"SlotType"],
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'f0000000-0000-4000-8000-000000000004',
    'Plan toda la semana',
    'Meal prep completo semanal con desayuno, comida y cena.',
    'v1746204413/heltifud/todas_pdzwgw.png',
    ARRAY['DESAYUNO'::"SlotType", 'COMIDA'::"SlotType", 'CENA'::"SlotType"],
    true,
    CURRENT_TIMESTAMP
  );

INSERT INTO public.plan_variants (
  id, plan_id, title, days_count, price, is_active, updated_at
) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', '3 días', 3, 400.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000001', '4 días', 4, 500.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000001', '5 días', 5, 600.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000002', '3 días', 3, 500.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000005', 'f0000000-0000-4000-8000-000000000002', '4 días', 4, 600.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000006', 'f0000000-0000-4000-8000-000000000002', '5 días', 5, 700.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000007', 'f0000000-0000-4000-8000-000000000003', '3 días', 3, 450.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000008', 'f0000000-0000-4000-8000-000000000003', '4 días', 4, 550.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000009', 'f0000000-0000-4000-8000-000000000003', '5 días', 5, 650.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000010', 'f0000000-0000-4000-8000-000000000004', '3 días', 3, 1300.00, true, CURRENT_TIMESTAMP),
  ('f1000000-0000-4000-8000-000000000011', 'f0000000-0000-4000-8000-000000000004', '5 días', 5, 1900.00, true, CURRENT_TIMESTAMP);
