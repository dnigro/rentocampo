-- Regional UAT fixes. Apply to the isolated UAT project before testing this PR.
-- Production application of this migration is a separate release step.
alter table public.campos drop constraint if exists campos_country_code_check;
alter table public.campos add constraint campos_country_code_check check (country_code in ('AR', 'UY', 'PY'));
alter table public.profiles drop constraint if exists profiles_country_code_check;
alter table public.profiles add constraint profiles_country_code_check check (country_code in ('AR', 'UY', 'PY'));
alter table public.demo_servicios_rurales drop constraint if exists demo_servicios_rurales_country_code_check;
alter table public.demo_servicios_rurales add constraint demo_servicios_rurales_country_code_check check (country_code in ('AR', 'UY', 'PY'));

-- These are self-selected marketplace personas, never administrative privileges.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nombre, roles, country_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    array[case new.raw_user_meta_data ->> 'tipo'
      when 'propietario' then 'propietario'::public.user_role
      when 'prestador' then 'prestador'::public.user_role
      else 'productor'::public.user_role end],
    case when new.raw_user_meta_data ->> 'country_code' in ('AR', 'UY', 'PY')
      then new.raw_user_meta_data ->> 'country_code' else 'AR' end
  ) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

alter table public.servicios_publicaciones add column if not exists country_code text;
-- Historical publications were created with an Argentina-only form. Do not
-- reassign their market when an owner subsequently changes their profile country.
update public.servicios_publicaciones set country_code = 'AR' where country_code is null;
alter table public.servicios_publicaciones alter column country_code set not null;
alter table public.servicios_publicaciones drop constraint if exists servicios_publicaciones_country_code_check;
alter table public.servicios_publicaciones add constraint servicios_publicaciones_country_code_check
  check (country_code in ('AR', 'UY', 'PY'));
create index if not exists servicios_publicaciones_country_active_idx
  on public.servicios_publicaciones (country_code) where activo = true;

-- Older clients can omit the new column: derive it once from their own profile.
-- Explicit country on the publication remains independent of later profile edits.
create or replace function public.set_service_country()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.country_code is null then
    select p.country_code into new.country_code from public.profiles p where p.id = new.propietario_id;
    new.country_code := coalesce(new.country_code, 'AR');
  end if;
  return new;
end;
$$;
revoke all on function public.set_service_country() from public, anon, authenticated;
drop trigger if exists set_service_country on public.servicios_publicaciones;
create trigger set_service_country before insert on public.servicios_publicaciones
  for each row execute function public.set_service_country();
notify pgrst, 'reload schema';
