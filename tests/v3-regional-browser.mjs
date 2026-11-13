import {createRequire} from 'node:module';import {mkdirSync} from 'node:fs';import assert from 'node:assert/strict';
import {installVisualBridge} from './browser-visual-bridge.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.V3_TEST_URL || 'http://127.0.0.1:3004',evidence=process.env.V3_EVIDENCE_DIR || 'test-results/v3-regional';mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{const context=await browser.newContext();if(process.env.V3_VISUAL_BRIDGE==='1')await installVisualBridge(context);let writes=0;await context.route('**/*.supabase.co/**',route=>{if(!['GET','HEAD','OPTIONS'].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [country,region] of [['AR','Pergamino'],['BR','Ribeirão Preto'],['US','Des Moines'],['MX','Guasave']]){
 for(const [surface,kind,path] of [['web','campo','/v3/campos'],['web','servicio','/v3/servicios'],['lite','campo','/lite/campos'],['lite','servicio','/lite/servicios']]){
  await page.goto(`${origin}${path}?pais=${country}`,{waitUntil:'networkidle'});
  const panel=page.locator('.v3-regional-panel');await panel.waitFor();assert.equal(await panel.locator('.rc-regions-showcase__card').count(),4);assert.ok((await panel.innerText()).includes(region),country+' regional identity');
  for(const link of await panel.locator('.rc-regions-showcase__action').all()){const url=new URL(await link.getAttribute('href'),origin);assert.equal(url.searchParams.get('pais'),country);assert.ok(url.searchParams.get('zona'));assert.ok(url.pathname.includes(kind==='campo'?'campo':'servicio'));}
  for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' '+country+' overflow '+width);if(surface==='web'&&(width===320||width===1440))await panel.screenshot({path:`${evidence}/${country}-${kind}-${width}.png`});}
  if(country==='BR')assert.ok((await page.locator('.v3-marketplace-filters').innerText()).includes('Estado'));
  if(country==='US')assert.ok((await page.locator('.v3-marketplace-filters').innerText()).includes('Country'));
  console.log('PASS country regions, local publication links, responsive and language',surface,kind,country);
 }
}
await page.goto(`${origin}/?pais=AR`,{waitUntil:'networkidle'});assert.equal(await page.locator('.v3-regional-disclosure').getAttribute('open'),null);await page.locator('.v3-regional-disclosure>summary').click();assert.ok((await page.locator('.v3-regional-disclosure').innerText()).includes('Pergamino'));
await page.locator('.rural-type-tabs button').nth(2).click();await page.waitForFunction(()=>document.querySelector('.v3-regional-disclosure .rc-regions-showcase__action')?.getAttribute('href').includes('mis-servicios-rurales'));
await page.goto(`${origin}/login?pais=AR`,{waitUntil:'networkidle'});await page.locator('input[type=email]').fill('qa@example.invalid');await page.evaluate(()=>history.pushState(null,'','/login?pais=BR'));await page.getByRole('heading',{name:'Entrar',exact:true}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'pt-BR');assert.equal(await page.locator('input[type=email]').inputValue(),'qa@example.invalid');await page.evaluate(()=>history.pushState(null,'','/login?pais=US'));await page.getByRole('heading',{name:'Sign in',exact:true}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'en-US');assert.equal(await page.locator('input[type=email]').inputValue(),'qa@example.invalid');
assert.equal(writes,0);assert.deepEqual(errors,[]);console.log('PASS compact home regions follow catalog; same-route language changes preserve form data; no writes/errors');
}finally{await browser.close();}
