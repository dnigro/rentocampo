-- Compatibilidad con instalaciones que crearon mensajes sin estado de lectura.
alter table public.mensajes
  add column if not exists leido boolean default false;

update public.mensajes
set leido = false
where leido is null;

alter table public.mensajes
  alter column leido set default false,
  alter column leido set not null;
