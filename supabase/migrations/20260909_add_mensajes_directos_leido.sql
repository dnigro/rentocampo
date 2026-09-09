-- Agrega el estado de lectura para mostrar notificaciones de mensajes directos.
alter table public.mensajes_directos
  add column if not exists leido boolean not null default false;

drop policy if exists "mensajes_directos_update_destinatario" on public.mensajes_directos;
create policy "mensajes_directos_update_destinatario"
on public.mensajes_directos
for update
to authenticated
using (auth.uid() = destinatario_id)
with check (
  auth.uid() = destinatario_id
  and remitente_id <> destinatario_id
);

grant update on public.mensajes_directos to authenticated;
