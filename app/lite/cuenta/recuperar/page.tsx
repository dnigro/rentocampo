import LiteHeader from "@/components/lite/LiteHeader";
import LiteAuthForm from "@/components/lite/LiteAuthForm";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";

export default async function Page() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  return (
    <>
      <LiteHeader />
      <main className="lite-auth-page">
        <h1 className="lite-auth-title">{regionalText(country, "Recuperar contraseña", "Recuperar senha", "Reset password")}</h1>
        <LiteAuthForm mode="recuperar" />
      </main>
    </>
  );
}
