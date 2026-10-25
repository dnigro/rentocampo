-- RentoCampo US19 / PR #267 | PRODUCTION DEMO SEED ONLY.
-- Uses the verified production demo owner; adds only clearly marked non-commercial examples.
-- Safe to re-run, with ON CONFLICT DO NOTHING to preserve existing content.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.campos
    WHERE id = '20000000-0000-4000-8000-000000000041'::uuid
      AND status = 'activo' AND country_code = 'CL'
      AND propietario_id = 'b44fd0b0-bd3e-403e-a63a-d1d2ac95768a'::uuid
  ) THEN
    RAISE EXCEPTION 'US production seed requires established CL demo fixture; abort.';
  END IF;
END $$;

WITH owner AS (
  SELECT propietario_id AS id FROM public.campos
  WHERE id = '20000000-0000-4000-8000-000000000041'::uuid LIMIT 1
),
fixtures (id, title, place, state, city, lat, lng, ha, aptitude, photo) AS (
  VALUES
  ('20000000-0000-4000-8000-000000000301'::uuid,
   'DEMO · Cropland near Des Moines, Iowa', 'Des Moines, Iowa, United States',
   'Iowa', 'Des Moines', 41.5200, -93.8100, 320, 'agricola',
   '/rentocampo-hero-campo-bn-1920x1080.webp'),
  ('20000000-0000-4000-8000-000000000302'::uuid,
   'DEMO · Ranch land near Amarillo, Texas', 'Amarillo, Texas, United States',
   'Texas', 'Amarillo', 35.1400, -102.0200, 560, 'ganadera',
   '/image_eol_pix.png')
)
INSERT INTO public.campos
  (id, propietario_id, country_code, titulo, descripcion, ubicacion,
   provincia, departamento, localidad, latitud, longitud, hectareas,
   aptitud, operacion, moneda, disponibilidad, mejoras, status)
SELECT f.id, owner.id, 'US', f.title,
  'SAMPLE LISTING · Fictional educational demonstration only. Not a real commercial offer. No inquiries accepted.',
  f.place, f.state, f.city, f.city, f.lat, f.lng, f.ha,
  f.aptitude, 'alquiler', 'USD', 'a_convenir', 'No', 'activo'::campo_status
FROM fixtures f CROSS JOIN owner
ON CONFLICT (id) DO NOTHING;

WITH fixture_photos (id, photo) AS (
  VALUES
  ('20000000-0000-4000-8000-000000000301'::uuid, '/rentocampo-hero-campo-bn-1920x1080.webp'),
  ('20000000-0000-4000-8000-000000000302'::uuid, '/image_eol_pix.png')
)
INSERT INTO public.campos_fotos (campo_id, propietario_id, url, orden, storage_path)
SELECT c.id, c.propietario_id, p.photo, 0,
       c.propietario_id::text || '/us-demo-' || c.id::text || '.webp'
FROM public.campos c JOIN fixture_photos p ON p.id = c.id
WHERE c.country_code = 'US'
  AND NOT EXISTS (SELECT 1 FROM public.campos_fotos f WHERE f.campo_id=c.id)
ON CONFLICT DO NOTHING;

INSERT INTO public.demo_servicios_rurales
 (id, country_code, nombre, bio, servicios_rurales, zona_servicio,
  provincia_servicio, localidad_servicio, latitud, longitud, activo, imagen_url)
VALUES
 ('10000000-0000-4000-8000-000000000301'::uuid, 'US',
  'DEMO · Farm veterinary services in Fresno, California',
  'SAMPLE SERVICE · Fictional demonstration. Not a real business or active offer. No inquiries accepted.',
  ARRAY['veterinaria']::text[], 'Fresno area', 'California', 'Fresno',
  36.7378, -119.7871, true, '/demo-servicio-veterinaria.jpg'),
 ('10000000-0000-4000-8000-000000000302'::uuid, 'US',
  'DEMO · Agricultural transport in Wichita, Kansas',
  'SAMPLE SERVICE · Fictional demonstration. Not a real business or active offer. No inquiries accepted.',
  ARRAY['transporte']::text[], 'Wichita area', 'Kansas', 'Wichita',
  37.6872, -97.3301, true, '/image_truck_pix.png')
ON CONFLICT (id) DO NOTHING;

-- Post-seed verifications are queried separately against UAT.
