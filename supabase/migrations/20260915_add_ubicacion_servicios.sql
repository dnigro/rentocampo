-- Ubicación pública aproximada para descubrir servicios rurales por zona.
alter table public.profiles
  add column if not exists provincia_servicio text,
  add column if not exists localidad_servicio text;

create index if not exists profiles_provincia_servicio_idx
  on public.profiles (provincia_servicio)
  where provincia_servicio is not null;
