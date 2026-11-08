-- Applied and verified in Supabase production 2026-11-08.
-- Defense in depth: direct Supabase API calls cannot circumvent the
-- application's 2000-character message limit.
-- The constraints also reject empty or whitespace-only message bodies.
ALTER TABLE public.mensajes
  ADD CONSTRAINT mensajes_contenido_hard_limit_2000
  CHECK (char_length(btrim(contenido)) BETWEEN 1 AND 2000);

ALTER TABLE public.mensajes_directos
  ADD CONSTRAINT mensajes_directos_contenido_hard_limit_2000
  CHECK (char_length(btrim(contenido)) BETWEEN 1 AND 2000);
