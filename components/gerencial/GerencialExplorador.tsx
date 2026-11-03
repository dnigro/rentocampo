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
type MonthStats = { month: string; registrations: number; activeLands: number; activeServices: number };
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
  const [showAllCountries, setShowAllCountries] = useState(false);
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
  const maxRegistrations = Math.max(1, ...sorted.map((c) => c.registrations));
  const maxLands = Math.max(1, ...sorted.map((c) => c.activeLands));
  const maxServices = Math.max(1, ...sorted.map((c) => c.activeServices));
  const shownCountries = all
    ? (showAllCountries ? sorted : sorted.slice(0, Math.max(5, activeCountries.length)))
    : current ? [current] : [];
  const progress = percent(totals.registrations, 1000);
  const countryShare = percent(current?.registrations ?? 0, totals.registrations);
  const monthlyMax = Math.max(1, ...months.flatMap((m) => [m.registrations, m.activeLands, m.activeServices]));
  const metricMax = Math.max(1, numbers.registrations, numbers.activeLands, numbers.activeServices);
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
          <small>Cuentas externas con correo confirmado</small>
        </div>
        <div className="rc-growth__kpi">
          <span className="rc-growth__kpi-icon"><MapPinned size={21} aria-hidden="true" /></span>
          <span className="rc-growth__kpi-label">Campos publicados</span>
          <strong>{formatNumber(numbers.activeLands)}</strong>
          <small>Publicaciones activas, sin DEMO</small>
        </div>
        <div className="rc-growth__kpi">
          <span className="rc-growth__kpi-icon"><Wrench size={21} aria-hidden="true" /></span>
          <span className="rc-growth__kpi-label">Servicios publicados</span>
          <strong>{formatNumber(numbers.activeServices)}</strong>
          <small>Publicaciones activas, sin DEMO</small>
        </div>
        <div className="rc-growth__kpi rc-growth__kpi--accent">
          <span className="rc-growth__kpi-icon"><Globe2 size={21} aria-hidden="true" /></span>
          <span className="rc-growth__kpi-label">{all ? "Países con actividad" : "Estado del mercado"}</span>
          <strong>{all ? formatNumber(activeCountries.length) : activity > 0 ? "Activo" : "0"}</strong>
          <small>{all ? `de ${countries.length} mercados` : activity > 0 ? "Tiene registros u oferta" : "Sin actividad registrada"}</small>
        </div>
      </div>

      <div className="rc-growth__visuals">
        <section className="rc-growth__panel rc-growth__composition" aria-label="Comparación de indicadores comerciales">
          <div className="rc-growth__panel-head">
            <div>
              <span className="rc-growth__panel-kicker"><BarChart3 size={15} aria-hidden="true" /> Distribución comercial</span>
              <h3>Registros y publicaciones activas</h3>
            </div>
          </div>
          <p className="rc-growth__subnote">Comparación de cantidades; los registros son usuarios, los campos y servicios son publicaciones.</p>
          {([
            { name: "Registros", value: numbers.registrations, kind: "registrations" },
            { name: "Campos", value: numbers.activeLands, kind: "lands" },
            { name: "Servicios", value: numbers.activeServices, kind: "services" },
          ] as const).map((item) => (
            <div className="rc-growth__composition-row" key={item.kind}>
              <div className="rc-growth__composition-label"><span>{item.name}</span><strong>{formatNumber(item.value)}</strong></div>
              <div className="rc-growth__composition-track" role="img" aria-label={item.name + ": " + item.value}>
                <span className={"rc-growth__fill rc-growth__fill--" + item.kind} style={{ width: percent(item.value, metricMax) + "%" }} />
              </div>
            </div>
          ))}
        </section>
        <section className="rc-growth__panel rc-growth__goal" aria-label="Progreso y participación">
          <span className="rc-growth__panel-kicker"><TrendingUp size={15} aria-hidden="true" /> Meta comercial</span>
          <h3>{all ? "Objetivo: 1.000 registros" : "Peso del mercado"}</h3>
          <div className="rc-growth__goal-score">
            <strong>{(all ? progress : countryShare).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%</strong>
            <span>{all ? "de la meta" : "de los registros globales"}</span>
          </div>
          <div className="rc-growth__goal-track" role="progressbar"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={all ? progress : countryShare}>
            <span style={{ width: (all ? progress : countryShare) + "%" }} />
          </div>
          <div className="rc-growth__goal-meta">
            <span>{all ? formatNumber(totals.registrations) + " registrados" : formatNumber(numbers.registrations) + " del país"}</span>
            <strong>{all ? formatNumber(Math.max(0, 1000 - totals.registrations)) + " pendientes" : formatNumber(totals.registrations) + " globales"}</strong>
          </div>
        </section>
      </div>

      <section className="rc-growth__panel rc-growth__zebra" aria-label="Actividad por país en barras horizontales y filas alternadas">
        <div className="rc-growth__panel-head">
          <div>
            <span className="rc-growth__panel-kicker"><Globe2 size={15} aria-hidden="true" /> Mercados</span>
            <h3>Parque comercial por país</h3>
          </div>
          <small>{activeCountries.length} con actividad / {countries.length} países</small>
        </div>
        <div className="rc-growth__legend" aria-label="Referencias de color">
          <span><i className="rc-growth__legend-registrations" /> Registros</span>
          <span><i className="rc-growth__legend-lands" /> Campos</span>
          <span><i className="rc-growth__legend-services" /> Servicios</span>
        </div>
        <div className="rc-growth__zebra-list">
          {shownCountries.map((c, i) => {
            const total = c.registrations + c.activeLands + c.activeServices;
            return (
              <div className={"rc-growth__zebra-row" + (i % 2 ? " rc-growth__zebra-row--alt" : "") + (total > 0 ? " rc-growth__zebra-row--active" : "")} key={c.country}>
                <div className="rc-growth__zebra-name">
                  <strong>{countryFlag(c.country)} {countryName(c.country)}</strong>
                  <small>{total ? "Con actividad" : "Sin actividad registrada"}</small>
                </div>
                <div className="rc-growth__zebra-bars">
                  {([
                    { label: "Registros", value: c.registrations, kind: "registrations", max: maxRegistrations },
                    { label: "Campos", value: c.activeLands, kind: "lands", max: maxLands },
                    { label: "Servicios", value: c.activeServices, kind: "services", max: maxServices },
                  ] as const).map((m) => (
                    <div key={m.kind} className="rc-growth__zebra-metric">
                      <span className="rc-growth__zebra-metric-label">{m.label}</span>
                      <div className="rc-growth__zebra-track" role="img" aria-label={m.label + ": " + m.value}>
                        <span className={"rc-growth__fill rc-growth__fill--" + m.kind} style={{ width: percent(m.value, m.max) + "%" }} />
                      </div>
                      <strong>{formatNumber(m.value)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {all && shownCountries.length < sorted.length && (
          <button className="rc-growth__expand" type="button" onClick={() => setShowAllCountries(true)}>
            Ver los {sorted.length} países · {inactiveCountries.length} sin actividad
          </button>
        )}
        {all && showAllCountries && sorted.length > 5 && (
          <button className="rc-growth__expand" type="button" onClick={() => setShowAllCountries(false)}>Mostrar vista resumida</button>
        )}
      </section>

      {all && (
        <section className="rc-growth__panel rc-growth__monthly">
          <div className="rc-growth__panel-head">
            <div>
              <span className="rc-growth__panel-kicker"><TrendingUp size={15} aria-hidden="true" /> Evolución</span>
              <h3>Altas · últimos seis meses</h3>
            </div>
            <small>Todos los países</small>
          </div>
          <div className="rc-growth__legend" aria-hidden="true">
            <span><i className="rc-growth__legend-registrations" /> Registros</span>
            <span><i className="rc-growth__legend-lands" /> Campos</span>
            <span><i className="rc-growth__legend-services" /> Servicios</span>
          </div>
          <div className="rc-growth__monthly-chart" role="img" aria-label="Barras verticales de altas de registros y publicaciones activas por mes">
            {months.map((m) => (
              <div className="rc-growth__monthly-group" key={m.month}>
                <div className="rc-growth__monthly-columns">
                  {([
                    { label: "Registros", value: m.registrations, kind: "registrations" },
                    { label: "Campos", value: m.activeLands, kind: "lands" },
                    { label: "Servicios", value: m.activeServices, kind: "services" },
                  ] as const).map((v) => (
                    <div key={v.kind} className={"rc-growth__monthly-column rc-growth__fill--" + v.kind}
                      style={{ height: (v.value ? Math.max(6, (100 * v.value) / monthlyMax) : 0) + "%" }}
                      title={m.month + " · " + v.label + ": " + v.value} />
                  ))}
                </div>
                <strong>{m.month.slice(5)}</strong>
              </div>
            ))}
          </div>
          <p className="rc-growth__subnote">Altas según fecha de creación. Campos y servicios: sólo publicaciones que siguen activas; no es el histórico de bajas.</p>
          <details className="rc-growth__monthly-detail">
            <summary>Ver valores exactos por mes</summary>
            <div className="rc-growth__monthly-table-wrap">
              <table className="rc-growth__monthly-table">
                <thead><tr><th>Mes</th><th>Registros</th><th>Campos</th><th>Servicios</th></tr></thead>
                <tbody>{months.map((m) => <tr key={m.month}>
                  <td>{m.month}</td><td>{m.registrations}</td><td>{m.activeLands}</td><td>{m.activeServices}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </details>
        </section>
      )}
      <p className="rc-growth__footnote">Registros con correo confirmado y perfil. Campos y servicios publicados activos, sin DEMO ni cuentas internas. Visitas y chats no conectados; no se muestran estimaciones.</p>
    </div>
  );
}
