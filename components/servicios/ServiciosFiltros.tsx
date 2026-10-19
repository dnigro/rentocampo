"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, COUNTRY_CODES, getCountrySubdivisions, type CountryCode } from "@/data/countries";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import { useTranslations } from "@/lib/i18n/useTranslations";

interface Props {
  paisInicial?: CountryCode;
  provinciaInicial?: string;
  servicioInicial?: string;
}

export default function ServiciosFiltros({
  paisInicial = "AR",
  provinciaInicial = "",
  servicioInicial = "",
}: Props) {
  const {t} = useTranslations();
  const router = useRouter();
  const [pais, setPais] = useState<CountryCode>(paisInicial);
  const [provincia, setProvincia] = useState(provinciaInicial);
  const [servicio, setServicio] = useState(servicioInicial);

  function aplicar() {
    const params = new URLSearchParams();
    params.set("pais", pais);
    if (provincia) params.set("provincia", provincia);
    if (servicio) params.set("servicio", servicio);
    const query = params.toString();
    router.push(query ? `/servicios-rurales?${query}` : "/servicios-rurales");
  }

  function limpiar() {
    setProvincia("");
    setServicio("");
    router.push(`/servicios-rurales?pais=${pais}`);
  }

  const hayFiltros = Boolean(provincia || servicio);

  return (
    <div>
      <div className="filtros-panel">
        <div className="filtros-header">
          <span className="filtros-title">{t("filters.title")}</span>
          {hayFiltros && (
            <button type="button" className="filtros-limpiar" onClick={limpiar}>
              {t("filters.clear")}
            </button>
          )}
        </div>

        <div className="listing-filters-grid">
          <div className="filtro-grupo"><label className="filtro-label" htmlFor="servicios-pais">{t("filters.country")}</label><select id="servicios-pais" className="filtro-input" value={pais} onChange={(e) => { setPais(e.target.value as CountryCode); setProvincia(""); }}>{COUNTRY_CODES.map((code) => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}</select></div>
          <div className="filtro-grupo">
            <label className="filtro-label" htmlFor="servicios-provincia">
              {COUNTRIES[pais].subdivisionLabel}
            </label>
            <select
              id="servicios-provincia"
              className="filtro-input"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
            >
              <option value="">{t("filters.allFemale")}</option>
              {getCountrySubdivisions(pais).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label" htmlFor="servicios-rubro">
              {t("filters.category")}
            </label>
            <select
              id="servicios-rubro"
              className="filtro-input"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
            >
              <option value="">{t("filters.allCategories")}</option>
              {SERVICIOS_RURALES.filter((item) => item.value !== "otro").map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="listing-button listing-button-full"
            onClick={aplicar}
          >
            {t("filters.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
