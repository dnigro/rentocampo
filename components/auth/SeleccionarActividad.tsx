"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LandPlot, Sprout, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { regionalText } from "@/lib/i18n/regional";
import type { CountryCode } from "@/data/countries";
import type { RolPerfil } from "@/types";

type Props = { country: CountryCode };

export default function SeleccionarActividad({ country }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [roles, setRoles] = useState<RolPerfil[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const tt = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  const opciones = [
    {
      value: "propietario" as const,
      icon: LandPlot,
      title: tt("Propietario", "Proprietário", "Landowner"),
      description: tt("Quiero publicar mis campos.", "Quero anunciar minhas terras.", "I want to list my farmland."),
    },
    {
      value: "productor" as const,
      icon: Sprout,
      title: tt("Productor", "Produtor", "Farmer"),
      description: tt("Busco tierras para producir.", "Procuro terras para produzir.", "I am looking for land to farm."),
    },
    {
      value: "prestador" as const,
      icon: Wrench,
      title: tt("Servicios rurales", "Serviços rurais", "Rural services"),
      description: tt("Ofrezco servicios para el campo.", "Ofereço serviços para o campo.", "I offer rural services."),
    },
  ];

  function toggle(role: RolPerfil) {
    setRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
    setError("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roles.length || saving) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? tt("No pudimos guardar tu actividad.", "Não foi possível salvar sua atividade.", "We couldn't save your activity."));

      // La selección queda persistida en profiles; recién entonces finalizamos el alta.
      const { error: updateError } = await createClient().auth.updateUser({
        data: { onboarding_pending_roles: false },
      });
      if (updateError) throw updateError;
      trackEvent("registro_roles_seleccionados", { roles: roles.join(","), pais: country });
      router.replace(pathname.startsWith("/lite/") ? "/lite/perfil" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : tt("Probá nuevamente.", "Tente novamente.", "Please try again."));
      setSaving(false);
    }
  }

  return (
    <section className="perfil-onboarding" aria-labelledby="perfil-onboarding-title">
      <p className="perfil-onboarding-kicker">{tt("TU CUENTA YA ESTÁ CREADA", "SUA CONTA JÁ FOI CRIADA", "YOUR ACCOUNT IS READY")}</p>
      <h2 id="perfil-onboarding-title">{tt("¿Cómo querés usar RentoCampo?", "Como deseja usar a RentoCampo?", "How will you use RentoCampo?")}</h2>
      <p className="perfil-onboarding-description">
        {tt("Elegí las actividades que mejor te representen. Podés marcar más de una y cambiarlas cuando quieras desde Mi perfil.",
          "Escolha as atividades que melhor representam você. Pode marcar mais de uma e alterá-las no seu perfil.",
          "Choose what fits you best. You can select more than one and change them later in your profile.")}
      </p>
      <form onSubmit={save}>
        <fieldset className="perfil-onboarding-options">
          <legend className="perfil-onboarding-legend">{tt("Mis actividades", "Minhas atividades", "My activities")}</legend>
          {opciones.map(({ value, title, description, icon: Icon }) => (
            <label key={value} className={`perfil-onboarding-option${roles.includes(value) ? " is-selected" : ""}`}>
              <input
                type="checkbox"
                checked={roles.includes(value)}
                onChange={() => toggle(value)}
              />
              <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
            </label>
          ))}
        </fieldset>
        {error && <p role="alert" className="perfil-onboarding-error">{error}</p>}
        <button type="submit" className="perfil-onboarding-submit" disabled={!roles.length || saving}>
          {saving ? tt("Guardando...", "Salvando...", "Saving...") : tt("Guardar y continuar", "Salvar e continuar", "Save and continue")}
        </button>
      </form>
    </section>
  );
}
