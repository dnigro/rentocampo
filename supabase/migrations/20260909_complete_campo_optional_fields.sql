-- Alinea los campos opcionales usados por el formulario de publicación.
-- Todas las sentencias son idempotentes y pueden ejecutarse aunque las
-- migraciones anteriores ya se hayan aplicado.
alter table public.campos
  add column if not exists ambiente text,
  add column if not exists departamento text,
  add column if not exists disponibilidad text not null default 'a_convenir'
    check (disponibilidad in ('inmediata', 'campaña_próxima', 'a_convenir')),
  add column if not exists rendimiento_est numeric;
