"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, getCountrySubdivisions, type CountryCode } from "@/data/countries";
import { useTranslations } from "@/lib/i18n/useTranslations";

interface Props {
  filtrosActivos: Record<string, string | undefined>;
}

const APTITUDES = [
  { value: "", label: "Todas" },
  { value: "agricola", label: "Agrícola" },
  { value: "ganadera", label: "Ganadera" },
  { value: "mixta", label: "Mixta" },
  { value: "forestal", label: "Forestal" },
  { value: "otro", label: "Otro" },
];

const DISPONIBILIDADES = [
  { value: "", label: "Cualquiera" },
  { value: "inmediata", label: "Inmediata" },
  { value: "campaña_próxima", label: "Campaña próxima" },
  { value: "a_convenir", label: "A convenir" },
];

export default function CampoFiltros({ filtrosActivos }: Props) {
  const {t,country}=useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const [filtros, setFiltros] = useState({
    pais: (filtrosActivos.pais ?? "AR") as CountryCode,
    operacion: filtrosActivos.operacion ?? "",
    provincia: filtrosActivos.provincia ?? "",
    aptitud: filtrosActivos.aptitud ?? "",
    disponibilidad: filtrosActivos.disponibilidad ?? "",
  });

  function aplicar() {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function limpiar() {
    setFiltros({
      pais: (filtrosActivos.pais ?? "AR") as CountryCode,
      operacion: "",
      provincia: "",
      aptitud: "",
      disponibilidad: "",
    });
    router.push(pathname);
  }

  const hayFiltros = Boolean(filtros.provincia || filtros.aptitud || filtros.disponibilidad || filtros.operacion);

  return (
    <div className="filtros-panel">
      <div className="filtros-header">
        <span className="filtros-title">{t("filters.title")}</span>
        {hayFiltros && (
          <button className="filtros-limpiar" onClick={limpiar}>
            {t("filters.clear")}
          </button>
        )}
      </div>

      <div className="filtro-grupo"><label className="filtro-label">{t("filters.country")}</label><select className="filtro-input" value={filtros.pais} onChange={(e) => setFiltros((p) => ({ ...p, pais: e.target.value as CountryCode, provincia: "" }))}>{COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}</select></div>
      <div className="filtro-grupo"><label className="filtro-label">{t("filters.operation")}</label><select className="filtro-input" value={filtros.operacion} onChange={(e) => setFiltros((p) => ({ ...p, operacion: e.target.value }))}><option value="">{t("filters.allFemale")}</option><option value="alquiler">{t("filters.rent")}</option><option value="venta">{t("filters.sale")}</option><option value="ambas">{t("filters.both")}</option></select></div>
      <div className="filtro-grupo">
        <label className="filtro-label">{COUNTRIES[filtros.pais].subdivisionLabel}</label>
        <select
          className="filtro-input"
          value={filtros.provincia}
          onChange={(e) =>
            setFiltros((p) => ({ ...p, provincia: e.target.value }))
          }
        >
          <option value="">{t("filters.allFemale")}</option>
          {getCountrySubdivisions(filtros.pais).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-grupo">
        <label className="filtro-label">{t("filters.aptitude")}</label>
        <div className="filtro-chips">
          {APTITUDES.map((a) => (
            <button
              key={a.value}
              className={`filtro-chip ${filtros.aptitud === a.value ? "active" : ""}`}
              onClick={() => setFiltros((p) => ({ ...p, aptitud: a.value }))}
            >
              {country==="BR"?({agricola:t("filters.agricultural"),ganadera:t("filters.livestock"),mixta:t("filters.mixed"),forestal:t("filters.forestry"),otro:t("filters.other")} as Record<string,string>)[a.value]??t("filters.allFemale"):a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filtro-grupo">
        <label className="filtro-label">{t("filters.availability")}</label>
        <select
          className="filtro-input"
          value={filtros.disponibilidad}
          onChange={(e) =>
            setFiltros((p) => ({ ...p, disponibilidad: e.target.value }))
          }
        >
          {DISPONIBILIDADES.map((d) => (
            <option key={d.value} value={d.value}>
              {country==="BR"?({inmediata:t("filters.immediate"),"campaña_próxima":t("filters.nextSeason"),a_convenir:t("filters.negotiable")} as Record<string,string>)[d.value]??t("filters.any"):d.label}
            </option>
          ))}
        </select>
      </div>

      <button className="listing-button listing-button-full" onClick={aplicar}>
        {t("filters.apply")}
      </button>
    </div>
  );
}
