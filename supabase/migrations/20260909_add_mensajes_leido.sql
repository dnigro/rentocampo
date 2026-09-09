-- Mantiene la compatibilidad con instalaciones de `mensajes` creadas antes
-- del estado de lectura.
alter table public.mensajes
  add column if not exists leido boolean not null default false;
