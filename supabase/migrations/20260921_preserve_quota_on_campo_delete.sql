-- Preserve commercial quota history when a campo is deleted.
-- Deleting a published campo must not restore a consumed publication.

alter table public.land_publication_events
  alter column campo_id drop not null;

alter table public.land_publication_events
  drop constraint if exists land_publication_events_campo_id_fkey;

alter table public.land_publication_events
  add constraint land_publication_events_campo_id_fkey
  foreign key (campo_id)
  references public.campos(id)
  on delete set null;
