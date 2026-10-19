import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const dictionary = read("lib/i18n/messages.ts");
const navbar = read("components/layout/Navbar.tsx");
const hero = read("components/landing/LandingTriptychHero.tsx");
const css = read("styles/landing-triptych-refinements.css");
const fieldForm = read("components/campos/CampoForm.tsx");
const serviceForm = read("components/servicios/ServicioRuralForm.tsx");
const plans = read("components/planes/PlanesTierra.tsx");
const map = read("components/campos/CampoMapa.tsx");

test("pt-BR and Spanish catalogs have matching message keys", () => {
  const es = dictionary.match(/export const es = (\{[\s\S]*?\}) as const;/);
  const br = dictionary.match(/export const ptBR: Record<MessageKey,string> = (\{[\s\S]*?\});/);
  assert.ok(es && br, "Translation dictionaries must be declared");
  const esData = JSON.parse(es[1]);
  const brData = JSON.parse(br[1]);
  assert.deepEqual(Object.keys(esData).sort(), Object.keys(brData).sort());
  assert.ok(Object.keys(esData).length >= 90);
  assert.equal(brData["auth.signIn"], "Entrar");
  assert.equal(brData["fields.available"], "Terras disponíveis");
});

test("hero has named actions on all cards, with country retained", () => {
  assert.match(hero, /VER CAMPOS/);
  assert.match(hero, /VER TERRAS/);
  assert.match(hero, /SOU PRODUTOR/);
  assert.match(hero, /VER SERVIÇOS/);
  assert.equal((hero.match(/triptychHero__panelCta/g) || []).length, 3);
  assert.match(hero, /<RegionalLink className="triptychHero__panel triptychHero__panel--fields" href="\/campos">/);
  assert.match(hero, /<RegionalLink className="triptychHero__panel triptychHero__panel--services" href="\/servicios-rurales">/);
  assert.match(css, /\.triptychHero__panelCta/);
});

test("country selection preserves current route and regional state", () => {
  assert.match(navbar, /destination\.searchParams\.set\("pais", country\)/);
  assert.match(navbar, /selectRegionalCountry\(country\)/);
  assert.ok(!navbar.includes('router.push(`/campos/mapa?pais='));
});

test("Brazil defaults BRL and Brazilian local map fallback", () => {
  assert.match(fieldForm, /moneda: initialCountry === "BR" \? "BRL"/);
  assert.match(fieldForm, /moneda: nextCountry === "BR" \? "BRL"/);
  assert.match(map, /countryCode === "BR"/);
  assert.match(map, /-74\.1%2C-34\.0%2C-34\.7%2C5\.3/);
});

test("Brazil remains blocked from the Argentine paid checkout", () => {
  assert.match(plans, /paidPlansEnabled = countryCode === "AR"/);
  assert.match(plans, /if \(!paidPlansEnabled\) return/);
  assert.match(plans, /Ainda indisponível/);
});

test("field and service forms have localized Brazilian labels", () => {
  assert.match(fieldForm, /Preço total estimado/);
  assert.match(fieldForm, /Anunciar terra/);
  assert.match(serviceForm, /Quais serviços você oferece/);
  assert.match(serviceForm, /Anunciar serviço/);
});
