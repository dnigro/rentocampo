-- Applied in production on 2026-11-07; source-controlled history.
-- Authenticated clients must fetch private phone via owner-scoped server API.
REVOKE SELECT ON TABLE public.profiles FROM authenticated;
GRANT SELECT (id, nombre, apellido, avatar_url, bio, roles, activo, created_at, updated_at, provincia_servicio, localidad_servicio, servicios_rurales, zona_servicio, country_code, service_photo_url)
ON TABLE public.profiles TO authenticated;
