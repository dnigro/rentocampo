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
 assert.ok(howCss.includes("grid-auto-columns: min(82vw, 340px)"));
 assert.ok(howCss.includes("scroll-snap-type: x mandatory"));
 assert.ok(howCss.includes("font-size: clamp(21px, 2.1vw, 31px)"));
 assert.ok(howCss.includes("width: clamp(53px, 5.0vw, 68px)"));
 assert.ok(how.includes('className="rc-how__symbol"'));
 assert.ok(how.includes("tabIndex={0}"));
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
