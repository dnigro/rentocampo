-- Applied and verified in production on 2026-11-08.
-- Anonymous users do not need delete permissions; RLS was already restrictive.
-- Owners may still delete their own publication through authenticated APIs.
REVOKE DELETE ON TABLE public.campos, public.servicios_publicaciones FROM anon;
