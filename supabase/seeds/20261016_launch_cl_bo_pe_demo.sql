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

-- Use the already-approved demo photograph, with site asset fallback.
insert into public.campos_fotos (campo_id, url, orden, storage_path)
select demo.id, coalesce(foto.url, '/hero-campo.jpeg'), 0, foto.storage_path
from (values
  ('20000000-0000-4000-8000-000000000041'::uuid),
  ('20000000-0000-4000-8000-000000000042'::uuid),
  ('20000000-0000-4000-8000-000000000043'::uuid)
) demo(id)
left join lateral (
  select url, storage_path from public.campos_fotos
  where campo_id = '20000000-0000-4000-8000-000000000001'::uuid
  order by orden asc limit 1
) foto on true
where exists (select 1 from public.campos c where c.id = demo.id)
  and not exists (select 1 from public.campos_fotos existing where existing.campo_id = demo.id);
