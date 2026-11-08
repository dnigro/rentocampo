-- Applied and verified in production on 2026-11-08.
-- All publication creates/updates go through authenticated server routes.
-- SELECT and owner-checked DELETE remain available under RLS.
REVOKE INSERT, UPDATE ON TABLE public.campos FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE ON TABLE public.servicios_publicaciones FROM PUBLIC, anon, authenticated;
-- See docs/security/audit-2026-11-08.md for tests and rollback.
