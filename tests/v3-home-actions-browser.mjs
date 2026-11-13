import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {installVisualBridge} from './browser-visual-bridge.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin=process.env.V3_TEST_URL || 'http://127.0.0.1:3003';
const evidence=process.env.V3_EVIDENCE_DIR || 'test-results/v3-home-actions';mkdirSync(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext();if(process.env.V3_VISUAL_BRIDGE==='1')await installVisualBridge(context);
 let writes=0;await context.route('**/*.supabase.co/**',route=>{if(!['GET','HEAD','OPTIONS'].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/v3','/lite']){
  await page.goto(`${origin}${path}?pais=AR`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.rural-home-actions h2').innerText(),'¿Qué necesitás hoy?');
  assert.equal(await page.locator('.v3-home-how').count(),0);
  assert.equal(await page.locator('.rural-action-card').count(),3);
  assert.equal(await page.locator('.rural-home-faq').getAttribute('open'),null);
  for(const width of [320,375,390,1440]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow '+width);
   const block=await page.locator('.rural-home-actions').boundingBox();assert.ok(block.height<=(width===1440?370:610),'compact actions '+width+': '+block.height);
   assert.equal(await page.locator('.rural-hero h1').evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
   if(width===320||width===1440)await page.screenshot({path:`${evidence}/${path==='/'?'home':path.slice(1)}-${width}.png`,fullPage:true,animations:'disabled'});
  }
  await page.locator('.rural-home-faq>summary').click();
  const questions=page.locator('.rural-home-faq-items>details');assert.equal(await questions.count(),5);
  await questions.nth(0).locator('summary').click();assert.ok(await questions.nth(0).locator('p').isVisible());
  await questions.nth(1).locator('summary').click();assert.equal(await questions.nth(0).getAttribute('open'),null);
  await page.locator('.rural-home-faq>summary').click();
  await page.locator('.rural-action-card').first().click();await page.waitForURL('**tipo=campo**');await page.locator('select[name=operacion]').waitFor();
  console.log('PASS compact hero/actions, folded FAQ, exclusive answers, search CTA',path);
 }
 for(const [country,title] of [['BR','O que você precisa hoje?'],['US','What do you need today?']]){await page.goto(`${origin}/?pais=${country}`,{waitUntil:'networkidle'});assert.equal(await page.locator('.rural-home-actions h2').innerText(),title);}
 await page.goto(`${origin}/?pais=AR`,{waitUntil:'networkidle'});
 for(const index of [1,2]){
  const href=await page.locator('.rural-action-card').nth(index).getAttribute('href');
  await page.goto(new URL(href,origin).href,{waitUntil:'networkidle'});
  assert.equal(new URL(page.url()).pathname,'/login');assert.equal(new URL(page.url()).searchParams.get('next'),new URL(href,origin).pathname+new URL(href,origin).search);
  assert.equal(await page.locator('.v3-header').count(),1);
  await page.goto(`${origin}/?pais=AR`,{waitUntil:'networkidle'});
 }
 assert.equal(writes,0);assert.deepEqual(errors,[]);console.log('PASS localized actions, protected publication destinations preserve next, no writes or JS errors');
}finally{await browser.close();}
