import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
  }>;
}) {
  const params = await searchParams;

  if (params.error) {
    redirect(
      `/login?error=${encodeURIComponent(params.error_description ?? params.error)}`,
    );
  }

  if (params.code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) {
      redirect("/dashboard");
    }
  }

  redirect("/login");
}
