import { DEMO_SERVICIO_VISIBLE_IDS } from "../data/visible-demo-services.ts";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const dictionary = read("lib/i18n/messages.ts");
const navbar = read("components/layout/Navbar.tsx");
const hero = read("components/landing/LandingFigmaHome.tsx");

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

test("regional hero has the same short ES/PT claim and 0 percent offer",()=>{
 const styles=read("styles/home-figma-sin-vueltas.css");
 for(const phrase of ["CAMPOS Y SERVICIOS","TERRAS E SERVIÇOS","SIN VUELTAS","0%</strong>","100%</strong>"])assert.ok(hero.includes(phrase));
 assert.ok(hero.includes('href="/register"'));
 assert.ok(hero.includes('href="/campos/mapa"'));
 assert.ok(styles.includes(".rc-landing .rcf-hero__matte"));
 assert.match(navbar,/href="\/campos"/);
 assert.match(navbar,/href="\/servicios-rurales"/);
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

test("hero CTA stays prominent in desktop and mobile",()=>{
 const css=read("styles/home-figma-sin-vueltas.css");
 assert.ok(hero.includes('className="rcf-pill rcf-pill--light"'));
 assert.ok(css.includes("border-radius: 999px"));
 assert.ok(css.includes("@media (max-width: 900px)"));
 assert.ok(css.includes("@media (max-width: 520px)"));
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
  const hero = read("components/landing/LandingFigmaHome.tsx");
  assert.ok(!faq.includes("Pack Tierra Productiva"));
  assert.ok(!faq.includes("mercado-pago-clean.png"));
  assert.ok(!faq.includes("Primera publicación gratis"));
  assert.ok(!faq.includes("de por vida"));
  assert.ok(!hero.includes("primer campo gratis"));
  assert.ok(faq.includes("registrarte, publicar campos o servicios rurales y contactar a otros usuarios es gratis"));
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
  assert.match(service,/esServicioDemoVisible\(item\.id\)/);
  for(const suffix of ["016","017","018","019"])
    assert.ok(DEMO_SERVICIO_VISIBLE_IDS.has("10000000-0000-4000-8000-000000000"+suffix));
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
 assert.match(map,/esServicioDemoVisible\(String\(prestador\.id\)\)/);
 assert.match(services,/esServicioDemoVisible\(item\.id\)/);
 for(const n of ["013","014","015","016","017","018","019"]){
  const id="10000000-0000-4000-8000-000000000"+n;
  assert.ok(DEMO_SERVICIO_VISIBLE_IDS.has(id),`missing approved service demo ${n}`);
 }
 for(let n=101;n<=111;n++){
  const id="10000000-0000-4000-8000-"+String(n).padStart(12,"0");
  assert.ok(DEMO_SERVICIO_VISIBLE_IDS.has(id),`missing LATAM18 service demo ${n}`);
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
test("map displays new-country field markers and refreshes on country change", () => {
 const map=read("components/campos/CampoMapa.tsx");
 const page=read("app/(public)/campos/mapa/page.tsx");
 const nav=read("components/layout/Navbar.tsx");
 const selector=read("components/listings/ListingCountrySelector.tsx");
 assert.match(map,/leafletMap\.setView\(\[\.\.\.country\.mapCenter\] as \[number, number\], country\.mapZoom/);
 // Un país seleccionado siempre determina centro y zoom, no los marcadores.
 assert.doesNotMatch(map,/leafletMap\.fitBounds\(/);
 assert.match(map,/selectRegionalCountry\(nuevoPais\)/);
 assert.match(map,/window\.location\.reload\(\)/);
 assert.match(map,/data-country=\{countryCode\}/);
 assert.match(page,/key=\{selectedCountry\}/);
 assert.match(nav,/router\.refresh\(\)/);
 assert.match(selector,/router\.replace\(/);
});
test("responsive rural hero, FAQ and Lite share the current design",()=>{
 const faq=read("components/landing/LandingFAQ.tsx");
 const hero=read("components/landing/LandingFigmaHome.tsx");
 const css=read("styles/home-figma-sin-vueltas.css");
 const lite=read("app/lite/page.tsx");
 for(const phrase of ["CONECTÁ DIRECTO.","0%</strong>","100%</strong>",'href="/register"','className="rcf-hero__title"'])assert.ok(hero.includes(phrase));
 assert.ok(lite.includes('className="rcLiteDirectHero__register"'));
 assert.ok(css.includes(".rc-landing .rcf-hero__matte"));
 assert.ok(css.includes("@media (max-width: 520px)"));
 assert.ok(faq.includes('id="preguntas"'));
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
 assert.match(panel,/regionalPublicationHref\(\{ country, kind, authenticated, zona: region\.zona \}\)/);
 assert.match(css,/\.rc-regions-showcase__grid/);
 assert.match(css,/\.rc-regions-showcase \{/);
 assert.match(css,/clip-path: none/);
 assert.match(panel,/Não são indicadores de procura verificada/);
});

test("mobile/desktop show the new cow image without the obsolete video/map below",()=>{
 const landing=read("components/landing/LandingPageContent.tsx");
 const hero=read("components/landing/LandingFigmaHome.tsx");
 const css=read("styles/home-figma-sin-vueltas.css");
 const lite=read("app/lite/page.tsx");
 assert.ok(landing.includes("<LandingFigmaHome />"));
 assert.ok(landing.includes("<LandingFAQ />"));
 assert.ok(!landing.includes("<LandingMapa"));
 assert.ok(!landing.includes("<LandingHowBrief"));
 assert.ok(hero.includes('src="/image_vaca_pix.png"'));
 assert.ok(lite.includes('src="/image_vaca_pix.png"'));
 assert.ok(css.includes("clip-path: polygon("));
 assert.ok(!hero.includes("rcHomeVideo__player"));
});

