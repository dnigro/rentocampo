-- RentoCampo multipaís: base segura Argentina + Uruguay.
-- Mantiene todos los datos existentes en Argentina por defecto.

alter table public.campos
  add column if not exists country_code text not null default 'AR';

update public.campos
set country_code = 'AR'
where country_code is null or country_code = '';

alter table public.campos
  drop constraint if exists campos_country_code_check;

alter table public.campos
  add constraint campos_country_code_check
  check (country_code in ('AR', 'UY'));

create index if not exists campos_country_status_idx
  on public.campos(country_code, status);

alter table public.profiles
  add column if not exists country_code text not null default 'AR';

update public.profiles
set country_code = 'AR'
where country_code is null or country_code = '';

alter table public.profiles
  drop constraint if exists profiles_country_code_check;

alter table public.profiles
  add constraint profiles_country_code_check
  check (country_code in ('AR', 'UY'));

alter table public.demo_servicios_rurales
  add column if not exists country_code text not null default 'AR';

update public.demo_servicios_rurales
set country_code = 'AR'
where country_code is null or country_code = '';

alter table public.demo_servicios_rurales
  drop constraint if exists demo_servicios_rurales_country_code_check;

alter table public.demo_servicios_rurales
  add constraint demo_servicios_rurales_country_code_check
  check (country_code in ('AR', 'UY'));
