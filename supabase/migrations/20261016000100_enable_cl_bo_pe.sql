-- RentoCampo: Enable CL/BO/PE without changing historical AR/UY/PY records.
-- APPLY ON ISOLATED UAT FIRST. Do not run against production before reviewed QA.
-- Regional UAT fixes. Apply to the isolated UAT project before testing this PR.
-- Production application of this migration is a separate release step.
alter table public.campos drop constraint if exists campos_country_code_check;
alter table public.campos add constraint campos_country_code_check check (country_code in ('AR', 'UY', 'PY', 'CL', 'BO', 'PE'));
alter table public.profiles drop constraint if exists profiles_country_code_check;
alter table public.profiles add constraint profiles_country_code_check check (country_code in ('AR', 'UY', 'PY', 'CL', 'BO', 'PE'));
alter table public.demo_servicios_rurales drop constraint if exists demo_servicios_rurales_country_code_check;
alter table public.demo_servicios_rurales add constraint demo_servicios_rurales_country_code_check check (country_code in ('AR', 'UY', 'PY', 'CL', 'BO', 'PE'));

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
    case when new.raw_user_meta_data ->> 'country_code' in ('AR', 'UY', 'PY', 'CL', 'BO', 'PE')
      then new.raw_user_meta_data ->> 'country_code' else 'AR' end
  ) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

alter table public.servicios_publicaciones drop constraint if exists servicios_publicaciones_country_code_check;
alter table public.servicios_publicaciones add constraint servicios_publicaciones_country_code_check
  check (country_code in ('AR', 'UY', 'PY', 'CL', 'BO', 'PE'));
notify pgrst, 'reload schema';
