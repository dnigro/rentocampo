import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public service cards show the publication activity, never the profile name", () => {
  const catalog = read("app/(public)/servicios-rurales/page.tsx");
  const mapPage = read("app/(public)/campos/mapa/page.tsx");
  const mapClient = read("components/campos/CampoMapa.tsx");
  const detail = read("app/(public)/servicios-rurales/[id]/page.tsx");
  const taxonomy = read("data/servicios-rurales.ts");

  assert.match(taxonomy, /export function tituloServicioRural\(/);
  assert.match(taxonomy, /slice\(0, 2\).*servicioLabel/);
  assert.match(taxonomy, /"Serviço rural".*"Rural service".*"Servicio rural"/);

  assert.match(catalog, /titulo:\s*tituloServicioRural\(p\.servicios_rurales, pais, p\.nombre_comercial\)/);
  assert.match(catalog, /titulo:\s*tituloServicioRural\(item\.servicios_rurales, pais\)/);
  assert.match(catalog, /<h3 className="campo-card-pub-titulo">\{prestador\.titulo\}<\/h3>/);
  assert.doesNotMatch(catalog, /prestador\.nombre|ownerMap|from\("profiles"\)/);

  assert.match(mapPage, /titulo:\s*tituloServicioRural\(publicacion\.servicios_rurales, selectedCountry, publicacion\.nombre_comercial\)/);
  assert.match(mapPage, /titulo:\s*tituloServicioRural\(prestador\.servicios_rurales, selectedCountry\)/);
  assert.doesNotMatch(mapPage, /ownerMap|from\("profiles"\)/);
  assert.match(mapClient, /\{selectedServicio\.titulo\}/);
  assert.match(mapClient, /\`\$\{prestador\.titulo\}/);
  assert.doesNotMatch(mapClient, /selectedServicio\.nombre|prestador\.nombre/);

  assert.match(detail, /const tituloCorto = tituloServicioRural\(rubros, pais, publicacion\?\.nombre_comercial\)/);
  assert.match(detail, /<h1 className="ficha-titulo">\{tituloCorto\}<\/h1>/);
  assert.match(detail, /className="propietario-nombre">\{nombre\}/);
});

test("public listing title is mandatory for new service publications while legacy fallback stays", () => {
  const form = read("components/servicios/ServicioRuralForm.tsx");
  const catalog = read("app/(public)/servicios-rurales/page.tsx");
  const mapPage = read("app/(public)/campos/mapa/page.tsx");
  const detail = read("app/(public)/servicios-rurales/[id]/page.tsx");
  const admin = read("components/servicios/MisServiciosLista.tsx");
  const adminPage = read("app/(dashboard)/mis-servicios-rurales/page.tsx");
  const lite = read("components/lite/LiteServiciosListado.tsx");
  const liteDetail = read("app/lite/servicios/[id]/page.tsx");
  const taxonomy = read("data/servicios-rurales.ts");
  const migration = read("supabase/migrations/20261103222252_nombre_comercial_opcional_servicios.sql");

  assert.match(migration, /add column if not exists nombre_comercial varchar\(100\)/i);
  assert.match(form, /Título de la publicación/);
  assert.match(form, /nombreComercial\.trim\(\)\.length < 5/);
  assert.match(form, /required\s+aria-describedby="servicio-nombre-ayuda"/);
  assert.doesNotMatch(form, /Nombre comercial del servicio \(opcional\)/);
  assert.match(form, /maxLength=\{titleMax\}/);
  assert.match(form, /value=\{nombreComercial\}/);
  assert.match(form, /nombre_comercial: nombreComercial\.trim\(\)/);
  assert.match(form, /nombre_comercial\?: string \| null/);
  assert.match(taxonomy, /const nombre = nombreComercial\?\.trim\(\)/);
  assert.match(taxonomy, /if \(nombre\) return nombre/);

  for (const file of [catalog, mapPage, detail, adminPage, lite, liteDetail]) {
    assert.match(file, /nombre_comercial/);
  }
  assert.match(admin, /tituloServicioRural\(rubros,country,pub\.nombre_comercial\)/);
  assert.match(lite, /tituloServicioRural\(s\.servicios_rurales as ServicioRural\[\],pais,s\.nombre_comercial\)/);
  assert.match(liteDetail, /tituloServicioRural\(s\.servicios_rurales as ServicioRural\[\],s\.country_code,s\.nombre_comercial\)/);
  assert.match(detail, /name: tituloCorto/);
});

test("service groups retain all original service IDs without duplicates", () => {
  const source = read("data/servicios-rurales.ts");
  const start = source.indexOf("export const SERVICIO_GRUPOS:");
  const end = source.indexOf("export function servicioGrupoLabel", start);
  const grouped = [...source.slice(start, end).matchAll(/values:\s*\[([^\]]+)\]/g)]
    .flatMap(m => [...m[1].matchAll(/"([a-z_]+)"/g)].map(x => x[1]));
  const registered = [...source.matchAll(/\{ value: "([a-z_]+)", label:/g)].map(x => x[1]);
  assert.deepEqual([...grouped].sort(), [...registered].sort());
  assert.equal(new Set(grouped).size, grouped.length);
});

test("publication forms have a single consistent return button to their own listing", () => {
  const nav = read("components/layout/DashboardReturn.tsx");
  const newField = read("app/(dashboard)/mis-campos/nuevo/page.tsx");
  const editField = read("app/(dashboard)/mis-campos/[id]/editar/page.tsx");
  const newService = read("app/(dashboard)/mis-servicios-rurales/nuevo/page.tsx");
  const editService = read("app/(dashboard)/mis-servicios-rurales/[id]/editar/page.tsx");

  assert.match(nav, /pathname === "\/mis-campos\/nuevo"/);
  assert.match(nav, /pathname === "\/mis-servicios-rurales\/nuevo"/);
  assert.match(nav, /"\/mis-campos"/);
  assert.match(nav, /"\/mis-servicios-rurales"/);
  assert.match(nav, /Volver a Mis campos/);
  assert.match(nav, /Volver a Mis servicios rurales/);
  assert.match(nav, /className="rc-dashboard-return-btn"/);
  for (const page of [newField, editField, newService, editService]) {
    assert.doesNotMatch(page, /className="(?:page-back|back-link)"/);
  }
});
