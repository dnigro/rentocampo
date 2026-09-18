const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabasePublicConfig() {
  if (!supabaseUrl || !supabasePublicKey) {
    throw new Error(
      "Supabase public credentials are missing. Configure NEXT_PUBLIC_SUPABASE_URL and a NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }

  return { url: supabaseUrl, key: supabasePublicKey };
}
