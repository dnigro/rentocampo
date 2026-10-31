import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry } from "@/data/countries";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";
import { translate } from "@/lib/i18n/messages";
import LiteListingImage from "@/components/lite/LiteListingImage";

export default async function LiteCamposListado() {
  const pais = resolveCountry(undefined, (await cookies()).get("rentocampo_country")?.value);
  const t = (key: Parameters<typeof translate>[1]) => translate(pais, key);
  const supabase = await createClient();
  let query = supabase.from("campos")
    .select("id,titulo,provincia,localidad,hectareas,aptitud,status,country_code,created_at")
    .eq("status", "activo");
  query = pais === "AR" ? query.or("country_code.eq.AR,country_code.is.null") : query.eq("country_code", pais);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(80);
  if (error) return <p role="alert">{t("fields.loadError")}</p>;

  const campos = seleccionarCamposPublicos(data ?? []);
  const ids = campos.map(c => c.id);
  const { data: fotos } = ids.length
    ? await supabase.from("campos_fotos").select("campo_id,url,orden").in("campo_id", ids).order("orden", { ascending: true })
    : { data: [] as { campo_id: string; url: string | null; orden: number }[] };
  const imagenPorCampo = new Map<string, string>();
  for (const foto of fotos ?? []) {
    if (foto.campo_id && foto.url && !imagenPorCampo.has(foto.campo_id)) {
      imagenPorCampo.set(foto.campo_id, foto.url);
    }
  }

  return <section style={{ display: "grid", gap: 12, margin: "24px 0" }}>
    <h2 style={{ fontSize: 22 }}>{t("fields.available")} ({campos.length})</h2>
    {campos.map(c => {
      const esDemo = c.id.startsWith("20000000-") || (c.titulo ?? "").toUpperCase().includes("DEMO");
      return <Link key={c.id} href={`/lite/campos/${c.id}`} style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: 12, borderRadius: 15, background: "#fff",
        border: "1px solid #dfe5e0", color: "#17231d", textDecoration: "none",
      }}>
        <div style={{ width: 112, height: 100, flexShrink: 0 }}>
          <LiteListingImage
            src={imagenPorCampo.get(c.id)}
            alt={esDemo ? "Imagen ilustrativa de campo DEMO" : `Fotografía de ${c.titulo || "campo"}`}
            eager={esDemo}
            style={{ height: 100, minHeight: 100 }}
          />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <strong style={{ fontSize: 17, lineHeight: 1.3, display: "block", overflowWrap: "anywhere" }}>
            {c.titulo || t("fields.availableSingle")}
          </strong>
          <p style={{ color: "#626d69", fontSize: 13, margin: "6px 0" }}>
            {[c.localidad, c.provincia].filter(Boolean).join(", ")}
          </p>
          <span style={{ fontSize: 13 }}>
            {c.hectareas ? c.hectareas + " ha" : ""}{c.aptitud ? " · " + c.aptitud : ""}
          </span>
          {esDemo && <small style={{ display: "block", color: "#416957", marginTop: 4 }}>
            DEMO · imagen ilustrativa si no hay foto
          </small>}
        </div>
        <span aria-hidden="true" style={{ color: "#416957", fontSize: 20 }}>›</span>
      </Link>;
    })}
    {campos.length === 0 && <p>{t("fields.noResults")}</p>}
    <Link href={`/lite/campos/mapa?pais=${pais}`} style={{
      padding: 17, textAlign: "center", background: "#193e32",
      color: "white", borderRadius: 12, textDecoration: "none",
    }}>{t("fields.viewOnMap")}</Link>
  </section>;
}
