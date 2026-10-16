-- RentoCampo: one clearly labelled non-commercial demo per CL / BO / PE country.
-- Run on isolated Supabase UAT after 20261016000100_enable_cl_bo_pe.sql.
-- Approve PROD separately after UAT. Never apply silently.
do $$
begin
  if not exists (select 1 from auth.users where lower(email) = 'dantenigro@gmail.com') then
    raise exception 'Regional demo seed requires the existing demo owner';
  end if;
end $$;

with owner as (
  select id from auth.users where lower(email) = 'dantenigro@gmail.com' limit 1
), demos as (
  select * from (values
    ('20000000-0000-4000-8000-000000000041'::uuid, 'CL', 'DEMO · Campo agrícola en Ñuble, Chile',
     'PUBLICACIÓN DEMO · Ejemplo visual de RentoCampo en Chile. No es una oferta comercial real.', 'Chillán, Ñuble, Chile', 'Ñuble', 'Diguillín', 'Chillán', -36.6064, -72.1034, 420, 'agricola'),
    ('20000000-0000-4000-8000-000000000042'::uuid, 'BO', 'DEMO · Campo mixto en Santa Cruz, Bolivia',
     'PUBLICACIÓN DEMO · Ejemplo visual de RentoCampo en Bolivia. No es una oferta comercial real.', 'Montero, Santa Cruz, Bolivia', 'Santa Cruz', 'Obispo Santistevan', 'Montero', -17.3392, -63.2568, 650, 'mixta'),
    ('20000000-0000-4000-8000-000000000043'::uuid, 'PE', 'DEMO · Campo agrícola en Junín, Perú',
     'PUBLICACIÓN DEMO · Ejemplo visual de RentoCampo en Perú. No es una oferta comercial real.', 'Huancayo, Junín, Perú', 'Junín', 'Huancayo', 'Huancayo', -12.0651, -75.2049, 310, 'agricola')
  ) as entries(id, country_code, titulo, descripcion, ubicacion, provincia, departamento, localidad, latitud, longitud, hectareas, aptitud)
)
insert into public.campos (id, propietario_id, country_code, titulo, descripcion, ubicacion, provincia, departamento, localidad, latitud, longitud, hectareas, aptitud, operacion, moneda, disponibilidad, mejoras, status)
select demos.id, owner.id, demos.country_code, demos.titulo, demos.descripcion, demos.ubicacion, demos.provincia, demos.departamento, demos.localidad, demos.latitud, demos.longitud, demos.hectareas, demos.aptitud, 'alquiler', 'USD', 'a_convenir', 'Sí', 'activo'::campo_status
from demos cross join owner
on conflict (id) do nothing;

-- Same pre-existing photo as the current RentoCampo field DEMOs.
-- The existing photo table requires a path prefixed by its owner's UUID. The URL
-- points to our original checked-in DEMO asset; no external storage copy is required.
insert into public.campos_fotos (campo_id, propietario_id, url, orden, storage_path)
select c.id, c.propietario_id,
       '/rentocampo-hero-campo-bn-1920x1080.webp', 0,
       c.propietario_id::text || '/demo-rentocampo-hero-campo-bn-1920x1080.webp'
from public.campos c
where c.id in (
 '20000000-0000-4000-8000-000000000041'::uuid,
 '20000000-0000-4000-8000-000000000042'::uuid,
 '20000000-0000-4000-8000-000000000043'::uuid
)
and not exists (select 1 from public.campos_fotos f where f.campo_id=c.id);

-- One service DEMO per country with RentoCampo's existing rural veterinary photo.
insert into public.demo_servicios_rurales
(id,nombre,bio,servicios_rurales,zona_servicio,provincia_servicio,
 localidad_servicio,latitud,longitud,activo,country_code,imagen_url)
values
('10000000-0000-4000-8000-000000000013'::uuid,'DEMO · Veterinaria rural en Maule, Chile',
 'PERFIL DEMO · Servicio de ejemplo de RentoCampo. No representa una empresa real ni admite consultas.',
 array['veterinaria']::text[],'Talca, Curicó y zonas ganaderas del Maule',
 'Maule','Talca',-35.4264,-71.6554,true,'CL','/demo-servicio-veterinaria.jpg'),
('10000000-0000-4000-8000-000000000014'::uuid,'DEMO · Veterinaria rural en Santa Cruz, Bolivia',
 'PERFIL DEMO · Servicio de ejemplo de RentoCampo. No representa una empresa real ni admite consultas.',
 array['veterinaria']::text[],'Warnes, Montero y áreas de producción ganadera',
 'Santa Cruz','Warnes',-17.5163,-63.1669,true,'BO','/demo-servicio-veterinaria.jpg'),
('10000000-0000-4000-8000-000000000015'::uuid,'DEMO · Veterinaria rural en La Libertad, Perú',
 'PERFIL DEMO · Servicio de ejemplo de RentoCampo. No representa una empresa real ni admite consultas.',
 array['veterinaria']::text[],'Trujillo, valles rurales y alrededores',
 'La Libertad','Trujillo',-8.1116,-79.0287,true,'PE','/demo-servicio-veterinaria.jpg')
on conflict (id) do update set
 nombre=excluded.nombre,bio=excluded.bio,servicios_rurales=excluded.servicios_rurales,
 zona_servicio=excluded.zona_servicio,provincia_servicio=excluded.provincia_servicio,
 localidad_servicio=excluded.localidad_servicio,latitud=excluded.latitud,
 longitud=excluded.longitud,activo=excluded.activo,country_code=excluded.country_code,
 imagen_url=excluded.imagen_url;
