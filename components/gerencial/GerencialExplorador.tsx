"use client";

import { useMemo, useState } from "react";
import { BarChart3, Globe2, MapPinned, TrendingUp, UsersRound, Wrench, Target, ShieldCheck } from "lucide-react";
import { COUNTRIES, isCountryCode } from "@/data/countries";

type CountryStats = {
  country: string;
  registrations: number;
  activeLands: number;
  activeServices: number;
};
type MonthStats = { month: string; registrations: number; activeLands: number; activeServices: number };
type Totals = { registrations: number; activeLands: number; activeServices: number };
type Panel = "resumen" | "mercados";

const format = (value: number) => value.toLocaleString("es-AR");
const nameOf = (code: string) => isCountryCode(code) ? COUNTRIES[code].name : code;
const flagOf = (code: string) => isCountryCode(code) ? COUNTRIES[code].flag : "🌎";
const totalOf = (row: CountryStats) => row.registrations + row.activeLands + row.activeServices;
const goal = 1000;

export default function GerencialExplorador({
  countries, months, totals, updatedAt,
}: {
  countries: CountryStats[];
  months: MonthStats[];
  totals: Totals;
  updatedAt: string;
}) {
  const [panel, setPanel] = useState<Panel>("resumen");
  const [countryCode, setCountryCode] = useState("ALL");

  const ordered = useMemo(() =>
    [...countries].sort((a, b) => totalOf(b) - totalOf(a) ||
      nameOf(a.country).localeCompare(nameOf(b.country), "es")),
    [countries],
  );
  const active = ordered.filter((c) => totalOf(c) > 0);
  const country = countryCode === "ALL"
    ? (active[0] ?? ordered[0])
    : ordered.find((c) => c.country === countryCode);
  const shown: CountryStats = country ?? { country: "AR", registrations: 0, activeLands: 0, activeServices: 0 };

  const activeCount = active.length;
  const inactiveCount = countries.length - activeCount;
  const publicationTotal = totals.activeLands + totals.activeServices;
  const progress = Math.min(100, (totals.registrations / goal) * 100);
  const remaining = Math.max(0, goal - totals.registrations);
  const selectedSum = totalOf(shown);
  const recentMonths = months.slice(-3);
  const maxMonth = Math.max(1, ...recentMonths.map((m) => m.registrations));

  const cards = [
    { label: "Registros", value: totals.registrations, description: "Correos confirmados", Icon: UsersRound },
    { label: "Campos", value: totals.activeLands, description: "Publicaciones activas", Icon: MapPinned },
    { label: "Servicios", value: totals.activeServices, description: "Publicaciones activas", Icon: Wrench },
    { label: "Países con actividad", value: activeCount, description: "De " + countries.length + " mercados", Icon: Globe2, featured: true },
  ];

  return (
    <div className="rc-decision" aria-label="Panel de decisión de RentoCampo">
      <header className="rc-decision__header">
        <div>
          <span className="rc-decision__eyebrow">RentoCampo · Growth 360°</span>
          <h1>Reporte gerencial</h1>
          <p>Actividad comercial real · actualizado {new Date(updatedAt).toLocaleString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires", dateStyle: "short", timeStyle: "short"
          })}</p>
        </div>
        <span className="rc-decision__private"><ShieldCheck size={15} aria-hidden="true" /> Privado</span>
      </header>

      <div className="rc-decision__tabs" role="tablist" aria-label="Secciones del reporte">
        <button type="button" role="tab" id="rc-decision-tab-summary"
          aria-selected={panel === "resumen"} aria-controls="rc-decision-summary"
          onClick={() => setPanel("resumen")}>Resumen</button>
        <button type="button" role="tab" id="rc-decision-tab-markets"
          aria-selected={panel === "mercados"} aria-controls="rc-decision-markets"
          onClick={() => setPanel("mercados")}>Análisis comercial</button>
      </div>

      {panel === "resumen" ? (
        <section className="rc-decision__view" id="rc-decision-summary" role="tabpanel"
          aria-labelledby="rc-decision-tab-summary">
          <div className="rc-decision__view-heading">
            <div><span className="rc-decision__kicker"><BarChart3 size={15} /> TABLERO</span>
              <h2>Estado del negocio</h2></div>
            <span className="rc-decision__small-pill">{activeCount} / {countries.length} países</span>
          </div>
          <div className="rc-decision__kpis">
            {cards.map(({label,value,description,Icon,featured}) => (
              <div key={label} className={"rc-decision__kpi" + (featured ? " rc-decision__kpi--featured" : "")}>
                <div className="rc-decision__kpi-top">
                  <span className="rc-decision__icon"><Icon size={23} strokeWidth={1.9} aria-hidden="true" /></span>
                  <strong>{format(value)}</strong>
                </div>
                <span className="rc-decision__kpi-title">{label}</span>
                <small>{description}</small>
              </div>
            ))}
          </div>
          <div className="rc-decision__data-note"><ShieldCheck size={17} aria-hidden="true" />
            Sin cuentas internas ni publicaciones DEMO. Registros y publicaciones son unidades distintas.
          </div>
          <div className="rc-decision__mini-trend">
            <div className="rc-decision__mini-head">
              <div><span className="rc-decision__kicker"><TrendingUp size={15} /> EVOLUCIÓN</span>
                <h3>Nuevos registros por mes</h3></div>
              <small>Últimos 3 meses</small>
            </div>
            <div className="rc-decision__mini-bars" role="img"
              aria-label={"Altas mensuales: " + recentMonths.map((m) => m.month + ": " + m.registrations).join(", ")}>
              {recentMonths.map((m) => (
                <div className="rc-decision__mini-month" key={m.month}>
                  <strong>{m.registrations}</strong>
                  <div className="rc-decision__mini-track">
                    <span style={{ height: (m.registrations ? Math.max(10, m.registrations / maxMonth * 100) : 0) + "%" }} />
                  </div>
                  <small>{new Date(m.month + "-01T12:00:00Z").toLocaleDateString("es-AR", {
                    month: "short", timeZone: "UTC"
                  })}</small>
                </div>
              ))}
            </div>
          </div>
          <p className="rc-decision__source">Fuente: Supabase producción · Sólo lectura · Visitas y chats aún sin medición conectada.</p>
        </section>
      ) : (
        <section className="rc-decision__view rc-decision__view--markets" id="rc-decision-markets"
          role="tabpanel" aria-labelledby="rc-decision-tab-markets">
          <div className="rc-decision__view-heading">
            <div><span className="rc-decision__kicker"><Globe2 size={15} /> MERCADOS</span>
              <h2>Comparativo por país</h2></div>
            <span className="rc-decision__small-pill">{activeCount} con actividad</span>
          </div>
          <label className="rc-decision__country-picker">
            <span>País</span>
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              <option value="ALL">🌎 Principal mercado activo</option>
              {countries.map((c) => (
                <option key={c.country} value={c.country}>{flagOf(c.country)} {nameOf(c.country)}</option>
              ))}
            </select>
          </label>

          <div className="rc-decision__country-card">
            <div className="rc-decision__country-title">
              <strong>{flagOf(shown.country)} {nameOf(shown.country)}</strong>
              <span>{selectedSum > 0 ? "Con actividad" : "Sin actividad"}</span>
            </div>
            <div className="rc-decision__country-track" role="img"
              aria-label={nameOf(shown.country) + ": " + shown.registrations + " registros, " + shown.activeLands + " campos y " + shown.activeServices + " servicios"}>
              <span className="rc-decision__piece rc-decision__piece--registrations"
                style={{ width: (selectedSum ? shown.registrations / selectedSum * 100 : 0) + "%" }} />
              <span className="rc-decision__piece rc-decision__piece--lands"
                style={{ width: (selectedSum ? shown.activeLands / selectedSum * 100 : 0) + "%" }} />
              <span className="rc-decision__piece rc-decision__piece--services"
                style={{ width: (selectedSum ? shown.activeServices / selectedSum * 100 : 0) + "%" }} />
            </div>
            <div className="rc-decision__country-figures">
              <div><i className="rc-decision__dot rc-decision__dot--registrations" /><strong>{format(shown.registrations)}</strong><span>Registros</span></div>
              <div><i className="rc-decision__dot rc-decision__dot--lands" /><strong>{format(shown.activeLands)}</strong><span>Campos</span></div>
              <div><i className="rc-decision__dot rc-decision__dot--services" /><strong>{format(shown.activeServices)}</strong><span>Servicios</span></div>
            </div>
          </div>

          <div className="rc-decision__goal">
            <div className="rc-decision__goal-head"><TrendingUp size={17} aria-hidden="true" />
              <h3>Avance global a 1.000 registros</h3></div>
            <div className="rc-decision__goal-content">
              <div className="rc-decision__donut"
                style={{ background: "conic-gradient(#285879 " + progress + "%, #e1eaf0 0)" }}
                role="img" aria-label={progress.toLocaleString("es-AR", { maximumFractionDigits: 1 }) + "% de la meta"}>
                <div><strong>{progress.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%</strong><small>meta</small></div>
              </div>
              <div className="rc-decision__goal-right">
                <span>Faltan</span><strong>{format(remaining)}</strong>
                <small>para alcanzar la meta</small>
              </div>
            </div>
            <p>{format(totals.registrations)} de 1.000 registros confirmados</p>
          </div>
          <div className="rc-decision__priority">
            <Target size={25} strokeWidth={1.7} aria-hidden="true" />
            <div><strong>Prioridad comercial</strong>
              <span>Captar campos reales y sumar servicios activos.</span></div>
          </div>
          <p className="rc-decision__markets-note">{inactiveCount} países sin actividad. Seleccionalos en el filtro para ver sus indicadores. Oferta activa total: {format(publicationTotal)} publicaciones.</p>
        </section>
      )}
    </div>
  );
}
