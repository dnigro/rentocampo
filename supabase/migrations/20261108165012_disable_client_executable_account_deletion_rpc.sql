-- Applied in production on 2026-11-08; source-controlled history.
-- Server account deletion now uses Supabase Auth Admin.
REVOKE EXECUTE ON FUNCTION public.delete_own_account(text)
FROM PUBLIC, anon, authenticated;
