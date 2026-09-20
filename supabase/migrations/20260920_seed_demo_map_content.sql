-- Contenido demo transparente para poblar el mapa inicial de RentoCampo.
-- Los campos quedan asociados a dantenigro@gmail.com.
-- Los servicios demo viven en una tabla institucional separada y no simulan usuarios reales.

create table if not exists public.demo_servicios_rurales (
  id uuid primary key,
  nombre text not null,
  bio text not null,
  servicios_rurales text[] not null default '{}'::text[],
  zona_servicio text,
  provincia_servicio text not null,
  localidad_servicio text,
  latitud double precision not null,
  longitud double precision not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.demo_servicios_rurales enable row level security;

drop policy if exists "demo_servicios_public_read" on public.demo_servicios_rurales;
create policy "demo_servicios_public_read"
on public.demo_servicios_rurales
for select
to anon, authenticated
using (activo = true);

insert into public.demo_servicios_rurales
  (id, nombre, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio, latitud, longitud)
values
  ('10000000-0000-4000-8000-000000000001', 'RentoCampo Demo · Pergamino', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['siembra','fertilizacion'], 'Pergamino y zona núcleo norte de Buenos Aires', 'Buenos Aires', 'Pergamino', -33.8895, -60.5736),
  ('10000000-0000-4000-8000-000000000002', 'RentoCampo Demo · Rojas', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['pulverizacion','agronomia'], 'Rojas, Colón y alrededores', 'Buenos Aires', 'Rojas', -34.1953, -60.7337),
  ('10000000-0000-4000-8000-000000000003', 'RentoCampo Demo · Junín', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['cosecha','maquinaria'], 'Junín y noroeste bonaerense', 'Buenos Aires', 'Junín', -34.5850, -60.9589),
  ('10000000-0000-4000-8000-000000000004', 'RentoCampo Demo · Venado Tuerto', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['fertilizacion','siembra'], 'Venado Tuerto y General López', 'Santa Fe', 'Venado Tuerto', -33.7456, -61.9688),
  ('10000000-0000-4000-8000-000000000005', 'RentoCampo Demo · Rafaela', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['veterinaria','granja'], 'Rafaela y cuenca lechera', 'Santa Fe', 'Rafaela', -31.2503, -61.4867),
  ('10000000-0000-4000-8000-000000000006', 'RentoCampo Demo · Marcos Juárez', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['maquinaria','cosecha'], 'Marcos Juárez y sudeste de Córdoba', 'Córdoba', 'Marcos Juárez', -32.6978, -62.1067),
  ('10000000-0000-4000-8000-000000000007', 'RentoCampo Demo · Río Cuarto', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['transporte','acondicionamiento_granos'], 'Río Cuarto y sur de Córdoba', 'Córdoba', 'Río Cuarto', -33.1232, -64.3493),
  ('10000000-0000-4000-8000-000000000008', 'RentoCampo Demo · Tandil', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['alambrados','maquinaria'], 'Tandil y centro-sur bonaerense', 'Buenos Aires', 'Tandil', -37.3217, -59.1332),
  ('10000000-0000-4000-8000-000000000009', 'RentoCampo Demo · Balcarce', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['agronomia','pulverizacion'], 'Balcarce y sudeste bonaerense', 'Buenos Aires', 'Balcarce', -37.8462, -58.2552),
  ('10000000-0000-4000-8000-000000000010', 'RentoCampo Demo · Azul', 'PERFIL DEMO · Prestador ficticio creado para mostrar el funcionamiento del mapa y los filtros de RentoCampo. No representa una empresa ni una oferta comercial activa.', array['hoteleria_vacuna','veterinaria'], 'Azul y centro de Buenos Aires', 'Buenos Aires', 'Azul', -36.7770, -59.8585)
on conflict (id) do update set
  nombre = excluded.nombre,
  bio = excluded.bio,
  servicios_rurales = excluded.servicios_rurales,
  zona_servicio = excluded.zona_servicio,
  provincia_servicio = excluded.provincia_servicio,
  localidad_servicio = excluded.localidad_servicio,
  latitud = excluded.latitud,
  longitud = excluded.longitud,
  activo = true;

with propietario as (
  select id
  from auth.users
  where lower(email) = 'dantenigro@gmail.com'
  limit 1
)
insert into public.campos
  (id, propietario_id, titulo, descripcion, ubicacion, provincia, departamento, localidad, latitud, longitud, hectareas, aptitud, moneda, disponibilidad, mejoras, status)
select * from (
  select '20000000-0000-4000-8000-000000000001'::uuid, propietario.id, 'Campo agrícola demo en Pergamino', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Campo agrícola de 320 ha en zona núcleo, con buen acceso rural y ambiente productivo típico de la región.', 'Pergamino, Buenos Aires', 'Buenos Aires', 'Pergamino', 'Pergamino', -33.8895, -60.5736, 320, 'agricola', 'USD', 'a_convenir', 'Sí', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000002'::uuid, propietario.id, 'Campo agrícola demo en Rojas', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Lote agrícola de alta aptitud en una zona consolidada de producción.', 'Rojas, Buenos Aires', 'Buenos Aires', 'Rojas', 'Rojas', -34.1953, -60.7337, 245, 'agricola', 'USD', 'campaña_próxima', 'No', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000003'::uuid, propietario.id, 'Campo mixto demo en Junín', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Establecimiento mixto agrícola-ganadero con ubicación estratégica en el noroeste bonaerense.', 'Junín, Buenos Aires', 'Buenos Aires', 'Junín', 'Junín', -34.5850, -60.9589, 410, 'mixta', 'USD', 'a_convenir', 'Sí', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000004'::uuid, propietario.id, 'Campo agrícola demo en Venado Tuerto', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Campo agrícola de zona núcleo con acceso cercano a corredores productivos.', 'Venado Tuerto, Santa Fe', 'Santa Fe', 'General López', 'Venado Tuerto', -33.7456, -61.9688, 280, 'agricola', 'USD', 'inmediata', 'Sí', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000005'::uuid, propietario.id, 'Campo mixto demo en Rafaela', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Establecimiento mixto de referencia en la cuenca productiva de Rafaela.', 'Rafaela, Santa Fe', 'Santa Fe', 'Castellanos', 'Rafaela', -31.2503, -61.4867, 360, 'mixta', 'USD', 'a_convenir', 'Sí', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000006'::uuid, propietario.id, 'Campo agrícola demo en Marcos Juárez', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Campo agrícola del sudeste cordobés con suelos productivos y acceso rural.', 'Marcos Juárez, Córdoba', 'Córdoba', 'Marcos Juárez', 'Marcos Juárez', -32.6978, -62.1067, 300, 'agricola', 'USD', 'campaña_próxima', 'No', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000007'::uuid, propietario.id, 'Campo mixto demo en Río Cuarto', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Campo mixto agrícola-ganadero del sur cordobés, pensado para mostrar filtros y mapa.', 'Río Cuarto, Córdoba', 'Córdoba', 'Río Cuarto', 'Río Cuarto', -33.1232, -64.3493, 520, 'mixta', 'USD', 'a_convenir', 'Sí', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000008'::uuid, propietario.id, 'Campo mixto demo en Tandil', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Establecimiento mixto en ambiente serrano productivo del centro-sur bonaerense.', 'Tandil, Buenos Aires', 'Buenos Aires', 'Tandil', 'Tandil', -37.3217, -59.1332, 450, 'mixta', 'USD', 'inmediata', 'Sí', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000009'::uuid, propietario.id, 'Campo agrícola demo en Balcarce', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Campo agrícola representativo del sudeste bonaerense.', 'Balcarce, Buenos Aires', 'Buenos Aires', 'Balcarce', 'Balcarce', -37.8462, -58.2552, 275, 'agricola', 'USD', 'campaña_próxima', 'Sí', 'activo' from propietario
  union all
  select '20000000-0000-4000-8000-000000000010'::uuid, propietario.id, 'Campo ganadero demo en Azul', 'PUBLICACIÓN DEMO · Campo de ejemplo utilizado para mostrar el funcionamiento de RentoCampo. No representa una oferta comercial activa. Establecimiento ganadero con mejoras, creado como publicación demostrativa.', 'Azul, Buenos Aires', 'Buenos Aires', 'Azul', 'Azul', -36.7770, -59.8585, 600, 'ganadera', 'USD', 'a_convenir', 'Sí', 'activo' from propietario
) as demo(id, propietario_id, titulo, descripcion, ubicacion, provincia, departamento, localidad, latitud, longitud, hectareas, aptitud, moneda, disponibilidad, mejoras, status)
on conflict (id) do update set
  propietario_id = excluded.propietario_id,
  titulo = excluded.titulo,
  descripcion = excluded.descripcion,
  ubicacion = excluded.ubicacion,
  provincia = excluded.provincia,
  departamento = excluded.departamento,
  localidad = excluded.localidad,
  latitud = excluded.latitud,
  longitud = excluded.longitud,
  hectareas = excluded.hectareas,
  aptitud = excluded.aptitud,
  moneda = excluded.moneda,
  disponibilidad = excluded.disponibilidad,
  mejoras = excluded.mejoras,
  status = excluded.status;
