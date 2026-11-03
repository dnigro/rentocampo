-- Optional, public-facing service name. Existing listings stay unchanged (NULL).
-- The first selected activity remains the fallback public title.
alter table public.servicios_publicaciones
  add column if not exists nombre_comercial varchar(100);
comment on column public.servicios_publicaciones.nombre_comercial
  is 'Optional public-facing service or business name (max 100 characters). When null or blank, public title is derived from servicios_rurales categories.';
