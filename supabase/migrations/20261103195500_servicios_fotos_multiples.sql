alter table public.servicios_publicaciones add column if not exists fotos_urls jsonb not null default '[]'::jsonb;
comment on column public.servicios_publicaciones.fotos_urls is 'Ordered public photo URLs, maximum 8. foto_url remains the primary image for backwards compatibility.';
