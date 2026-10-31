import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const web=read("components/landing/LandingFigmaHome.tsx");
const lite=read("app/lite/page.tsx");
const home=read("components/landing/LandingPageContent.tsx");
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
    assert.match(source,/CONECTÁ DIRECTO/);
    assert.match(source,/Campos y servicios\\. Contacto directo/);
    assert.match(source,/SIN VUELTAS/);
    assert.match(source,/>0%<\\/strong>/);
    assert.match(source,/>100%<\\/strong>/);
    assert.match(source,/COMISIÓN/);
    assert.match(source,/CONTACTO DIRECTO/);
    const cta=source.indexOf(name==="web"?'className="rcf-actions"':'className="rcLiteDirectHero__actions"');
    const benefit=source.indexOf(name==="web"?'className="rcf-hero__proof"':'className="rcLiteDirectHero__stats"');
    assert.ok(cta>=0&&benefit>cta,name+" actions should appear before benefits");
  }
  assert.match(web,/href="\\/register"/);
  assert.match(web,/href="\\/campos\\/mapa"/);
  assert.match(lite,/href="\\/lite\\/cuenta\\/registro"/);
  assert.match(lite,/href="\\/lite\\/campos"/);
});

test("home stays hero + FAQ, with a single shared header/footer system",()=>{
 assert.match(home,/<LandingFigmaHome \\/>/);
 assert.match(home,/<LandingFAQ \\/>/);
 assert.doesNotMatch(home,/<LandingMapa \\/>|<LandingHowBrief \\/>/);
 assert.match(faq,/PREGUNTAS/);
 assert.doesNotMatch(faq,/headline: "TODO CLARO"/);
 assert.match(read("app/page.tsx"),/<Navbar \\/>[\\s\\S]*<LandingPageContent \\/>[\\s\\S]*<Footer \\/>/);
 assert.match(read("app/lite/layout.tsx"),/<Footer \\/>/);
 assert.match(read("app/layout.tsx"),/brand-final\\.css/);
 assert.match(sharedStyle,/--rc-black:/);
 assert.match(sharedStyle,/--rc-green:/);
 assert.match(sharedStyle,/--rc-silver:/);
 assert.match(sharedStyle,/header\\.navbar/);
 assert.match(sharedStyle,/footer\\.footer/);
});

test("responsive hero has a visible matte gold accent and no legacy hero CSS imports",()=>{
 assert.match(webStyle,/color: #d5bd72/);
 assert.match(liteStyle,/color:#d5bd72/);
 assert.match(webStyle,/\\.rcf-hero__metric-value/);
 assert.match(liteStyle,/\\.rcLiteDirectHero__metric strong/);
 assert.match(webStyle,/@media \\(max-width: 520px\\)/);
 assert.match(liteStyle,/@media\\(max-width:380px\\)/);
 assert.doesNotMatch(read("app/page.tsx"),/landing-triptych-refinements\\.css|hero-editorial-stable\\.css|landing-impact\\.css/);
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
