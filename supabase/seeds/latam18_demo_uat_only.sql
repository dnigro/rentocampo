-- UAT-ONLY fixture: 11 countries, one DEMO field and service each. NEVER run against production.
-- Requires previously established demo owner in UAT and deployed country-code checks.
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.campos WHERE id='20000000-0000-4000-8000-000000000041'::uuid AND status='activo') THEN
  RAISE EXCEPTION 'Missing established UAT demo owner. Abort.';
 END IF;
END $$;
WITH owner AS (SELECT propietario_id AS id FROM public.campos WHERE id='20000000-0000-4000-8000-000000000041'::uuid LIMIT 1), fixtures(id,pais,localidad,provincia,latitud,longitud) AS (
 VALUES ('20000000-0000-4000-8000-000000000101'::uuid,'MX','Guasave','Sinaloa',25.57,-108.47),
('20000000-0000-4000-8000-000000000102'::uuid,'GT','Cobán','Alta Verapaz',15.47,-90.37),
('20000000-0000-4000-8000-000000000103'::uuid,'SV','Santa Ana','Santa Ana',13.99,-89.56),
('20000000-0000-4000-8000-000000000104'::uuid,'HN','Juticalpa','Olancho',14.67,-86.22),
('20000000-0000-4000-8000-000000000105'::uuid,'NI','Chinandega','Chinandega',12.63,-87.13),
('20000000-0000-4000-8000-000000000106'::uuid,'CR','Liberia','Guanacaste',10.63,-85.44),
('20000000-0000-4000-8000-000000000107'::uuid,'PA','David','Chiriquí',8.43,-82.43),
('20000000-0000-4000-8000-000000000108'::uuid,'CO','Villavicencio','Meta',4.14,-73.63),
('20000000-0000-4000-8000-000000000109'::uuid,'EC','Babahoyo','Los Ríos',-1.8,-79.53),
('20000000-0000-4000-8000-000000000110'::uuid,'VE','Acarigua','Portuguesa',9.56,-69.2),
('20000000-0000-4000-8000-000000000111'::uuid,'DO','La Vega','La Vega',19.22,-70.53)
)
INSERT INTO public.campos(id,propietario_id,country_code,titulo,descripcion,ubicacion,provincia,departamento,localidad,latitud,longitud,hectareas,aptitud,operacion,moneda,disponibilidad,mejoras,status)
SELECT f.id,o.id,f.pais,'DEMO · Campo productivo en '||f.localidad,'PUBLICACIÓN DEMO · Ejemplo visual de RentoCampo. No es una oferta real ni admite consultas.',f.localidad||', '||f.provincia,f.provincia,f.provincia,f.localidad,f.latitud,f.longitud,240,'mixta','alquiler',CASE WHEN f.pais='MX' THEN 'MXN' ELSE 'USD' END,'a_convenir','No','activo'::campo_status
FROM fixtures f CROSS JOIN owner o ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campos_fotos(campo_id,propietario_id,url,orden,storage_path)
SELECT c.id,c.propietario_id,'/rentocampo-hero-campo-bn-1920x1080.webp',0,c.propietario_id::text||'/latam-demo-hero-bn.webp'
FROM public.campos c WHERE c.id::text >= '20000000-0000-4000-8000-000000000101' AND c.id::text <= '20000000-0000-4000-8000-000000000111'
AND NOT EXISTS(SELECT 1 FROM public.campos_fotos f WHERE f.campo_id=c.id);
WITH fixtures(id,pais,localidad,provincia,latitud,longitud) AS (
 VALUES ('10000000-0000-4000-8000-000000000101'::uuid,'MX','Guasave','Sinaloa',25.57,-108.47),
('10000000-0000-4000-8000-000000000102'::uuid,'GT','Cobán','Alta Verapaz',15.47,-90.37),
('10000000-0000-4000-8000-000000000103'::uuid,'SV','Santa Ana','Santa Ana',13.99,-89.56),
('10000000-0000-4000-8000-000000000104'::uuid,'HN','Juticalpa','Olancho',14.67,-86.22),
('10000000-0000-4000-8000-000000000105'::uuid,'NI','Chinandega','Chinandega',12.63,-87.13),
('10000000-0000-4000-8000-000000000106'::uuid,'CR','Liberia','Guanacaste',10.63,-85.44),
('10000000-0000-4000-8000-000000000107'::uuid,'PA','David','Chiriquí',8.43,-82.43),
('10000000-0000-4000-8000-000000000108'::uuid,'CO','Villavicencio','Meta',4.14,-73.63),
('10000000-0000-4000-8000-000000000109'::uuid,'EC','Babahoyo','Los Ríos',-1.8,-79.53),
('10000000-0000-4000-8000-000000000110'::uuid,'VE','Acarigua','Portuguesa',9.56,-69.2),
('10000000-0000-4000-8000-000000000111'::uuid,'DO','La Vega','La Vega',19.22,-70.53)
)
INSERT INTO public.demo_servicios_rurales(id,country_code,nombre,bio,servicios_rurales,zona_servicio,provincia_servicio,localidad_servicio,latitud,longitud,activo,imagen_url)
SELECT f.id,f.pais,'DEMO · Servicios rurales en '||f.localidad,'PERFIL DEMO · No representa empresa real ni admite consultas.',ARRAY['siembra'],f.localidad,f.provincia,f.localidad,f.latitud,f.longitud,true,'/demo-servicio-veterinaria.jpg' FROM fixtures f ON CONFLICT (id) DO NOTHING;
