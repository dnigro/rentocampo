-- Compatibilidad con instalaciones que crearon favoritos sin identificador.
alter table public.favoritos
  add column if not exists id uuid default gen_random_uuid();

update public.favoritos
set id = gen_random_uuid()
where id is null;

alter table public.favoritos
  alter column id set not null;

create unique index if not exists favoritos_id_key on public.favoritos (id);
