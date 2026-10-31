import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const web=read("components/landing/LandingSimpleHome.tsx");
const lite=read("app/lite/page.tsx");
const webLogin=read("app/(auth)/login/page.tsx");
const webCss=read("styles/auth-responsive.css");
const liteForm=read("components/lite/LiteAuthForm.tsx");
const liteCss=read("styles/lite-auth.css");
const profile=read("components/PerfilForm.tsx");
const liteProfile=read("app/lite/perfil/editar/page.tsx");

test("desktop, mobile and Lite expose the same three low-friction actions", () => {
  const css=read("styles/home-simple.css");
  const home=read("components/landing/LandingPageContent.tsx");
  for(const [name,source] of [["web",web],["Lite",lite]]) {
    assert.match(source,/Registrate gratis/);
    assert.match(source,/Ver campos/);
    assert.match(source,/Ver servicios/);
    assert.match(source,/SIN INTERMEDIARIOS/);
    assert.match(source,/SIN COMISIONES/);
    assert.match(source,/rcSimpleHero__actions/);
    assert.ok(source.indexOf("Registrate gratis")<source.indexOf("Ver campos"),name+" registration first");
  }
  assert.match(web,/href="\/register"/);
  assert.match(web,/href="\/campos"/);
  assert.match(web,/href="\/servicios-rurales"/);
  assert.match(lite,/href="\/lite\/cuenta\/registro"/);
  assert.match(lite,/href="\/lite\/campos"/);
  assert.match(lite,/href="\/lite\/servicios"/);
  // Las tres imágenes rurales reales están presentes en las tres superficies.
  for(const name of ["image_trigo_pix.png","image_vaca_pix.png","image_truck_pix.png"]) {
    assert.ok(web.includes(name),name+" missing from web");
    assert.ok(lite.includes(name),name+" missing from Lite");
  }
  assert.match(css,/\.rcSimpleHero__art\{/);
  assert.match(css,/\.rcSimpleHero__photoLabel\{/);
  assert.doesNotMatch(web, /<video|__stats|__artMark/);
  assert.doesNotMatch(lite, /<video|__stats|__artMark/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/@media\(max-width:350px\)/);
  assert.match(home,/LandingSimpleHome/);
  assert.doesNotMatch(home,/LandingFAQ|LandingMapa|LandingTriptychHero|LandingHowBrief/);
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
