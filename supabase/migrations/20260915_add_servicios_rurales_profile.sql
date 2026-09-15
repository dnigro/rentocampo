-- Incorpora el tercer perfil de RentoCampo: prestadores de servicios rurales.

alter table public.profiles
  add column if not exists servicios_rurales text[] not null default '{}'::text[],
  add column if not exists zona_servicio text;

alter table public.profiles
  drop constraint if exists profiles_roles_valid;

alter table public.profiles
  add constraint profiles_roles_valid check (
    cardinality(roles) > 0
    and roles <@ array['productor', 'propietario', 'prestador']::text[]
  );

-- Mantiene `tipo` compatible con el alta inicial cuando la tabla conserva
-- la validación histórica creada con alguno de estos nombres.
alter table public.profiles
  drop constraint if exists profiles_tipo_check;

alter table public.profiles
  drop constraint if exists profiles_tipo_valid;

alter table public.profiles
  add constraint profiles_tipo_valid check (
    tipo in ('productor', 'propietario', 'prestador')
  );

create or replace function public.sync_initial_profile_roles()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.tipo in ('propietario', 'prestador')
     and new.roles = array['productor']::text[] then
    new.roles := array[new.tipo]::text[];
  elsif new.roles is null or cardinality(new.roles) = 0 then
    new.roles := array[coalesce(new.tipo, 'productor')]::text[];
  end if;
  return new;
end;
$$;
