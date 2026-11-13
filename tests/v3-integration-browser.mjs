// Read-only integration QA: no email sends, account creation or profile writes.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {installVisualBridge} from './browser-visual-bridge.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.V3_TEST_URL || 'http://127.0.0.1:3002';
const evidence=process.env.V3_EVIDENCE_DIR || 'test-results/v3-integrated';mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext();if(process.env.V3_VISUAL_BRIDGE==='1')await installVisualBridge(context);
 let writes=0;await context.route('**/*.supabase.co/**',route=>{if(!['GET','HEAD','OPTIONS'].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const routes=['/','/v3/mi-rentocampo','/login','/register','/recuperar-contrasena','/auth/reset-password','/auth/callback','/terminos-y-condiciones','/lite','/lite/cuenta/ingresar','/lite/cuenta/registro','/lite/cuenta/recuperar','/lite/cuenta/nueva-clave'];
 for(const path of routes){
  const response=await page.goto(`${origin}${path}?pais=AR`,{waitUntil:'networkidle',timeout:60000});assert.equal(response.status(),200,path);
  await page.locator('.v3-header').waitFor();
  assert.equal(await page.locator('.v3-header').count(),1,path+' shared header');assert.equal(await page.locator('.v3-footer').count(),1,path+' shared footer');
  assert.equal(await page.locator('header.navbar').count(),0,path+' legacy chrome');assert.equal(await page.locator('main').count(),1,path+' single main');
  assert.equal(await page.locator('.v3-footer a[href*="terminos-y-condiciones"]').count(),1,path+' legal');
  for(const width of [320,375,390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow '+width);
   const fields=await page.locator('input:not([type=checkbox]):not([type=hidden]),textarea').all();for(const field of fields)if(await field.isVisible())assert.ok(await field.evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16),path+' input font');
   if(width===320||width===1440)await page.screenshot({path:`${evidence}/${path.replaceAll('/','_')||'home'}-${width}.png`,fullPage:true,animations:'disabled'});
  }
  console.log('PASS integrated chrome, legal, font readability, responsive',path);
 }
 await page.goto(`${origin}/login?pais=AR`,{waitUntil:'networkidle'});
 assert.equal(await page.locator('.auth-title').evaluate(e=>getComputedStyle(e).fontSize),'32px');
 assert.equal(await page.locator('.auth-form .btn-submit').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(199, 43, 76)');
 await page.locator('input[type=email]').fill('qa@example.invalid');await page.locator('#password').fill('test-only-no-submit');await page.locator('.password-toggle').click();assert.equal(await page.locator('#password').getAttribute('type'),'text');await page.locator('.password-toggle').click();
 await page.locator('a[href="/recuperar-contrasena"]').click();await page.waitForURL('**/recuperar-contrasena');assert.equal(await page.locator('.v3-header').count(),1);
 await page.locator('.v3-footer a[href*="terminos-y-condiciones"]').click();await page.waitForURL('**/terminos-y-condiciones**');await page.getByRole('heading',{name:'Términos y condiciones',exact:true}).waitFor();
 for(const [country,label] of [['BR','Termos e condições'],['US','Terms and conditions']]){await page.goto(`${origin}/login?pais=${country}`,{waitUntil:'networkidle'});await page.locator('.v3-footer').getByRole('link',{name:label,exact:true}).waitFor();const how=await page.locator('.v3-footer a[href*="ayuda=publicar"]').getAttribute('href');assert.equal(new URL(how,origin).searchParams.get('pais'),country);assert.equal(new URL(how,origin).hash,'#preguntas-frecuentes');}
 await page.goto(`${origin}/v3?pais=AR`,{waitUntil:'networkidle'});assert.equal(await page.locator('.rural-hero-band img').evaluate(e=>e.complete&&e.naturalWidth>0),true);
 assert.equal(writes,0,'No Supabase writes');assert.deepEqual(errors,[]);console.log('PASS auth navigation, password visibility, terms destination, BR/US shared chrome, colored hero, zero writes/errors');
}finally{await browser.close();}
