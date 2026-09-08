-- Permite guardar la descripción opcional de ambiente/suelo de un campo.
alter table public.campos
  add column if not exists ambiente text;
