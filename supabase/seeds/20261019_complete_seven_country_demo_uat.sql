-- RentoCampo: four missing country pairs (AR UY PY BR); UAT ONLY.
-- This file is an auditable seed, never a migration applied automatically.
-- Idempotent: do not overwrite existing user-created content or prior DEMOs.
-- Reuse the existing checked-in image assets already approved in the regional fixtures.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.campos WHERE id='20000000-0000-4000-8000-000000000041' AND status='activo') THEN
    RAISE EXCEPTION 'Missing established UAT CL DEMO owner. Abort: no new fixtures inserted.';
  END IF;
END $$;

WITH owner AS (
 SELECT propietario_id AS id FROM public.campos WHERE id='20000000-0000-4000-8000-000000000041' LIMIT 1
), records(id,pais,titulo,ubicacion,provincia,departamento,localidad,latitud,longitud,hectareas,moneda) AS (
 VALUES
  ('20000000-0000-4000-8000-000000000044'::uuid,'AR','DEMO · Campo agrícola en Pergamino, Argentina','Pergamino, Buenos Aires, Argentina','Buenos Aires','Pergamino','Pergamino',-33.8895,-60.5736,320,'USD'),
  ('20000000-0000-4000-8000-000000000045'::uuid,'UY','DEMO · Campo mixto en Colonia, Uruguay','Colonia Valdense, Colonia, Uruguay','Colonia','Colonia','Colonia Valdense',-34.337,-57.262,240,'USD'),
  ('20000000-0000-4000-8000-000000000046'::uuid,'PY','DEMO · Campo agrícola en Itapúa, Paraguay','Encarnación, Itapúa, Paraguay','Itapúa','Encarnación','Encarnación',-27.33,-55.866,480,'USD'),
  ('20000000-0000-4000-8000-000000000047'::uuid,'BR','DEMO · Fazenda agrícola em Ribeirão Preto, Brasil','Ribeirão Preto, São Paulo, Brasil','São Paulo','Ribeirão Preto','Ribeirão Preto',-21.169,-47.81,520,'BRL')
)
INSERT INTO public.campos (id,propietario_id,country_code,titulo,descripcion,ubicacion,provincia,departamento,localidad,latitud,longitud,hectareas,aptitud,operacion,moneda,disponibilidad,mejoras,status)
SELECT r.id,o.id,r.pais,r.titulo,
 CASE WHEN r.pais='BR' THEN 'ANÚNCIO DEMO · Exemplo visual da RentoCampo. Não é uma oferta comercial real e não recebe consultas.'
 ELSE 'PUBLICACIÓN DEMO · Ejemplo visual de RentoCampo. No representa una oferta comercial real ni admite consultas.' END,
 r.ubicacion,r.provincia,r.departamento,r.localidad,r.latitud,r.longitud,r.hectareas,
 'agricola','alquiler',r.moneda,'a_convenir','Sí','activo'::campo_status
FROM records r CROSS JOIN owner o ON CONFLICT (id) DO NOTHING;

INSERT INTO public.campos_fotos(campo_id,propietario_id,url,orden,storage_path)
SELECT c.id,c.propietario_id,'/rentocampo-hero-campo-bn-1920x1080.webp',0,
       c.propietario_id::text || '/demo-rentocampo-hero-campo-bn-1920x1080.webp'
FROM public.campos c
WHERE c.id IN (
  '20000000-0000-4000-8000-000000000044'::uuid,
  '20000000-0000-4000-8000-000000000045'::uuid,
  '20000000-0000-4000-8000-000000000046'::uuid,
  '20000000-0000-4000-8000-000000000047'::uuid
)
AND NOT EXISTS (SELECT 1 FROM public.campos_fotos f WHERE f.campo_id=c.id);

WITH records(id,pais,nombre,provincia,localidad,latitud,longitud,rubro) AS (
 VALUES
  ('10000000-0000-4000-8000-000000000016'::uuid,'AR','DEMO · Servicios agrícolas en Pergamino, Argentina','Buenos Aires','Pergamino',-33.8895,-60.5736,'siembra'),
  ('10000000-0000-4000-8000-000000000017'::uuid,'UY','DEMO · Servicios rurales en Colonia, Uruguay','Colonia','Colonia Valdense',-34.337,-57.262,'veterinaria'),
  ('10000000-0000-4000-8000-000000000018'::uuid,'PY','DEMO · Servicios rurales en Itapúa, Paraguay','Itapúa','Encarnación',-27.33,-55.866,'veterinaria'),
  ('10000000-0000-4000-8000-000000000019'::uuid,'BR','DEMO · Serviços rurais em Ribeirão Preto, Brasil','São Paulo','Ribeirão Preto',-21.169,-47.81,'veterinaria')
)
INSERT INTO public.demo_servicios_rurales(id,country_code,nombre,bio,servicios_rurales,zona_servicio,provincia_servicio,localidad_servicio,latitud,longitud,activo,imagen_url)
SELECT r.id,r.pais,r.nombre,
 CASE WHEN r.pais='BR' THEN 'PERFIL DEMO · Exemplo visual. Não representa uma empresa real e não recebe consultas.'
 ELSE 'PERFIL DEMO · Ejemplo visual. No representa una empresa real ni admite consultas.' END,
 ARRAY[r.rubro],r.localidad,r.provincia,r.localidad,r.latitud,r.longitud,true,'/demo-servicio-veterinaria.jpg'
FROM records r ON CONFLICT (id) DO NOTHING;

SELECT country_code, count(*) AS campos_demo
FROM public.campos
WHERE id::text LIKE '20000000-%' AND status='activo'
GROUP BY country_code ORDER BY country_code;
SELECT country_code, count(*) AS servicios_demo
FROM public.demo_servicios_rurales WHERE activo=true GROUP BY country_code ORDER BY country_code;
