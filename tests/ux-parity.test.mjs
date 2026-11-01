import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const web=read("components/landing/LandingFigmaHome.tsx");
const lite=read("app/lite/page.tsx");
const home=read("components/landing/LandingPageContent.tsx");
const how=read("components/landing/HowItWorksStrip.tsx");
const howCss=read("styles/how-it-works.css");
const faq=read("components/landing/LandingFAQ.tsx");
const webStyle=read("styles/home-figma-sin-vueltas.css");
const liteStyle=read("styles/lite-direct-hero.css");
const sharedStyle=read("styles/brand-final.css");
const webLogin=read("app/(auth)/login/page.tsx");
const webCss=read("styles/auth-responsive.css");
const liteForm=read("components/lite/LiteAuthForm.tsx");
const liteCss=read("styles/lite-auth.css");
const profile=read("components/PerfilForm.tsx");
const liteProfile=read("app/lite/perfil/editar/page.tsx");

test("web, mobile and Lite keep the same short message and numeric offer",()=>{
  for (const [name,source] of [["web",web],["Lite",lite]]) {
    assert.match(source,/CAMPOS Y SERVICIOS/);
    assert.ok(source.includes("Buscá, publicá y conectá."));
    assert.match(source,/SIN VUELTAS/);
    assert.ok(source.includes("0%</strong>"));
    assert.ok(source.includes("100%</strong>"));
    assert.match(source,/COMISIÓN/);
    assert.match(source,/CONTACTO DIRECTO/);
    const cta=source.indexOf(name==="web"?'className="rcf-actions"':'className="rcLiteDirectHero__actions"');
    const benefit=source.indexOf(name==="web"?'className="rcf-hero__proof"':'className="rcLiteDirectHero__stats"');
    assert.ok(cta>=0&&benefit>cta,name+" actions should appear before benefits");
  }
  assert.ok(web.includes('href="/register"'));
  assert.ok(web.includes('href="/campos/mapa"'));
  assert.ok(lite.includes('href="/lite/cuenta/registro"'));
  assert.ok(lite.includes('href="/lite/campos"'));
 assert.ok(lite.includes("<HowItWorksStrip lite />"));
 assert.ok(read("components/lite/LiteHeader.tsx").includes('href="/lite#como-funciona-lite"'));
});

test("home stays hero + short explainer + FAQ, with a shared header/footer",()=>{
 assert.ok(home.includes("<LandingFigmaHome />"));
 assert.ok(home.includes("<LandingFAQ />"));
 assert.ok(home.includes("<HowItWorksStrip />"));
 assert.ok(home.indexOf("<LandingFigmaHome />") < home.indexOf("<HowItWorksStrip />"));
 assert.ok(home.indexOf("<HowItWorksStrip />") < home.indexOf("<LandingFAQ />"));
 assert.ok(how.includes('id={lite ? "como-funciona-lite" : "como-funciona"}'));
 assert.ok(how.includes("Explorá o publicá") && how.includes("Conectá por chat") && how.includes("Acordá directo"));
 assert.ok(howCss.includes("scroll-margin-top:90px"));
 assert.ok(howCss.includes("grid-template-columns:repeat(3,minmax(0,1fr))"));
 assert.ok(howCss.includes("grid-template-columns: minmax(0, 1fr)"));
 assert.ok(howCss.includes("scroll-snap-type: none"));
 assert.ok(howCss.includes("overflow-x: visible"));
 assert.ok(!howCss.includes("scroll-snap-type: x mandatory"));
 assert.ok(howCss.includes("font-size: clamp(21px, 2.1vw, 31px)"));
 assert.ok(howCss.includes("width: clamp(53px, 5.0vw, 68px)"));
 assert.ok(how.includes('className="rc-how__symbol"'));
 assert.ok(!how.includes("tabIndex={0}"));
 assert.ok(how.includes("MapPinned") && how.includes("MessageCircleMore") && how.includes("Handshake"));
 assert.ok(sharedStyle.includes("--rc-green: #646569"));
 assert.ok(liteStyle.includes("background:#646569"));
 assert.ok(webStyle.includes("background:#646569"));
 assert.ok(read("app/layout.tsx").includes("Nunito"));
 assert.ok(webStyle.includes("clip-path: none;"));
 assert.ok(liteStyle.includes("clip-path: none;"));
 assert.ok(webStyle.includes("height: clamp(290px, 84vw, 430px)"));
 assert.ok(read("components/layout/Navbar.tsx").includes('href="/#como-funciona"'));
 assert.ok(faq.includes('id="preguntas"'));
 assert.ok(!home.includes("LandingMapa")&&!home.includes("LandingHowBrief"));
 assert.match(faq,/PREGUNTAS/);
 assert.doesNotMatch(faq,/headline: "TODO CLARO"/);
 assert.ok(read("app/page.tsx").includes("<Navbar />")&&read("app/page.tsx").includes("<Footer />"));
 assert.ok(read("app/lite/layout.tsx").includes("<Footer />"));
 assert.ok(read("app/layout.tsx").includes("brand-final.css"));
 assert.match(sharedStyle,/--rc-black:/);
 assert.match(sharedStyle,/--rc-green:/);
 assert.match(sharedStyle,/--rc-silver:/);
 assert.ok(sharedStyle.includes("header.navbar"));
 assert.ok(sharedStyle.includes("footer.footer"));
});

