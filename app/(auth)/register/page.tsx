import { cookies } from "next/headers";
import RegisterForm from "@/components/auth/RegisterForm";
import { resolveCountry } from "@/data/countries";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ pais?: string; tipo?: string }> }) {
  const params = await searchParams;
  const country = resolveCountry(params.pais?.toUpperCase(), (await cookies()).get("rentocampo_country")?.value);
  const role = params.tipo === "propietario" || params.tipo === "prestador" ? params.tipo : "productor";
  return <RegisterForm key={`${country}-${role}`} initialCountry={country} initialRole={role} />;
}
