-- Publicaciones independientes e ilimitadas de servicios rurales.
create table if not exists public.servicios_publicaciones (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references public.profiles(id) on delete cascade,
  servicios_rurales text[] not null,
  foto_url text not null,
  provincia text not null,
  localidad text,
  zona text,
  detalle text,
  latitud double precision,
  longitud double precision,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint servicios_publicaciones_rubros_required check (cardinality(servicios_rurales) > 0),
  constraint servicios_publicaciones_foto_required check (length(trim(foto_url)) > 0),
  constraint servicios_publicaciones_provincia_required check (length(trim(provincia)) > 0)
);
create index if not exists servicios_publicaciones_propietario_idx on public.servicios_publicaciones(propietario_id);
create index if not exists servicios_publicaciones_activo_idx on public.servicios_publicaciones(activo);
alter table public.servicios_publicaciones enable row level security;
create policy "Servicios activos visibles" on public.servicios_publicaciones for select using (activo = true or auth.uid() = propietario_id);
create policy "Prestador crea sus servicios" on public.servicios_publicaciones for insert with check (auth.uid() = propietario_id);
create policy "Prestador edita sus servicios" on public.servicios_publicaciones for update using (auth.uid() = propietario_id) with check (auth.uid() = propietario_id);
create policy "Prestador elimina sus servicios" on public.servicios_publicaciones for delete using (auth.uid() = propietario_id);

-- Migra cada perfil existente a una publicación sin borrar las columnas legacy.
insert into public.servicios_publicaciones
  (propietario_id, servicios_rurales, foto_url, provincia, localidad, zona)
select id, servicios_rurales, service_photo_url, provincia_servicio, localidad_servicio, zona_servicio
from public.profiles
where cardinality(servicios_rurales) > 0
  and provincia_servicio is not null
  and service_photo_url is not null
  and trim(service_photo_url) <> ''
  and not exists (
    select 1 from public.servicios_publicaciones s where s.propietario_id = profiles.id
  );

-- Compatibilidad si la tabla fue creada por una versión anterior de esta migración.
alter table public.servicios_publicaciones add column if not exists detalle text;
alter table public.servicios_publicaciones add column if not exists latitud double precision;
alter table public.servicios_publicaciones add column if not exists longitud double precision;
