"use client";

import { useMemo, useState } from "react";
import { BarChart3, Globe2, MapPinned, UsersRound, Wrench, TrendingUp } from "lucide-react";
import { COUNTRIES, isCountryCode } from "@/data/countries";

type CountryStats = {
  country: string;
  registrations: number;
  activeLands: number;
  activeServices: number;
};
type MonthStats = { month: string; registrations: number };
type Totals = { registrations: number; activeLands: number; activeServices: number };

function countryName(code: string) {
  return isCountryCode(code) ? COUNTRIES[code].name : code;
}
function countryFlag(code: string) {
  return isCountryCode(code) ? COUNTRIES[code].flag : "🌎";
}
function formatNumber(value: number) {
  return value.toLocaleString("es-AR");
}
function percent(value: number, max: number) {
  return max > 0 ? Math.min(100, Math.max(0, 100 * value / max)) : 0;
}

export default function GerencialExplorador({
  countries, months, totals,
}: {
  countries: CountryStats[];
  months: MonthStats[];
  totals: Totals;
}) {
  const [selected, setSelected] = useState("ALL");
  const sorted = useMemo(
    () => [...countries].sort((a,b) =>
      (b.registrations + b.activeLands + b.activeServices) -
      (a.registrations + a.activeLands + a.activeServices) ||
      countryName(a.country).localeCompare(countryName(b.country), "es")),
    [countries]
  );
  const current = countries.find((c) => c.country === selected);
  const all = selected === "ALL";
  const numbers = all ? totals : {
    registrations: current?.registrations ?? 0,
    activeLands: current?.activeLands ?? 0,
    activeServices: current?.activeServices ?? 0,
  };
  const activeCountries = sorted.filter((c) => c.registrations + c.activeLands + c.activeServices > 0);
  const inactiveCountries = sorted.filter((c) => c.registrations + c.activeLands + c.activeServices === 0);
  const maxCountry = Math.max(1, ...sorted.map((c) => c.registrations + c.activeLands + c.activeServices));
  const shownCountries = all ? activeCountries : current ? [current] : [];
  const progress = percent(totals.registrations, 1000);
  const countryShare = percent(current?.registrations ?? 0, totals.registrations);
  const ringValue = all ? progress : countryShare;
  const ringLabel = all ? "Avance hacia 1.000 registros" : "Participación en registros";
  const trend = months.reduce<{ month:string; total:number }[]>((acc,m) => {
    acc.push({ month:m.month, total:(acc.at(-1)?.total ?? 0) + m.registrations });
    return acc;
  },[]);
  const maxTrend = Math.max(1,...trend.map((m) => m.total));
  const points = trend.map((m,i) => ({
    ...m, x:42+(i*510)/Math.max(1,trend.length-1),
    y:157-(m.total/maxTrend)*115,
  }));
  const trendPath = points.map((p,i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const activity = numbers.registrations + numbers.activeLands + numbers.activeServices;

  return (
    <div className="rc-growth" aria-label="Panel visual gerencial">
      <div className="rc-growth__controls">
        <div className="rc-growth__heading">
          <span className="rc-growth__eyebrow"><Globe2 size={15} aria-hidden="true" /> Visión comercial</span>
          <h2>{all ? "Todos los países" : countryName(selected)}</h2>
          <p>{all ? "Resumen regional de las oportunidades reales." : "Actividad real de este mercado."}</p>
        </div>
        <label className="rc-growth__select">
          <span>País</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Seleccionar país del reporte">
            <option value="ALL">🌎 Todos los países</option>
            {countries.map((c) => (
              <option value={c.country} key={c.country}>{countryFlag(c.country)} {countryName(c.country)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="rc-growth__kpis">
        <div className="rc-growth__kpi">
          <span className="rc-growth__kpi-icon"><UsersRound size={21} aria-hidden="true" /></span>
          <span className="rc-growth__kpi-label">Registros</span>
          <strong>{formatNumber(numbers.registrations)}</strong>
          <small>Usuarios confirmados</small>
        </div>
        <div className="rc-growth__kpi">
          <span className="rc-growth__kpi-icon"><MapPinned size={21} aria-hidden="true" /></span>
          <span className="rc-growth__kpi-label">Campos</span>
          <strong>{formatNumber(numbers.activeLands)}</strong>
          <small>Publicaciones reales</small>
        </div>
        <div className="rc-growth__kpi">
          <span className="rc-growth__kpi-icon"><Wrench size={21} aria-hidden="true" /></span>
          <span className="rc-growth__kpi-label">Servicios</span>
          <strong>{formatNumber(numbers.activeServices)}</strong>
          <small>Oferta activa real</small>
        </div>
        <div className="rc-growth__kpi rc-growth__kpi--accent">
          <span className="rc-growth__kpi-icon"><Globe2 size={21} aria-hidden="true" /></span>
          <span className="rc-growth__kpi-label">{all ? "Países con actividad" : "Estado del mercado"}</span>
          <strong>{all ? formatNumber(activeCountries.length) : activity > 0 ? "Activo" : "0"}</strong>
          <small>{all ? `de ${countries.length} mercados` : activity > 0 ? "Tiene registros u oferta" : "Sin actividad registrada"}</small>
        </div>
      </div>

      <div className="rc-growth__visuals">
        <section className="rc-growth__panel rc-growth__panel--bars" aria-label="Actividad por país">
          <div className="rc-growth__panel-head">
            <div><span className="rc-growth__panel-kicker"><BarChart3 size={15} aria-hidden="true" /> Comparativo</span>
              <h3>{all ? "Actividad por país" : "Indicadores del país"}</h3>
            </div>
            {all && <small>{activeCountries.length} con actividad</small>}
          </div>
          <div className="rc-growth__legend" aria-hidden="true">
            <span><i className="rc-growth__legend-registrations" /> Registros</span>
            <span><i className="rc-growth__legend-lands" /> Campos</span>
            <span><i className="rc-growth__legend-services" /> Servicios</span>
          </div>
          <div className="rc-growth__bar-list">
            {shownCountries.length > 0 ? shownCountries.map((c) => {
              const count = c.registrations + c.activeLands + c.activeServices;
              return (
                <div key={c.country} className="rc-growth__bar-item">
                  <div className="rc-growth__bar-item-head">
                    <strong>{countryFlag(c.country)} {countryName(c.country)}</strong>
                    <span>{formatNumber(c.registrations)} / {formatNumber(c.activeLands)} / {formatNumber(c.activeServices)}</span>
                  </div>
                  <div className="rc-growth__stack" role="img"
                    aria-label={`${countryName(c.country)}: ${c.registrations} registros, ${c.activeLands} campos, ${c.activeServices} servicios`}>
                    <div className="rc-growth__stack-registrations" style={{ width: `${100*c.registrations/maxCountry}%` }}/>
                    <div className="rc-growth__stack-lands" style={{ width: `${100*c.activeLands/maxCountry}%` }}/>
                    <div className="rc-growth__stack-services" style={{ width: `${100*c.activeServices/maxCountry}%` }}/>
                  </div>
                  {count === 0 && <small>Sin actividad</small>}
                </div>
              );
            }) : (
              <p className="rc-growth__no-data">Todavía no hay actividad registrada en esta selección.</p>
            )}
          </div>
          {all && inactiveCountries.length > 0 && (
            <details className="rc-growth__zero-markets">
              <summary>{inactiveCountries.length} países sin actividad <span>Ver países</span></summary>
              <div className="rc-growth__zero-grid">
                {inactiveCountries.map((c) =>
                  <span key={c.country}>{countryFlag(c.country)} {countryName(c.country)}</span>)}
              </div>
            </details>
          )}
        </section>
        <section className="rc-growth__panel rc-growth__panel--progress" aria-label="Indicadores de avance">
          <div className="rc-growth__panel-head">
            <div>
              <span className="rc-growth__panel-kicker"><TrendingUp size={15} aria-hidden="true" /> Objetivo</span>
              <h3>{ringLabel}</h3>
            </div>
          </div>
          <div className="rc-growth__ring-wrap">
            <div className="rc-growth__ring" style={{ background:`conic-gradient(#315e7d 0% ${ringValue}%, #e1e9ef ${ringValue}% 100%)` }}>
              <div className="rc-growth__ring-inside">
                <strong>{ringValue.toLocaleString("es-AR",{maximumFractionDigits:1})}%</strong>
                <small>{all ? "meta" : "del total"}</small>
              </div>
            </div>
          </div>
          <p className="rc-growth__ring-caption">
            {all ? `${formatNumber(totals.registrations)} de 1.000 registros` :
              `${formatNumber(numbers.registrations)} de ${formatNumber(totals.registrations)} registros globales`}
          </p>
        </section>
      </div>

      {all && (
        <section className="rc-growth__panel rc-growth__trend">
          <div className="rc-growth__panel-head">
            <div>
              <span className="rc-growth__panel-kicker"><TrendingUp size={15} aria-hidden="true" /> Evolución</span>
              <h3>Registros · últimos 6 meses</h3>
            </div>
            <small>Todos los países</small>
          </div>
          {trend.length ? (
            <svg className="rc-growth__line" viewBox="0 0 590 192" role="img" aria-label="Evolución acumulada de registros en la ventana de seis meses">
              <path d="M42 157 H552" stroke="#dce5eb" strokeWidth="1" fill="none"/>
              <path d={trendPath} stroke="#315e7d" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
              {points.map((p) => <g key={p.month}>
                <circle cx={p.x} cy={p.y} r="4" fill="#315e7d"/>
                <text x={p.x} y={p.y-13} textAnchor="middle" fontSize="12" fill="#14354e">{p.total}</text>
                <text x={p.x} y="178" textAnchor="middle" fontSize="11" fill="#72899b">{p.month.slice(5)}</text>
              </g>)}
            </svg>
          ) : <p className="rc-growth__no-data">Sin evolución disponible.</p>}
          <p className="rc-growth__note">Acumulado en los seis meses visibles; no representa el total histórico.</p>
        </section>
      )}
      <p className="rc-growth__footnote">Información real, sin perfiles ni publicaciones DEMO. Los contactos todavía no están instrumentados en este tablero.</p>
    </div>
  );
}
