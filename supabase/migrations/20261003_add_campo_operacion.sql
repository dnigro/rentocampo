-- Agrega el tipo de operación a cada publicación de campo.
-- El valor por defecto preserva la esencia de RentoCampo: alquiler.
alter table public.campos
  add column if not exists operacion text not null default 'alquiler';

alter table public.campos
  drop constraint if exists campos_operacion_check;

alter table public.campos
  add constraint campos_operacion_check
  check (operacion in ('alquiler', 'venta', 'ambas'));
