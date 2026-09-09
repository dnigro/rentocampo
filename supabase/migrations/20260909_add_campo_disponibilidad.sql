-- Registra la disponibilidad elegida al publicar un campo.
alter table public.campos
  add column if not exists disponibilidad text not null default 'a_convenir'
  check (disponibilidad in ('inmediata', 'campaña_próxima', 'a_convenir'));
