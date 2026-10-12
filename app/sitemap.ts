import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { APTITUD_SEO, SITE_URL, slugify } from "@/lib/seo/campos";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/campos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/campos/mapa`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${SITE_URL}/alquiler-de-campos`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/servicios-rurales`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return staticRoutes;

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: campos } = await admin
    .from("campos")
    .select("id, titulo, country_code, created_at, provincia, aptitud, operacion, updated_at")
    .eq("status", "activo")
    .or("country_code.eq.AR,country_code.is.null");

  // Solo anunciar a los buscadores los registros públicos, no avisos DEMO
  // como resultados inmobiliarios reales.
  const camposVisibles = seleccionarCamposPublicos(campos ?? []);
  const camposReales = camposVisibles.filter(
    (campo) =>
      !campo.id.startsWith("20000000-") &&
      !/\bDEMO\b/i.test(campo.titulo ?? ""),
  );
  const alquileres = camposVisibles.filter(
    (campo) => campo.operacion === "alquiler" || campo.operacion === "ambas",
  );
  const provincias = [
    ...new Set(alquileres.map((campo) => campo.provincia).filter(Boolean)),
  ];
  const aptitudes = [
    ...new Set(alquileres.map((campo) => campo.aptitud).filter(Boolean)),
  ];
  const slugPorAptitud = Object.fromEntries(
    Object.entries(APTITUD_SEO).map(([slug, item]) => [item.value, slug]),
  );
  const ultimaActualizacion = (items: typeof campos) => {
    const timestamps = (items ?? [])
      .map((item) => item.updated_at && new Date(item.updated_at).getTime())
      .filter(
        (timestamp): timestamp is number =>
          typeof timestamp === "number" && !Number.isNaN(timestamp),
      );
    return timestamps.length ? new Date(Math.max(...timestamps)) : undefined;
  };

  return [
    ...staticRoutes,
    ...provincias.map((provincia) => ({
      url: `${SITE_URL}/alquiler-de-campos/${slugify(provincia)}`,
      lastModified: ultimaActualizacion(
        alquileres.filter((campo) => campo.provincia === provincia),
      ),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...aptitudes
      .filter((aptitud) => slugPorAptitud[aptitud])
      .map((aptitud) => ({
        url: `${SITE_URL}/alquiler-de-campos/${slugPorAptitud[aptitud]}`,
        lastModified: ultimaActualizacion(
          alquileres.filter((campo) => campo.aptitud === aptitud),
        ),
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ...camposReales.map((campo) => ({
      url: `${SITE_URL}/campos/${campo.id}`,
      lastModified: campo.updated_at ? new Date(campo.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
