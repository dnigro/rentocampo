-- Roles acumulables y eliminación segura de la cuenta autenticada.

alter table public.profiles
  add column if not exists roles text[];

update public.profiles
set roles = array[coalesce(tipo, 'productor')]
where roles is null or cardinality(roles) = 0;

alter table public.profiles
  alter column roles set default array['productor']::text[],
  alter column roles set not null;

alter table public.profiles
  drop constraint if exists profiles_roles_valid;

alter table public.profiles
  add constraint profiles_roles_valid check (
    cardinality(roles) > 0
    and roles <@ array['productor', 'propietario']::text[]
  );

create or replace function public.delete_own_account(confirmation text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if confirmation <> 'ELIMINAR' then
    raise exception 'Invalid confirmation';
  end if;

  delete from public.mensajes
  where remitente_id = current_user_id
     or destinatario_id = current_user_id
     or campo_id in (
       select id from public.campos where propietario_id = current_user_id
     );

  delete from public.favoritos
  where usuario_id = current_user_id
     or campo_id in (
       select id from public.campos where propietario_id = current_user_id
     );

  delete from public.campos_fotos
  where campo_id in (
    select id from public.campos where propietario_id = current_user_id
  );

  delete from public.campos where propietario_id = current_user_id;
  delete from public.profiles where id = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_own_account(text) from public;
grant execute on function public.delete_own_account(text) to authenticated;
