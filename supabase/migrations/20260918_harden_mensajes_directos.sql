-- Los mensajes directos participan de Realtime y sólo permiten cambiar `leido`.
create or replace function public.prevent_direct_message_content_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.remitente_id is distinct from old.remitente_id
     or new.destinatario_id is distinct from old.destinatario_id
     or new.contenido is distinct from old.contenido
     or new.created_at is distinct from old.created_at then
    raise exception 'Only the read status can be updated';
  end if;
  return new;
end;
$$;

drop trigger if exists mensajes_directos_only_update_read_status
on public.mensajes_directos;
create trigger mensajes_directos_only_update_read_status
before update on public.mensajes_directos
for each row execute function public.prevent_direct_message_content_update();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'mensajes_directos'
  ) then
    alter publication supabase_realtime add table public.mensajes_directos;
  end if;
end
$$;
