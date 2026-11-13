import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { installVisualBridge } from './browser-visual-bridge.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.V3_TEST_URL||'http://127.0.0.1:3000';
const evidence=process.env.V3_EVIDENCE_DIR||'test-results/v3-details';
mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext();
 if(process.env.V3_VISUAL_BRIDGE==='1') await installVisualBridge(context);
 let writes=0;
 await context.route('**/*.supabase.co/**',route=>{if(!['GET','HEAD','OPTIONS'].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const ids={};
 for(const [kind,catalog] of [['campos','/v3/campos?pais=AR'],['servicios','/v3/servicios?pais=AR&provincia=Santa+Fe']]) {
  await page.goto(origin+catalog,{waitUntil:'networkidle',timeout:60000});
  const first=page.locator('.v3-listing-info').first();
  if(await first.count()===0&&kind==='servicios') await page.goto(origin+'/v3/servicios?pais=AR',{waitUntil:'networkidle'});
  const href=await first.getAttribute('href');
  ids[kind]=new URL(href,origin).pathname.split('/').pop();
  await first.click();
  await page.locator('.v3-detail-refined').waitFor();
  await page.waitForLoadState('networkidle');
  for(const width of [320,375,390,768,1280,1440]) {
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${kind} overflow ${width}`);
   assert.equal(await page.locator('h1').count(),1);
   assert.ok(await page.locator('#informacion').count());
   assert.ok(await page.locator('#ubicacion').count());
   await page.screenshot({path:`${evidence}/${kind}-${width}.png`,animations:'disabled'});
  }
  assert.ok(await page.locator('.v3-detail-back').getAttribute('href'));
  console.log('PASS detailed listing',kind);
 }
 for(const [kind,prefix] of [['campos','/campos'],['campos','/lite/campos'],['servicios','/servicios-rurales'],['servicios','/lite/servicios']]) {
  const response=await page.goto(origin+prefix+'/'+ids[kind]+'?pais=AR',{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  assert.equal(await page.locator('.v3-detail-refined').count(),1);
  assert.equal(await page.locator('.v3-header').count(),1);
  console.log('PASS shared web/Lite detail',prefix);
 }
 for(const path of ['/auth/reset-password','/lite/cuenta/nueva-clave']) {
  await page.goto(origin+path,{waitUntil:'networkidle'});
  const button=page.getByRole('button',{name:/Guardar.*contraseña|Save.*password|Salvar.*senha/});
  await button.waitFor();
  await page.locator('.auth-error[role=alert]').waitFor();
  assert.ok(await button.isDisabled());
  console.log('PASS expired or missing recovery session',path);
 }
 await page.goto(origin+'/v3/mi-rentocampo?pais=AR',{waitUntil:'networkidle'});
 assert.ok(await page.getByRole('link',{name:'Iniciar sesión',exact:true}).isVisible());
 assert.equal(await page.getByRole('link',{name:'Reporte gerencial',exact:true}).count(),0);
 for(const path of ['/gerencial','/perfil','/mis-servicios-rurales']) {
  const response=await context.request.get(origin+path,{maxRedirects:0});
  assert.equal(response.status(),307);
  assert.equal(new URL(response.headers().location,origin).pathname,'/login');
 }
 for(const path of ['/lite/campos/publicar','/lite/servicios/publicar']) {
  const response=await context.request.get(origin+path,{maxRedirects:0});
  assert.equal(response.status(),307);
  assert.equal(new URL(response.headers().location,origin).pathname,'/lite/cuenta/ingresar');
 }
 const redirect=await context.request.get(origin+'/auth/confirm?code=synthetic-test-code&next='+encodeURIComponent('/\\evil.example'),{maxRedirects:0});
 assert.equal(new URL(redirect.headers().location,origin).searchParams.get('next'),'/dashboard');
 assert.equal(writes,0,'browser must not send Supabase mutations');
 assert.deepEqual(errors,[]);
 console.log('PASS account protections, safe redirects, and zero backend writes/pageerrors');
} finally {await browser.close();}
