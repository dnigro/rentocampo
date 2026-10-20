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

test("field preview and local UAT use RLS for public reads without admin secrets", () => {
 const field=read("app/(public)/campos/[id]/page.tsx");
 assert.match(field,/import Link from "next\/link"/);
 assert.match(field,/process\.env\.VERCEL_ENV !== "production"/);
 assert.match(field,/wibqszhvuvpjycheaxzi\.supabase\.co/);
});

test("growth mode does not silently hide a fourth real field or local AR demo", () => {
  const visible=read("lib/campos/visible-fields.ts");
  assert.match(visible, /const demos = regionales\.filter\(esCampoDemo\)/);
  assert.ok(!visible.includes("REAL_FIELDS_LIMIT"));
  assert.ok(!visible.includes("DEMO_CAMPO_VISIBLE_IDS"));
  const service=read("app/(public)/servicios-rurales/page.tsx");
  for(const suffix of ["016","017","018","019"])
    assert.ok(service.includes("10000000-0000-4000-8000-000000000"+suffix));
});

test("web and Lite country selectors cannot swallow first choice before hydration", () => {
  const nav=read("components/layout/Navbar.tsx");
  const lite=read("components/lite/LiteHeader.tsx");
  assert.equal((nav.match(/disabled=\{!countrySelectReady\}/g)||[]).length, 2);
  assert.match(lite,/disabled=\{!countrySelectReady\}/);
  assert.match(nav,/setCountrySelectReady\(true\)/);
  assert.match(lite,/setCountrySelectReady\(true\)/);
});

test("the map and listing both show seven-country service demos", () => {
 const map=read("app/(public)/campos/mapa/page.tsx");
 const services=read("app/(public)/servicios-rurales/page.tsx");
 for(const n of ["013","014","015","016","017","018","019"]){
  const id="10000000-0000-4000-8000-000000000"+n;
  assert.ok(map.includes(id),`missing map service demo ${n}`);
  assert.ok(services.includes(id),`missing listing service demo ${n}`);
 }
});

test("authenticated messaging uses RLS and blocks DEMO contact at API", () => {
 const direct=read("app/api/mensajes/directos/route.ts");
 const campo=read("app/api/mensajes/route.ts");
 const unread=read("app/api/mensajes/no-leidos/route.ts");
 const page=read("app/(dashboard)/mensajes/direct/[usuarioId]/page.tsx");
 for (const x of [direct,campo,unread,page]){
   assert.ok(!x.includes("createAdminClient"), "no service-role dependency in authenticated conversations");
   assert.match(x,/const admin = supabase/);
 }
 assert.match(campo,/code:"demo_not_contactable"/);
});

test("UAT messaging exercises real field consultations, direct chat and DEMO blocking",()=>{
 const content=read("tests/uat-browser.mjs");
 assert.match(content,/async function messagingAndPermissions/);
 assert.match(content,/demo_not_contactable/);
 assert.match(content,/\/api\/mensajes\/directos/);
 assert.match(content,/regionalMessageIds\.length/);
 assert.match(content,/regionalDirectMessageIds\.length/);
});