test("responsive hero has a visible matte gold accent and no legacy hero CSS imports",()=>{
 assert.match(webStyle,/color: #d5bd72/);
 assert.match(liteStyle,/color:#d5bd72/);
 assert.ok(webStyle.includes(".rcf-hero__metric-value"));
 assert.ok(liteStyle.includes(".rcLiteDirectHero__metric strong"));
 assert.ok(webStyle.includes("@media (max-width: 520px)"));
 assert.ok(webStyle.includes("Compact desktop/notebook"));
 assert.ok(webStyle.includes("Protección editorial del hero sobre la diagonal"));
 assert.ok(webStyle.includes("max-width: min(55vw, 790px)"));
 assert.ok(webStyle.includes("UI aprobada: texto protagonista"));
 assert.ok(webStyle.includes("Hero editorial 304: resuelve el vacío"));
 assert.ok(webStyle.includes("clip-path: polygon(0 0, 71% 0, 43% 100%, 0 100%)"));
 assert.ok(webStyle.includes("clip-path: polygon(0 0, 72% 0, 43% 100%, 0 100%)"));
 assert.ok(webStyle.includes("width: min(53vw, 750px)"));
 assert.ok(webStyle.includes("justify-content: center"));
 assert.ok(webStyle.includes("width: 48vw"));

 assert.ok(webStyle.includes("align-items: center;"));
 assert.ok(liteStyle.includes("Portada Lite: misma composición centrada"));
 assert.ok(webStyle.includes("max-width: 58vw"));
 assert.ok(webStyle.includes("@media (min-width: 641px) and (max-width: 900px)"));
 assert.ok(webStyle.includes("calc(100svh - 110px)"));
 assert.ok(liteStyle.includes("Compactación Lite/webview"));
 assert.ok(howCss.includes("La explicación se lee de un vistazo"));
 const formCss=read("styles/campos.css");
 assert.ok(formCss.includes("Publicar campo / servicio rural: pasos compactos"));
 assert.ok(formCss.includes("font-size: 12px;"));
 assert.ok(formCss.includes("accent-color: #5e6064"));
 assert.ok(sharedStyle.includes("Densidad general 2026"));
 assert.ok(liteStyle.includes("@media(max-width:380px)"));
 assert.ok(!read("app/page.tsx").includes("landing-impact.css"));
});

test("web and Lite login use short title and accessible recovery link below password",()=>{
 assert.match(webLogin,/t\("auth.signIn"\)/);
 assert.doesNotMatch(webLogin,/auth\.welcomeSubtitle/);
 assert.ok(webLogin.indexOf('className="password-input-wrapper"')<webLogin.indexOf('className="form-label-link auth-forgot-below"'));
 assert.match(webCss,/\.auth-forgot-below[\s\S]*text-align: center/);
 assert.match(liteForm,/className="lite-auth-forgot"/);
 assert.match(liteCss,/\.lite-auth-forgot\{[^}]*text-align:center/);
 assert.match(read("app/lite/cuenta/registro/page.tsx"),/Crear cuenta/);
 assert.match(read("app/lite/cuenta/ingresar/page.tsx"),/className="lite-auth-title"/);
});

test("Lite profile reuses web profile: selecting rural-service role adds no expanded service fields",()=>{
 assert.match(liteProfile,/Workflow from "@\/app\/\(dashboard\)\/perfil\/page"/);
 assert.match(profile,/toggleRole\("prestador"\)/);
 assert.doesNotMatch(profile,/servicios-profile-box/);
 assert.doesNotMatch(profile,/servicePhotoInputRef/);
 const api=read("app/api/profile/route.ts");
 assert.match(api,/if \("servicios_rurales" in body\)/);
});

test("approved compact footer and mustard register CTA across web and Lite", () => {
  const footer = read("components/layout/Footer.tsx");
  const footerCss = read("styles/footer.css");
  assert.ok(footer.includes("footer-col--contact"));
  assert.ok(footer.includes("Tractor, House, Sprout, Mail"));
  assert.ok(footerCss.includes("grid-template-columns: repeat(2, minmax(0, 1fr))"));
  assert.ok(footerCss.includes("Footer 305: estructura única"));
  assert.ok(!footerCss.includes("body:not(:has(.rc-landing))"), "no CSS specific to internal pages");
  assert.ok(footerCss.includes("footer.footer .footer-col--services,"));
  assert.ok(footerCss.includes("footer.footer .footer-col--contact"));
  assert.ok(footerCss.includes("grid-column: auto"));
  assert.ok(footerCss.includes("overflow-wrap: anywhere"));
  assert.ok(footerCss.split(String.fromCharCode(10)).length < 300, "remove dead duplicated legacy footer CSS");
  assert.ok(web.includes('t("REGISTRATE", "CADASTRE-SE", "SIGN UP")'));
  assert.ok(lite.includes('t("REGISTRATE", "CADASTRE-SE", "SIGN UP")'));
  assert.ok(webStyle.includes("background: #d5bd72 !important"));
  assert.ok(liteStyle.includes("background: #d5bd72"));
  assert.ok(webStyle.includes("height: clamp(205px, 54vw, 278px)"));
  assert.ok(liteStyle.includes("height: clamp(205px, 54vw, 278px)"));
});

test("field and service contact creates an editable draft only; no automatic POST", () => {
  const consulta = read("components/campos/ConsultaButton.tsx");
  const liteConsulta = read("components/lite/LiteConsult.tsx");
  const fieldThread = read("components/mensajes/MensajeHilo.tsx");
  const directThread = read("components/mensajes/MensajeDirectoHilo.tsx");
  const fieldPage = read("app/(dashboard)/mensajes/[campoId]/page.tsx");
  const directPage = read("app/(dashboard)/mensajes/direct/[usuarioId]/page.tsx");
  const servicePage = read("app/(public)/servicios-rurales/[id]/page.tsx");
  const liteDirectPage = read("app/lite/perfil/mensajes/direct/[usuarioId]/page.tsx");
  assert.ok(!consulta.includes('fetch("/api/mensajes"'));
  assert.ok(!liteConsulta.includes('fetch("/api/mensajes"'));
  assert.ok(consulta.includes("?borrador=consulta"));
  assert.ok(servicePage.includes("?borrador=servicio"));
  assert.ok(liteDirectPage.includes("searchParams={searchParams}"));
  assert.ok(fieldPage.includes('borrador === "consulta"'));
  assert.ok(directPage.includes('borrador === "servicio"'));
  assert.ok(fieldThread.includes('onSubmit={handleEnviar}'));
  assert.ok(directThread.includes('onSubmit={enviar}'));
  assert.ok(fieldThread.includes("Enviar mensaje"));
  assert.ok(directThread.includes("Enviar mensaje"));
  assert.ok(fieldThread.includes("maxLength={500}"));
  assert.ok(directThread.includes("maxLength={500}"));
  assert.ok(fieldThread.includes('fetch("/api/mensajes"'));
  assert.ok(directThread.includes('fetch("/api/mensajes/directos"'));
});

test("Patagonia warm-white + navy + steel reference is enabled on web, mobile and Lite", () => {
 const appLayout=read("app/layout.tsx");
 const theme=read("styles/rc-patagonia-preview.css");
 assert.ok(appLayout.includes('import "@/styles/rc-patagonia-preview.css"'));
 assert.ok(appLayout.indexOf("brand-final.css")<appLayout.indexOf("rc-patagonia-preview.css"));
 for (const [token,value] of Object.entries({
   "--rc-patagonia-navy":"#11283F",
   "--rc-patagonia-navy-deep":"#0B2035",
   "--rc-patagonia-steel":"#779AB1",
   "--rc-patagonia-steel-dark":"#365F7A",
   "--rc-patagonia-ivory":"#F7F4EE"
 })) assert.ok(theme.includes(token+": "+value),token+" missing");
 assert.ok(theme.includes("clip-path: polygon(0 0, 65% 0, 49% 100%, 0 100%)"), "desktop dairy-photo diagonal");
 assert.ok(theme.includes("background: var(--rc-patagonia-ivory)"), "warm white shell");
 assert.ok(theme.includes("html body .rc-landing .rcf-hero__proof"), "full-width offer strip");
 assert.ok(theme.includes("position: absolute"), "desktop proof positioning");
 assert.ok(theme.includes("html body .rc-landing .rcf-pill--light"), "primary navy registration");
 assert.ok(theme.includes("background: var(--rc-patagonia-navy) !important"), "primary CTA dark");
 assert.ok(theme.includes("html body .rcLiteDirectHero__register"), "Lite shares navy register");
 assert.ok(theme.includes("html body .rc-how__step"), "how-it-works retains large cards");
 assert.ok(theme.includes("@media (max-width: 640px)"), "mobile cow-first composition");
 assert.ok(theme.includes("height: clamp(205px, 54vw, 278px)"), "compact cows in mobile");
 assert.ok(theme.includes("html body header.navbar"), "shared warm navigation");
 assert.ok(theme.includes("html body footer.footer"), "shared navy footer");
 assert.ok(!theme.includes("#d5bd72"), "no mustard overrides in new design layer");
});

test("Patagonia shared footer and actions guarantee readable navy + ivory contrast on every surface",()=>{
 const theme=read("styles/rc-patagonia-preview.css");
 const footer=read("styles/footer.css");
 const actions=read("styles/buttons.css");
 const native=read("apps/mobile/src/App.tsx");
 assert.ok(theme.includes("--rc-chrome-graphite: var(--rc-patagonia-navy-deep)"));
 assert.ok(!theme.includes("body:has(html body .rc-landing)"),"invalid :has selector causes footer regression");
 assert.ok(theme.includes("body:has(.rc-landing) footer.footer"));
 assert.ok(theme.includes("background: #0B2035 !important"));
 assert.ok(theme.includes("color: #DCE6EC !important"));
 assert.ok(theme.includes("-webkit-text-fill-color: #DCE6EC !important"));
 assert.ok(theme.includes("footer.footer :is(.footer-logo,.brand-clean-name,.brand-initial,.brand-clean-tagline)"));
 assert.ok(theme.includes("color: #F7F4EE !important"));
 assert.ok(theme.includes("html body header.navbar"));
 assert.ok(theme.includes("background: #11283F !important"));
 assert.ok(theme.includes("background: #DCE6EC !important"));
 assert.ok(theme.includes("html body .lite-regional-header"));
 assert.ok(footer.includes("background: #0B2035"));
 assert.ok(footer.includes("color: #DCE6EC"));
 assert.ok(footer.includes("color: #B0CAD8"));
 assert.ok(!footer.includes("#d5bd72"));
 assert.ok(actions.includes("--action-mustard: #11283F"));
 assert.ok(actions.includes("--action-mustard-hover: #365F7A"));
 assert.ok(!actions.includes("#171717"));
 assert.ok(native.includes('backgroundColor: "#F7F4EE"'));
 assert.ok(native.includes('backgroundColor: "#0B2035"'));
 assert.ok(native.includes('backgroundColor: "#11283F"'));
 assert.ok(native.includes('borderColor: "#365F7A"'));
});

test("map footer never overlays the interactive map and list routes are rounded buttons", () => {
 const mapPage=read("app/(public)/campos/mapa/page.tsx");
 const css=read("styles/mapa.css");
 const back=read("components/layout/DashboardReturn.tsx");
 const backCss=read("styles/dashboard.css");
 assert.ok(mapPage.includes('className="mapa-lista-link"'));
 assert.ok(!mapPage.includes('>← {tt("Lista de campos"'));
 assert.ok(!mapPage.includes('>← {tt("Lista de servicios"'));
 assert.ok(css.includes("Mapa: ocupar su propio bloque real"));
 assert.ok(css.includes("overflow-y: auto"));
 assert.ok(css.includes("height: auto !important"));
 assert.ok(css.includes("isolation: isolate"));
 assert.ok(css.includes("body:has(.mapa-page) footer.footer"));
 assert.ok(css.includes("height: clamp(530px, calc(100dvh - 170px), 840px)"));
 assert.ok(css.includes("border-radius: 999px"));
 assert.ok(back.includes('<Link href="/dashboard">Volver a Mi cuenta</Link>'));
 assert.ok(backCss.includes("Navegación interior de Mi cuenta: botón cápsula"));
});
test("desktop landing is more compact with readable Patagonia FAQ",()=>{
 const theme=read("styles/rc-patagonia-preview.css");
 assert.ok(theme.includes("Densidad editorial desktop 309b"));
 assert.ok(theme.includes("calc(100svh - 290px)"));
 assert.ok(theme.includes("html body .rc-landing .rcf-faq__question"));
 assert.ok(theme.includes("min-height: 72px"));
});

test("desktop hero brings diagonal nearer to copy without changing mobile geometry",()=>{
 const theme=read("styles/rc-patagonia-preview.css");
 assert.ok(theme.includes("clip-path: polygon(0 0, 65% 0, 49% 100%, 0 100%)"));
 assert.ok(theme.includes("--rcf-copy-safe-zone: 65vw"));
 assert.ok(theme.includes("--rcf-copy-target: calc(var(--rcf-copy-safe-zone) * .8)"));
 assert.ok(theme.includes("font-size: clamp(66px, 7vw, 96px)"));
 assert.ok(theme.includes("html:lang(pt) body .rc-landing .rcf-hero__title"));
 assert.ok(theme.includes("Chrome Android en «Sitio para computadora»"));
 assert.ok(theme.includes("html body:has(.rc-landing)"));
 assert.ok(theme.includes("background-color: #0B2035;"));
 assert.ok(theme.includes("min-height: clamp(440px, calc(100svh - 290px), 510px)"));
 assert.ok(theme.includes("min-height: 98px"));
 assert.ok(theme.includes("@media (max-width: 640px)"));
 assert.ok(theme.includes("height: clamp(205px, 54vw, 278px)"));
});
