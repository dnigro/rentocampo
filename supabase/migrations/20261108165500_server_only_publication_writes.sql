-- SECURITY PHASE 2: apply only AFTER the accompanying server routes have
-- been deployed and exercised on an isolated UAT database.
-- Prevent direct Data API writes from bypassing publication moderation,
-- validation and quotas. RLS still governs SELECT and DELETE.
BEGIN;

REVOKE INSERT, UPDATE ON TABLE public.campos
  FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE ON TABLE public.servicios_publicaciones
  FROM PUBLIC, anon, authenticated;

COMMIT;

-- Verify:
-- SELECT has_table_privilege('authenticated','public.campos','insert'),
--        has_table_privilege('authenticated','public.campos','update'),
--        has_table_privilege('authenticated','public.servicios_publicaciones','insert'),
--        has_table_privilege('authenticated','public.servicios_publicaciones','update');
-- All four must be false.
--
-- Rollback (emergency only): GRANT INSERT, UPDATE ON public.campos,
-- public.servicios_publicaciones TO authenticated;
-- Revoking these privileges is safe only when server-side service-role APIs
-- have passed positive owner and negative cross-user tests.
