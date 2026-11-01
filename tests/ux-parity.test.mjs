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
 assert.ok(sharedStyle.includes("--rc-green: #B8D6DF"));
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
 assert.match(webStyle,/color: #B8D6DF/);
 assert.match(liteStyle,/color:#B8D6DF/);
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

test("approved compact footer and glacier metallic register CTA across web and Lite", () => {
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
  assert.ok(webStyle.includes("background: #B8D6DF !important"));
  assert.ok(liteStyle.includes("background: #B8D6DF"));
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

test("premium glacier-silver accent preview stays unified, accessible and non-yellow", () => {
  const brand = read("styles/brand-final.css");
  const how = read("styles/how-it-works.css");
  const footer = read("styles/footer.css");
  const msg = read("styles/mensajes.css");
  const chrome = read("styles/site-theme.css");
  const publicCss = read("styles/public.css");
  const liteHeader = read("styles/lite-header.css");
  const native = read("apps/mobile/src/App.tsx");
  assert.ok(brand.includes("--rc-green: #B8D6DF"));
  assert.ok(brand.includes("--rc-green-hover: #D2E7EC"));
  for(const [name, css] of Object.entries({webStyle, liteStyle, how, footer, msg, chrome, publicCss, liteHeader, native})) {
    assert.ok(css.includes("#B8D6DF"), name+" lacks shared accent");
    assert.ok(!/#d5bd72|#d2b84c|#E6D87A/i.test(css), name+" retained obsolete mustard");
  }
  assert.ok(how.includes("--how-accent"));
  assert.ok(brand.includes("color: var(--rc-black) !important"));
  assert.ok(webStyle.includes("background: #B8D6DF !important"));
  assert.ok(liteStyle.includes("background: #B8D6DF"));
  assert.ok(msg.includes("mensaje-compose-submit"));
});
