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

  assert.match(catalog, /titulo:\s*tituloServicioRural\(p\.servicios_rurales, pais\)/);
  assert.match(catalog, /titulo:\s*tituloServicioRural\(item\.servicios_rurales, pais\)/);
  assert.match(catalog, /<h3 className="campo-card-pub-titulo">\{prestador\.titulo\}<\/h3>/);
  assert.doesNotMatch(catalog, /prestador\.nombre|ownerMap|from\("profiles"\)/);

  assert.match(mapPage, /titulo:\s*tituloServicioRural\(publicacion\.servicios_rurales, selectedCountry\)/);
  assert.match(mapPage, /titulo:\s*tituloServicioRural\(prestador\.servicios_rurales, selectedCountry\)/);
  assert.doesNotMatch(mapPage, /ownerMap|from\("profiles"\)/);
  assert.match(mapClient, /\{selectedServicio\.titulo\}/);
  assert.match(mapClient, /\`\$\{prestador\.titulo\}/);
  assert.doesNotMatch(mapClient, /selectedServicio\.nombre|prestador\.nombre/);

  assert.match(detail, /const tituloCorto = tituloServicioRural\(rubros, pais\)/);
  assert.match(detail, /<h1 className="ficha-titulo">\{tituloCorto\}<\/h1>/);
  assert.match(detail, /className="propietario-nombre">\{nombre\}/);
});
