-- Tracks each publication that consumes commercial quota.
-- One campo can consume quota only once, even if later edited or republished.

create table if not exists public.land_publication_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campo_id uuid not null references public.campos(id) on delete cascade,
  plan_purchase_id uuid references public.land_plan_purchases(id) on delete set null,
  plan_id text not null check (plan_id in ('inicial', 'productiva', 'administrador', 'portfolio')),
  consumed_at timestamptz not null default now(),
  unique (campo_id)
);

create index if not exists land_publication_events_user_idx
  on public.land_publication_events(user_id, consumed_at desc);

alter table public.land_publication_events enable row level security;

drop policy if exists "Users can read own publication usage"
  on public.land_publication_events;

create policy "Users can read own publication usage"
  on public.land_publication_events
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts/updates remain server-side only through the service role.
