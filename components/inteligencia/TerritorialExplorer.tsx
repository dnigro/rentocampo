"use client";

import { useEffect, useRef, useState } from "react";
import type { Layer, Map as LeafletMap } from "leaflet";
import Link from "next/link";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/data/countries";

const SOIL = {
  clay: {
    title: "Arcilla",
    titlePt: "Argila",
    map: "clay",
    description: "Contenido estimado de arcilla",
    descriptionPt: "Teor estimado de argila",
    unit: "g/kg",
  },
  phh2o: {
    title: "pH del suelo",
    titlePt: "pH do solo",
    map: "phh2o",
    description: "Acidez y alcalinidad estimadas",
    descriptionPt: "Acidez e alcalinidade estimadas",
    unit: "pH × 10 en el raster de origen",
  },
  soc: {
    title: "Carbono orgánico",
    titlePt: "Carbono orgânico",
    map: "soc",
    description: "Concentración estimada de carbono orgánico",
    descriptionPt: "Concentração estimada de carbono orgânico",
    unit: "dg/kg",
  },
} as const;

type SoilKey = keyof typeof SOIL;
type SoilChoice = SoilKey | "none";
type Depth = "0-5cm" | "5-15cm";

export default function TerritorialExplorer() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const soilRef = useRef<Layer | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [country, setCountry] = useState<CountryCode>("AR");
  const [soil, setSoil] = useState<SoilChoice>("clay");
  const [depth, setDepth] = useState<Depth>("0-5cm");
  const [status, setStatus] = useState<"idle" | "loading" | "visible" | "failed">("idle");
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const pt = country === "BR";
  const t = (es: string, br: string) => pt ? br : es;

  // Leaflet is client-only. Keep the experimental map isolated from the V1 map.
  useEffect(() => {
    let cancelled = false;
    void import("leaflet")
      .then((L) => {
        if (cancelled || !mapDiv.current || mapRef.current) return;
        leafletRef.current = L;
        const baseCountry = COUNTRIES.AR;
        const map = L.map(mapDiv.current, {
          zoomControl: false,
          preferCanvas: true,
        }).setView(baseCountry.mapCenter, baseCountry.mapZoom);
        mapRef.current = map;

        const base = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        });
        base.on("add", () => {
          const element = base.getContainer();
          if (element) element.style.filter = "grayscale(1) contrast(0.94)";
        });
        base.addTo(map);
        L.control.zoom({ position: "topright" }).addTo(map);
        map.on("click", (event) => {
          setPoint({ lat: event.latlng.lat, lng: event.latlng.lng });
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setMapError(true);
      });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      soilRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const selected = COUNTRIES[country];
    map.setView(selected.mapCenter, selected.mapZoom, { animate: false });
    setPoint(null);
  }, [country, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!ready || !map || !L) return;
    if (soilRef.current) {
      map.removeLayer(soilRef.current);
      soilRef.current = null;
    }
    if (soil === "none") {
      setStatus("idle");
      return;
    }
    const definition = SOIL[soil];
    let failed = false;
    setStatus("loading");
    // SoilGrids' REST point API is paused. WMS publishes visual rasters without
    // pretending to provide agronomic recommendations or measured point values.
    const overlay = L.tileLayer.wms(
      "https://maps.isric.org/mapserv?map=/map/" + definition.map + ".map",
      {
        layers: definition.map + "_" + depth + "_mean",
        format: "image/png",
        transparent: true,
        version: "1.1.1",
        opacity: 0.65,
        attribution: 'SoilGrids &copy; <a href="https://isric.org/explore/soilgrids/">ISRIC</a> (CC BY 4.0)',
      },
    );
    overlay.on("tileerror", () => {
      failed = true;
      setStatus("failed");
    });
    overlay.on("load", () => {
      if (!failed) setStatus("visible");
    });
    overlay.addTo(map);
    soilRef.current = overlay;
    return () => {
      overlay.off();
      if (map.hasLayer(overlay)) map.removeLayer(overlay);
      if (soilRef.current === overlay) soilRef.current = null;
    };
  }, [soil, depth, ready]);

  const statusText = {
    idle: t("Mapa base", "Mapa base"),
    loading: t("Cargando capa de SoilGrids…", "Carregando camada SoilGrids…"),
    visible: t("Capa de SoilGrids cargada", "Camada SoilGrids carregada"),
    failed: t("Capa externa no disponible; el mapa base sigue funcionando", "Camada externa indisponível; o mapa base segue funcionando"),
  }[status];

  return (
    <main className="min-h-screen bg-[#eeeeec] text-[#1f2220]">
      <div className="mx-auto max-w-[1540px] px-4 py-8 sm:px-8">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.19em] text-[#737776]">
              RENTO CAMPO / V2 · {t("EVOLUCIÓN", "EVOLUÇÃO")}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("Inteligencia territorial", "Inteligência territorial")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5d6260]">
              {t(
                "Explorá la distribución estimada de propiedades del suelo. Este módulo experimental prepara la evolución hacia mapas de aptitud productiva y demanda verificada.",
                "Explore a distribuição estimada das propriedades do solo. Este módulo experimental prepara mapas de aptidão produtiva e demanda verificada.",
              )}
            </p>
          </div>
          <Link href="/campos/mapa" className="rounded-lg border border-[#c6c9c5] bg-white px-4 py-2 text-sm font-medium hover:bg-[#e5e5e3]">
            {t("← Volver al mapa de campos", "← Voltar ao mapa de terras")}
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[#d5d6d2] bg-[#fafaf9] p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t("Capas territoriales", "Camadas territoriais")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#656965]">
              {t("Vista preliminar; los datos no son mediciones de campo.", "Visualização preliminar; os dados não são medições de campo.")}
            </p>

            <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-[#5c625e]" htmlFor="territory-country">
              {t("País", "País")}
            </label>
            <select
              id="territory-country"
              value={country}
              onChange={(event) => setCountry(event.target.value as CountryCode)}
              className="mt-2 w-full rounded-lg border border-[#bfc2be] bg-white p-3 text-sm"
            >
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>{COUNTRIES[code].name}</option>
              ))}
            </select>

            <div className="mt-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5c625e]">
                {t("Propiedad del suelo", "Propriedade do solo")}
              </h3>
              <div className="grid gap-2" role="group" aria-label={t("Seleccionar capa de suelo", "Selecionar camada de solo")}>
                {(Object.keys(SOIL) as SoilKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={soil === key}
                    onClick={() => setSoil(key)}
                    className={"rounded-lg border px-3 py-3 text-left text-sm transition-colors " + (soil === key ? "border-[#292d2a] bg-[#292d2a] text-white" : "border-[#d4d5d0] bg-white text-[#2d312e] hover:bg-[#e9e9e6]")}
                  >
                    <span className="block font-semibold">{pt ? SOIL[key].titlePt : SOIL[key].title}</span>
                    <span className={"mt-1 block text-xs " + (soil === key ? "text-[#d5d7d4]" : "text-[#747874]")}>
                      {pt ? SOIL[key].descriptionPt : SOIL[key].description}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={soil === "none"}
                  onClick={() => setSoil("none")}
                  className={"rounded-lg border px-3 py-2 text-left text-sm " + (soil === "none" ? "border-[#292d2a] bg-[#292d2a] text-white" : "border-[#d4d5d0] bg-white")}
                >
                  {t("Solo mapa base", "Somente mapa base")}
                </button>
              </div>
            </div>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-[#5c625e]" htmlFor="territory-depth">
              {t("Profundidad estimada", "Profundidade estimada")}
            </label>
            <select
              id="territory-depth"
              value={depth}
              disabled={soil === "none"}
              onChange={(event) => setDepth(event.target.value as Depth)}
              className="mt-2 w-full rounded-lg border border-[#bfc2be] bg-white p-3 text-sm disabled:opacity-50"
            >
              <option value="0-5cm">0–5 cm</option>
              <option value="5-15cm">5–15 cm</option>
            </select>

            <div className="mt-6 border-t border-[#dedfdb] pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5c625e]">
                {t("Próxima etapa", "Próxima etapa")}
              </p>
              <p className="mt-2 text-sm font-semibold">{t("Demanda productiva por zona", "Demanda produtiva por zona")}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#676b66]">
                {t("Pendiente de integrar señales de demanda reales, con fuente y fecha. No mostramos zonas calientes simuladas.", "Aguardando sinais de demanda reais, com fonte e data. Sem zonas quentes simuladas.")}
              </p>
            </div>
          </aside>

          <section className="relative min-h-[500px] overflow-hidden rounded-2xl border border-[#d0d2cf] bg-[#d9dbd9] shadow-sm" aria-label={t("Mapa territorial", "Mapa territorial")}>
            <div ref={mapDiv} className="absolute inset-0 h-full w-full" />
            {mapError && (
              <div role="alert" className="absolute inset-0 flex items-center justify-center bg-[#eeeeec] p-8 text-center text-sm">
                {t("No pudimos cargar el mapa interactivo. Probá abrir el mapa de campos.", "Não foi possível carregar o mapa interativo. Abra o mapa de terras.")}
              </div>
            )}
            <div role="status" aria-live="polite" className="absolute bottom-4 left-4 right-4 z-[400] rounded-lg border border-[#d6d8d5] bg-white/95 px-4 py-3 text-xs text-[#424742] shadow-sm sm:right-auto sm:max-w-[340px]">
              <strong className="mb-1 block">{statusText}</strong>
              {soil !== "none" && (
                <span>
                  {pt ? SOIL[soil].titlePt : SOIL[soil].title} · {depth.replace("-", "–")} · {SOIL[soil].unit}
                </span>
              )}
              {point && (
                <span className="mt-2 block border-t border-[#ddd] pt-2">
                  {t("Punto seleccionado", "Ponto selecionado")}: {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                  <br />
                  {t("Informe por parcela: aún no disponible.", "Relatório por parcela: ainda indisponível.")}
                </span>
              )}
            </div>
          </section>
        </div>

        <p className="mt-5 max-w-5xl text-xs leading-relaxed text-[#666b67]">
          {t(
            "Fuente: ISRIC SoilGrids (CC BY 4.0), resolución nominal 250 m. Los valores son predicciones de modelos, no análisis de laboratorio ni diagnóstico de aptitud de un campo. La disponibilidad de WMS depende del proveedor. No se ha integrado todavía un motor de IA generativa ni un índice de demanda.",
            "Fonte: ISRIC SoilGrids (CC BY 4.0), resolução nominal de 250 m. São previsões de modelos, não análises laboratoriais nem diagnóstico de aptidão de uma propriedade. A disponibilidade WMS depende do provedor. Ainda não há motor de IA generativa nem índice de demanda.",
          )}{" "}
          <a className="underline underline-offset-2" href="https://docs.isric.org/globaldata/soilgrids/" target="_blank" rel="noopener noreferrer">
            {t("Documentación SoilGrids", "Documentação SoilGrids")}
          </a>.
        </p>
      </div>
    </main>
  );
}
