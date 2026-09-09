-- Conversaciones directas privadas, independientes de las consultas por campo.
create table if not exists public.mensajes_directos (
  id uuid primary key default gen_random_uuid(),
  remitente_id uuid not null references auth.users(id) on delete cascade,
  destinatario_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null check (char_length(trim(contenido)) > 0),
  created_at timestamptz not null default now(),
  constraint mensajes_directos_distintos check (remitente_id <> destinatario_id)
);

alter table public.mensajes_directos enable row level security;

drop policy if exists "mensajes_directos_select_participantes" on public.mensajes_directos;
create policy "mensajes_directos_select_participantes" on public.mensajes_directos for select to authenticated
using (auth.uid() = remitente_id or auth.uid() = destinatario_id);

drop policy if exists "mensajes_directos_insert_remitente" on public.mensajes_directos;
create policy "mensajes_directos_insert_remitente" on public.mensajes_directos for insert to authenticated
with check (auth.uid() = remitente_id and remitente_id <> destinatario_id);

grant select, insert on public.mensajes_directos to authenticated;
create index if not exists mensajes_directos_participantes_idx on public.mensajes_directos (remitente_id, destinatario_id, created_at);
