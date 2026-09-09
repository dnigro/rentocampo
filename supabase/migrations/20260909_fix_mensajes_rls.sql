-- Conversaciones privadas entre quien consulta y el propietario del campo.
-- La tabla puede existir en instalaciones anteriores; se agregan las políticas
-- necesarias para que los participantes puedan leer, crear y marcar mensajes.

alter table public.mensajes enable row level security;

create or replace function public.prevent_message_content_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.campo_id is distinct from old.campo_id
     or new.remitente_id is distinct from old.remitente_id
     or new.destinatario_id is distinct from old.destinatario_id
     or new.contenido is distinct from old.contenido
     or new.created_at is distinct from old.created_at then
    raise exception 'Only the read status can be updated';
  end if;
  return new;
end;
$$;

drop trigger if exists mensajes_only_update_read_status on public.mensajes;
create trigger mensajes_only_update_read_status
before update on public.mensajes
for each row execute function public.prevent_message_content_update();

drop policy if exists "mensajes_select_participantes" on public.mensajes;
create policy "mensajes_select_participantes"
on public.mensajes
for select
to authenticated
using (auth.uid() = remitente_id or auth.uid() = destinatario_id);

drop policy if exists "mensajes_insert_remitente" on public.mensajes;
create policy "mensajes_insert_remitente"
on public.mensajes
for insert
to authenticated
with check (
  auth.uid() = remitente_id
  and remitente_id <> destinatario_id
  and exists (
    select 1
    from public.campos
    where campos.id = mensajes.campo_id
      and (
        (campos.propietario_id = mensajes.destinatario_id
          and mensajes.remitente_id <> campos.propietario_id)
        or (campos.propietario_id = mensajes.remitente_id
          and mensajes.destinatario_id <> campos.propietario_id)
      )
  )
);

drop policy if exists "mensajes_update_destinatario" on public.mensajes;
create policy "mensajes_update_destinatario"
on public.mensajes
for update
to authenticated
using (auth.uid() = destinatario_id)
with check (
  auth.uid() = destinatario_id
  and remitente_id <> destinatario_id
  and exists (
    select 1
    from public.campos
    where campos.id = mensajes.campo_id
      and (
        (campos.propietario_id = mensajes.destinatario_id
          and mensajes.remitente_id <> campos.propietario_id)
        or (campos.propietario_id = mensajes.remitente_id
          and mensajes.destinatario_id <> campos.propietario_id)
      )
  )
);

grant select, insert, update on public.mensajes to authenticated;
