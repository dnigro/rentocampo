-- Favoritos persistentes por usuario.
-- La operación queda limitada al usuario autenticado mediante RLS.

create table if not exists public.favoritos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  campo_id uuid not null references public.campos(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favoritos_usuario_campo_key unique (usuario_id, campo_id)
);

alter table public.favoritos enable row level security;

drop policy if exists "favoritos_select_own" on public.favoritos;
create policy "favoritos_select_own"
on public.favoritos
for select
to authenticated
using (auth.uid() = usuario_id);

drop policy if exists "favoritos_insert_own" on public.favoritos;
create policy "favoritos_insert_own"
on public.favoritos
for insert
to authenticated
with check (auth.uid() = usuario_id);

drop policy if exists "favoritos_delete_own" on public.favoritos;
create policy "favoritos_delete_own"
on public.favoritos
for delete
to authenticated
using (auth.uid() = usuario_id);

grant select, insert, delete on public.favoritos to authenticated;

create index if not exists favoritos_usuario_id_idx
  on public.favoritos (usuario_id);

create index if not exists favoritos_campo_id_idx
  on public.favoritos (campo_id);
