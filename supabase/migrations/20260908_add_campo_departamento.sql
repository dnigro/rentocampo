-- Permite guardar el departamento o partido opcional de un campo.
alter table public.campos
  add column if not exists departamento text;
