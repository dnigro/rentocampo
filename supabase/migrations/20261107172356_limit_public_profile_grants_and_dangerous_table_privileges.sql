-- Applied in production on 2026-11-07; source-controlled history.
REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- RLS filters rows and these grants filter columns.
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon;
GRANT SELECT (id, nombre, apellido, avatar_url, bio, roles, activo, created_at, updated_at, provincia_servicio, localidad_servicio, servicios_rurales, zona_servicio, country_code, service_photo_url)
ON TABLE public.profiles TO anon;

REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (nombre, apellido, telefono, avatar_url, bio, roles, provincia_servicio, localidad_servicio, servicios_rurales, zona_servicio, country_code, service_photo_url)
ON TABLE public.profiles TO authenticated;
