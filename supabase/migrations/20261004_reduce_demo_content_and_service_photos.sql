-- Reduce contenido DEMO y agrega imagen representativa a servicios rurales.
-- Se conservan 2 campos demo de zona núcleo y 2 servicios demo.

alter table public.profiles
  add column if not exists service_photo_url text;

alter table public.demo_servicios_rurales
  add column if not exists imagen_url text;

-- Solo dos servicios demo visibles.
update public.demo_servicios_rurales
set activo = false;

update public.demo_servicios_rurales
set
  activo = true,
  imagen_url = '/demo-servicio-veterinaria.jpg'
where id in (
  '10000000-0000-4000-8000-000000000005'::uuid, -- Rafaela · Veterinaria / granja
  '10000000-0000-4000-8000-000000000010'::uuid  -- Azul · Hotelería vacuna / veterinaria
);

-- Oculta todos los campos DEMO existentes y reactiva solo 2 de zona núcleo.
update public.campos
set status = 'pausado'::campo_status
where id::text like '20000000-%';

update public.campos
set status = 'activo'::campo_status
where id in (
  '20000000-0000-4000-8000-000000000001'::uuid, -- Pergamino
  '20000000-0000-4000-8000-000000000004'::uuid  -- Venado Tuerto
);
