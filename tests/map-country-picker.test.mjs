import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("the map country selector is shared by farmland and services", () => {
  const map = read("components/campos/CampoMapa.tsx");
  const tabs = map.indexOf('className="mapa-modos"');
  const selector = map.indexOf('className="mapa-pais-control"');
  const landConditional = map.indexOf('vista === "tierra" ? (', selector);
  assert.ok(tabs >= 0 && selector > tabs && landConditional > selector, "country picker must be below the two tabs and above mode-specific fields");
  assert.match(map, /COUNTRY_CODES_ALPHABETICAL\.map/);
  assert.match(map, /displayCountryName\(code, countryCode\)/);
  assert.match(map, /value=\{countryCode\}/);
  assert.match(map, /cambiarPais\(event\.target\.value as CountryCode\)/);
  assert.match(map, /selectRegionalCountry\(nuevoPais\)/);
  assert.match(map, /destino\.searchParams\.set\("vista", vista\)/);
  assert.match(map, /window\.history\.replaceState/);
  assert.match(map, /router\.refresh\(\)/);
  assert.match(map, /prestadores\.filter/);
  assert.match(map, /campos\.filter/);
});

test("web desktop, web mobile and Lite reuse the same regional map", () => {
  const server = read("app/(public)/campos/mapa/page.tsx");
  const mobile = read("styles/mapa.css");
  const liteFields = read("app/lite/campos/mapa/page.tsx");
  const liteServices = read("app/lite/servicios/mapa/page.tsx");
  assert.match(server, /\.eq\("country_code", selectedCountry\)/);
  assert.match(server, /initialCountry=\{selectedCountry\}/);
  assert.match(server, /key=\{selectedCountry\}/);
  assert.match(liteFields, /@\/app\/\(public\)\/campos\/mapa\/page/);
  assert.match(liteServices, /@\/app\/\(public\)\/campos\/mapa\/page/);
  assert.match(liteServices, /\.\.\.params, vista: params\.vista \?\? "servicios"/);
  assert.match(mobile, /\.mapa-pais-control select/);
  assert.match(mobile, /@media \(max-width: 640px\)[\s\S]*\.mapa-pais-control select/);
});
