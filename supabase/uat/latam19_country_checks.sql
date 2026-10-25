-- UAT ONLY. Run against the dedicated rentocampo-uat project, not production.
-- Expand existing regional constraints to include US without dropping other markets.
-- Protect existing rows and policies; no data changes or seed inserts.
BEGIN;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_country_code_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_country_code_check CHECK (country_code IN ('AR', 'UY', 'PY', 'CL', 'BO', 'PE', 'BR', 'MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CO', 'EC', 'VE', 'DO', 'US'));

ALTER TABLE public.campos DROP CONSTRAINT IF EXISTS campos_country_code_check;
ALTER TABLE public.campos ADD CONSTRAINT campos_country_code_check CHECK (country_code IN ('AR', 'UY', 'PY', 'CL', 'BO', 'PE', 'BR', 'MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CO', 'EC', 'VE', 'DO', 'US'));

ALTER TABLE public.servicios_publicaciones DROP CONSTRAINT IF EXISTS servicios_publicaciones_country_code_check;
ALTER TABLE public.servicios_publicaciones ADD CONSTRAINT servicios_publicaciones_country_code_check CHECK (country_code IN ('AR', 'UY', 'PY', 'CL', 'BO', 'PE', 'BR', 'MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CO', 'EC', 'VE', 'DO', 'US'));

ALTER TABLE public.demo_servicios_rurales DROP CONSTRAINT IF EXISTS demo_servicios_rurales_country_code_check;
ALTER TABLE public.demo_servicios_rurales ADD CONSTRAINT demo_servicios_rurales_country_code_check CHECK (country_code IN ('AR', 'UY', 'PY', 'CL', 'BO', 'PE', 'BR', 'MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'CO', 'EC', 'VE', 'DO', 'US'));
COMMIT;
