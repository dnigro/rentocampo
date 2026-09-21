-- Billing base for annual land publishing packs.
-- This migration only creates the commercial ledger. It does not enable payments.

create table if not exists public.land_plan_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('productiva', 'administrador', 'portfolio')),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'exhausted', 'expired', 'cancelled', 'refunded')),
  publication_limit integer,
  publications_used integer not null default 0 check (publications_used >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  country_code text not null default 'AR',
  payment_provider text not null default 'mercadopago',
  external_reference text unique,
  provider_preference_id text,
  provider_payment_id text,
  provider_status text,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint land_plan_usage_within_limit check (
    publication_limit is null or publications_used <= publication_limit
  )
);

create index if not exists land_plan_purchases_user_idx
  on public.land_plan_purchases(user_id, created_at desc);

create index if not exists land_plan_purchases_external_reference_idx
  on public.land_plan_purchases(external_reference);

alter table public.land_plan_purchases enable row level security;

drop policy if exists "Users can read own land plan purchases"
  on public.land_plan_purchases;

create policy "Users can read own land plan purchases"
  on public.land_plan_purchases
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Writes are intentionally left to trusted server-side code using the service role.
-- The client must never be able to mark a payment as approved or grant itself quota.

create or replace function public.touch_land_plan_purchase_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists land_plan_purchases_touch_updated_at
  on public.land_plan_purchases;

create trigger land_plan_purchases_touch_updated_at
before update on public.land_plan_purchases
for each row execute function public.touch_land_plan_purchase_updated_at();
