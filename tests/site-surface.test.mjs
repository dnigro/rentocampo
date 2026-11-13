import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {siteSurfaceHref} from "../lib/site-surface.ts";

test("shared navigation preserves web routes and maps Lite destinations and query strings",()=>{
 const mappings = {
  "/v3?pais=BR&vista=mapa#explorar":"/lite?pais=BR&vista=mapa#explorar",
  "/v3/campos/field-id?pais=AR":"/lite/campos/field-id?pais=AR",
  "/v3/servicios/service-id?pais=US":"/lite/servicios/service-id?pais=US",
  "/":"/lite", "/dashboard":"/lite/perfil", "/perfil":"/lite/perfil/editar",
  "/login":"/lite/cuenta/ingresar", "/register?pais=BR&tipo=prestador":"/lite/cuenta/registro?pais=BR&tipo=prestador",
  "/campos/mapa?vista=servicios":"/lite/campos/mapa?vista=servicios",
  "/servicios-rurales/service-id":"/lite/servicios/service-id",
  "/mis-campos":"/lite/campos/mis-publicaciones", "/mis-servicios-rurales/nuevo":"/lite/servicios/publicar",
  "/mensajes/direct/user-id":"/lite/perfil/mensajes/direct/user-id", "/#como-funciona":"/lite#como-funciona-lite",
 };
 for(const [web,lite] of Object.entries(mappings)){assert.equal(siteSurfaceHref(web,false),web);assert.equal(siteSurfaceHref(web,true),lite);}
 for(const untouched of ["/lite/campos","/terminos-y-condiciones","https://www.instagram.com/rento_campo","//example.com/a"]){assert.equal(siteSurfaceHref(untouched,true),untouched);}
});
test("Lite reuses the same navigation, session and country controls as home",()=>{
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
 assert.match(read('components/lite/LiteHeader.tsx'),/return <Navbar \/>/);
 for(const file of ['app/page.tsx','app/(public)/layout.tsx','app/(dashboard)/layout.tsx','app/(auth)/layout.tsx']){
  const source=read(file);assert.match(source,/<Navbar \/>/);assert.match(source,/<Footer/);
 }
 assert.match(read('app/lite/layout.tsx'),/<Footer \/>/);
 assert.doesNotMatch(read('app/(dashboard)/mis-campos/page.tsx'),/Sin packs ni límites de publicaciones/);
});

test("security headers force HTTPS without locking unrelated subdomains", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.ok(config.includes('Strict-Transport-Security'));
  assert.ok(config.includes('max-age=31536000'));
  assert.ok(!config.includes('includeSubDomains'));
  assert.ok(config.includes('X-Content-Type-Options'));
});
