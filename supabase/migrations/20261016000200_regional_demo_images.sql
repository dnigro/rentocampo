-- RentoCampo: same stored image contract for existing and new regional demos.
-- The original service demo photo is already part of /public, not a Supabase upload.
alter table public.demo_servicios_rurales
  add column if not exists imagen_url text;
notify pgrst, 'reload schema';
