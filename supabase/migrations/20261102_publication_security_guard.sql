-- RentoCampo Shield: enforcement at the database boundary.
-- Deploy only after UAT verifies signup, campo drafts, activation, service publishing and edits.
create table if not exists public.publication_security_events (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('campo','servicio')),
 publication_id uuid not null,
 created_at timestamptz not null default now(),
 unique(kind, publication_id)
);
create index if not exists publication_security_events_user_time
 on public.publication_security_events(user_id,created_at desc);
alter table public.publication_security_events enable row level security;
revoke all on public.publication_security_events from anon, authenticated;

create or replace function public.enforce_publication_security()
returns trigger language plpgsql security definer
set search_path = '' as $$
declare
 v_user uuid := auth.uid();
 v_confirmed timestamptz;
 v_created timestamptz;
 v_limit integer;
 v_used integer;
 v_kind text := case when TG_TABLE_NAME = 'campos' then 'campo' else 'servicio' end;
 v_activating boolean;
begin
 -- Privileged service operations are exempt; user-originated writes require auth.uid().
 if v_user is null then
   if current_setting('role', true) not in ('service_role','postgres') then
     raise exception 'Authentication required' using errcode='42501';
   end if;
   return NEW;
 end if;
 if NEW.propietario_id is distinct from v_user then
   raise exception 'Owner mismatch' using errcode='42501';
 end if;
 if TG_OP = 'INSERT' then
   v_activating := case when v_kind='campo' then NEW.status::text='activo' else NEW.activo end;
 else
   v_activating := case when v_kind='campo' then NEW.status::text='activo' and OLD.status::text<>'activo'
                        else NEW.activo and not OLD.activo end;
 end if;
 if not v_activating then return NEW; end if;
 select email_confirmed_at, created_at into v_confirmed,v_created
 from auth.users where id=v_user;
 if v_confirmed is null then
   raise exception 'Verify your email before publishing' using errcode='42501';
 end if;
 v_limit := case when v_created > now()-interval '7 days' then 2 else 10 end;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text, 291));
 select count(*) into v_used from public.publication_security_events
 where user_id=v_user and created_at>now()-interval '24 hours';
 if v_used >= v_limit then
   raise exception 'Daily publication safety limit reached' using errcode='23514';
 end if;
 insert into public.publication_security_events(user_id,kind,publication_id)
 values(v_user,v_kind,NEW.id) on conflict(kind,publication_id) do nothing;
 return NEW;
end $$;
revoke all on function public.enforce_publication_security() from public,anon,authenticated;
drop trigger if exists campo_publication_security on public.campos;
create trigger campo_publication_security before insert or update on public.campos
for each row execute function public.enforce_publication_security();
drop trigger if exists servicio_publication_security on public.servicios_publicaciones;
create trigger servicio_publication_security before insert or update on public.servicios_publicaciones
for each row execute function public.enforce_publication_security();
