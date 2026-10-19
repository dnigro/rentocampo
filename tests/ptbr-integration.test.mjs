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
  assert.ok(!hero.includes('aria-hidden="true">→</span>'), "Hero buttons must not show arrows");
  assert.ok(!hero.includes("triptychHero__panelArrow"), "Legacy arrow-only labels must stay removed");
});

test("country selection preserves current route and regional state", () => {
  assert.match(navbar, /selectRegionalCountry\(country\)/);
  assert.ok(!navbar.includes('router.push(`/campos/mapa?pais='));
  assert.ok(!navbar.includes('router.push(`${destination.pathname}'));
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

test("registration CTA is centered and bold across desktop, tablet and mobile", () => {
  assert.match(hero, /triptychHero__button--register/);
  assert.match(css, /\.triptychHero__button--register > span:last-child\s*\{[^}]*font-weight:\s*900/s);
  assert.match(css, /@media \(min-width: 901px\)\s*\{[\s\S]*?left:\s*clamp\(26px, 4vw, 74px\)/);
  assert.match(css, /@media \(max-width: 900px\)\s*\{[\s\S]*?width:\s*min\(100% - 24px, 720px\)/);
  assert.match(css, /@media \(max-width: 570px\)\s*\{[\s\S]*?width:\s*min\(100%, 320px\)/);
});

test("country switching is atomic on the first selection, including Lite", () => {
  const hook = read("lib/i18n/useRegionalCountry.ts");
  const lite = read("components/lite/LiteHeader.tsx");
  const link = read("components/layout/RegionalLink.tsx");
  assert.match(hook, /window\.history\.replaceState\(/);
  assert.ok(hook.indexOf('window.history.replaceState(') < hook.indexOf('window.dispatchEvent(new Event(CHANGE_EVENT))'));
  assert.match(lite, /selectRegionalCountry\(next\)/);
  assert.ok(!lite.includes('router.push(`${destination.pathname}'));
  assert.match(link, /rentocampo:country-change/);
});

test("free-growth mode hides paid packs and disables checkout and quota consumption", () => {
  const flag = read("lib/commercial/free-publications.ts");
  const quota = read("lib/billing/land-quota.ts");
  const checkout = read("app/api/billing/checkout/route.ts");
  const publish = read("app/api/campos/publicar/route.ts");
  const fotos = read("app/api/campos/fotos/route.ts");
  const listings = read("app/(dashboard)/mis-campos/page.tsx");
  const liteFields = read("app/lite/campos/page.tsx");
  const liteProfile = read("app/lite/perfil/page.tsx");
  assert.match(flag, /FREE_PUBLICATIONS_ENABLED = true/);
  assert.match(quota, /if \(FREE_PUBLICATIONS_ENABLED\)/);
  assert.match(quota, /limit: null, used: 0, remaining: null, unlimited: true/);
  assert.match(quota, /No billing event or quota is consumed/);
  assert.match(checkout, /code: "billing_paused"/);
  assert.match(publish, /return \{ user, admin: supabase \}/);
  assert.match(fotos, /FREE_PUBLICATIONS_ENABLED \? supabase : createAdminClient/);
  assert.ok(!listings.includes("<PlanesTierra"));
  assert.ok(!liteFields.includes('href="/lite/campos/packs"'));
  assert.ok(!liteProfile.includes('href="/lite/campos/packs"'));
});

test("public marketing no longer promotes annual packs or only-first-listing free", () => {
  const faq = read("components/landing/LandingFAQ.tsx");
  const hero = read("components/landing/LandingTriptychHero.tsx");
  assert.ok(!faq.includes("Pack Tierra Productiva"));
  assert.ok(!faq.includes("mercado-pago-clean.png"));
  assert.ok(!faq.includes("Primera publicación gratis"));
  assert.ok(!faq.includes("de por vida"));
  assert.ok(!hero.includes("primer campo gratis"));
  assert.match(faq, /100% GRATIS/);
});

test("demo listing/field details cannot contact demo owners and have clear labels", () => {
 const field = read("app/(public)/campos/[id]/page.tsx");
 const card = read("components/campos/CampoCard.tsx");
 assert.match(field, /esDemo \? \(/);
 assert.match(field, /Ficha demostrativa\. No representa una oferta real/);
 assert.match(field, /!esDemo && campoConPropietario\.propietario/);
 assert.match(card, /isDemo && <span className="aptitud-tag"/);
});
