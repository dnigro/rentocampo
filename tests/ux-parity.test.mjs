import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const web=read("components/landing/LandingTriptychHero.tsx");
const lite=read("app/lite/page.tsx");
const webLogin=read("app/(auth)/login/page.tsx");
const webCss=read("styles/auth-responsive.css");
const liteForm=read("components/lite/LiteAuthForm.tsx");
const liteCss=read("styles/lite-auth.css");
const profile=read("components/PerfilForm.tsx");
const liteProfile=read("app/lite/perfil/editar/page.tsx");

test("desktop/mobile/Lite preserve direct-contact CTA hierarchy and proposition",()=>{
 for(const [name,source] of [["web",web],["Lite",lite]]){
  const cta=source.indexOf('className="rc'+(name==="web"?'Hero26':'LiteDirectHero')+'__register"');
  const stats=source.indexOf('className="rc'+(name==="web"?'Hero26':'LiteDirectHero')+'__stats"');
  assert.ok(cta>0 && stats>0 && cta<stats,`${name} CTA must precede stats in mobile DOM order`);
  assert.match(source,/MAPAS \+ CHAT ONLINE/);
  assert.match(source,/Productores \+ Tierra \+ Servicios/);
 }
 const css=read("styles/hero-2026-isolated.css");
 assert.match(css,/@media \(min-width: 901px\)/);
 assert.match(css,/\.rcHero26__stats \{ order: 1; \}/);
 assert.match(css,/\.rcHero26__register \{ order: 2; \}/);
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