test("new regional explorer toolbar is common to fields and services", () => {
 const fields=read("components/campos/CamposListing.tsx");
 const services=read("app/(public)/servicios-rurales/page.tsx");
 const toolbar=read("components/listings/ListingExplorerToolbar.tsx");
 const styles=read("styles/explorador.css");
 for(const component of [fields,services]) {
  assert.match(component,/<ListingExplorerToolbar/);
  assert.ok(!component.includes('className="explorador-switch"'));
  assert.ok(!component.includes('className="rc-listing-map-country"'));
 }
 assert.match(toolbar,/ListingCountrySelector/);
 assert.match(styles,/\.rc-explorer-toolbar__related/);
 assert.match(styles,/@media \(max-width: 700px\)/);
});
test("maps center on the selected country's predefined mapCenter", () => {
 const map=read("components/campos/CampoMapa.tsx");
 const page=read("app/(public)/campos/mapa/page.tsx");
 const nav=read("components/layout/Navbar.tsx");
 const selector=read("components/listings/ListingCountrySelector.tsx");
 assert.ok(!map.includes("fitBounds("));
 assert.match(map,/leafletMap\.setView\(country\.mapCenter, country\.mapZoom/);
 assert.match(map,/data-country=\{countryCode\}/);
 assert.match(page,/key=\{selectedCountry\}/);
 assert.match(nav,/router\.replace\(/);
 assert.match(selector,/router\.replace\(/);
});
test("approved mobile experience is isolated from desktop", () => {
 const faq=read("components/landing/LandingFAQ.tsx");
 const hero=read("components/landing/LandingTriptychHero.tsx");
 const styles=read("styles/landing-triptych-refinements.css");
 assert.ok(hero.includes('t("Publicá, buscá", "Anuncie, busque")'));
 assert.ok(hero.includes('t("y conectá", "e conecte-se")'));
 assert.ok(hero.includes('t("100% gratis.", "100% grátis.")'));
 assert.ok(hero.includes('className="triptychHero__countriesMobile"'));
 assert.ok(hero.includes('className="triptychHero__countries"'));
 assert.ok(hero.includes('/flags/'));
 assert.ok(hero.includes('className="triptychHero__workflow"'));
 assert.ok(faq.includes('className="rc-faq-promise__desktop"'));
 assert.ok(faq.includes('className="rc-faq-promise__mobile"'));
 assert.ok(faq.includes("<span>Publicá, buscá</span><span>y conectá</span>"));
 assert.ok(faq.includes("<span>Anuncie, busque</span><span>e conecte-se</span>"));
 assert.ok(faq.includes("Preguntas frecuentes"));
 assert.ok(faq.includes("Perguntas frequentes"));
 assert.ok(faq.includes('id="preguntas"'));
 assert.ok(faq.includes("rc-faq-content"));
 assert.ok(faq.includes("¿Publicar tiene costo?"));
 assert.ok(styles.includes(".triptychHero__howItWorksMobile h2 .triptychHero__headlineEnd strong"));
 assert.ok(styles.includes(".rc-faq-promise__desktop { display: none; }"));
 assert.ok(styles.includes(".rc-faq-promise__mobile { display: block; }"));
 assert.ok(!faq.toLowerCase().includes("packs"));
});

test("public catalog filters sit beside results, with a mobile disclosure before listings", () => {
  const fields=read("components/campos/CamposListing.tsx");
  const services=read("app/(public)/servicios-rurales/page.tsx");
  const wrapper=read("components/listings/ListingFiltersPanel.tsx");
  const css=read("styles/explorador.css");
  assert.ok(!fields.includes('className="seo-explore"'));
  assert.ok(!fields.includes("Explorá campos por zona y aptitud"));
  assert.match(fields,/ListingFiltersPanel/);
  assert.match(services,/ListingFiltersPanel/);
  assert.match(wrapper,/aria-expanded=\{expanded\}/);
  assert.match(wrapper,/aria-controls=\{panelId\}/);
  assert.match(css,/@media \(max-width: 920px\)/);
  assert.match(css,/\.rc-explorer-filters__body\.is-open/);
});
test("Lite field and service search starts with a filter action ahead of the cards", () => {
  for (const [path,segment] of [["app/lite/campos/page.tsx","campos"],["app/lite/servicios/page.tsx","servicios"]]) {
    const page=read(path);
    assert.ok(page.indexOf(`/lite/${segment}/filtrar?pais=`) < page.indexOf(`<Lite${segment==="campos"?"Campos":"Servicios"}Listado/>`));
    assert.equal((page.match(new RegExp(`/lite/${segment}/filtrar`,"g"))||[]).length,1);
  }
});

test("service filters retain App Lite context instead of navigating back to the web",()=>{
 const source=read("components/servicios/ServiciosFiltros.tsx");
 assert.match(source,/pathname\.startsWith\("\/lite\/servicios\/filtrar"\)/);
 assert.match(source,/router\.push\(query \? `\$\{destination\}/);
 assert.match(source,/router\.push\(`\$\{destination\}\?pais=/);
});

test("regional productive zones replace clipped Argentina-only unverified demand", () => {
 const fields=read("components/campos/CamposListing.tsx");
 const panel=read("components/campos/DemandaZonasPanel.tsx");
 const regions=read("data/regiones-productivas.ts");
 const css=read("styles/explorador.css");
 assert.match(fields, /<DemandaZonasPanel country=\{pais\}/);
 assert.ok(!fields.includes('pais === "AR" && <DemandaZonasPanel'));
 assert.ok(!panel.includes("Demanda activa"));
 assert.ok(!panel.includes("Hay productores buscando tierra"));
 for (const country of ["AR","UY","PY","CL","BO","PE","BR"]) {
   assert.match(regions,new RegExp("  "+country+": \\["));
 }
 assert.match(panel,/\/register\?tipo=propietario&pais=\$\{country\}&zona=/);
 assert.match(css,/\.rc-regions-showcase__grid/);
 assert.match(css,/\.rc-regions-showcase \{/);
 assert.match(css,/clip-path: none/);
 assert.match(panel,/Não são indicadores de procura verificada/);
});

test("mobile triptych pills wrap safely and the video follows the registration CTA", () => {
  const style=read("styles/landing-triptych-refinements.css");
  const landing=read("components/landing/LandingPageContent.tsx");
  const lite=read("app/lite/page.tsx");
  assert.match(style,/\.triptychHero__panel \.triptychHero__panelCta \{[\s\S]*?white-space: normal/);
  assert.match(style,/\.triptychHero__panel--producers \.triptychHero__panelCta/);
  assert.match(style,/\.rc-map-section > \.rc-shell \{[\s\S]*?flex-direction: column/);
  assert.match(style,/\.rc-map-section \.rc-aerial-video \{[\s\S]*?order: 0/);
  assert.match(style,/\.rc-map-section \.rc-map-copy \{[\s\S]*?order: 1/);
  assert.ok(landing.indexOf("<LandingTriptychHero") < landing.indexOf("<LandingMapa"));
  assert.ok(!lite.includes("triptychHero"), "the independent Lite home needs no web triptych overrides");
});
