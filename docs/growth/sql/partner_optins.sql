-- DRAFT / NOT APPLIED TO PRODUCTION
-- Run only after UAT and approval through the project migration workflow.
-- Institutional opt-ins. Never insert existing public directory entries here.
CREATE TABLE IF NOT EXISTS public.partner_optins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  institution text NOT NULL,
  country text NOT NULL CHECK (country IN ('AR','UY','PY','CL','BO','PE','BR')),
  language text NOT NULL CHECK (language IN ('es','pt')),
  consent_version text NOT NULL,
  consent_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','unsubscribed')),
  token_hash text UNIQUE,
  token_expires_at timestamptz,
  confirmed_at timestamptz,
  ip_hash text NOT NULL,
  resend_contact_id text,
  resend_sync_state text NOT NULL DEFAULT 'not_added' CHECK (resend_sync_state IN ('not_added','synced','error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_optins_ip_recent_idx ON public.partner_optins(ip_hash,created_at DESC);
CREATE INDEX IF NOT EXISTS partner_optins_status_idx ON public.partner_optins(status, confirmed_at DESC);
ALTER TABLE public.partner_optins ENABLE ROW LEVEL SECURITY;
-- No access from browser, even for authenticated accounts.
REVOKE ALL ON public.partner_optins FROM anon, authenticated, PUBLIC;
-- Access is exclusively via server-side service role. Do not add broad SELECT policies.
COMMENT ON TABLE public.partner_optins IS 'Institutional newsletter consent evidence; server-side access only. No public scraped emails.';
