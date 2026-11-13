import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { installVisualBridge } from './browser-visual-bridge.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.V3_TEST_URL || 'http://127.0.0.1:3000';
const evidence = process.env.V3_EVIDENCE_DIR || 'test-results/v3-home';
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
try {
 const context=await browser.newContext();
 if(process.env.V3_VISUAL_BRIDGE==='1') await installVisualBridge(context);
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*.supabase.co/**',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
 for (const path of ['/?pais=AR','/v3?pais=AR','/lite?pais=AR']) {
  const response = await page.goto(origin+path,{waitUntil:'networkidle',timeout:60000});
  assert.equal(response.status(),200);
  assert.equal(await page.locator('.v3-home').count(),1);
  assert.equal(await page.locator('.v3-header').count(),1);
  assert.equal(await page.locator('.v3-footer').count(),1);
  assert.equal(await page.locator('.rural-type-tabs button').count(),3);
  for(const width of [320,375,390,768,1280,1440,1920]) {
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path}: overflow ${width}`);
   const search=await page.locator('.v3-home-search button').boundingBox();
   assert.ok(search.width>=44&&search.height>=44,'search must be a usable touch target');
   await page.screenshot({path:`${evidence}/${path.startsWith('/lite')?'lite':path.startsWith('/v3')?'v3':'web'}-${width}.png`,animations:'disabled'});
  }
  // Filter selection changes the map and cards together, with specialized controls.
  await page.locator('.rural-type-tabs button').nth(1).click();
  assert.equal(await page.locator('select[name=operacion]').count(),1);
  assert.equal(await page.locator('.rural-service-card').count(),0);
  await page.locator('.rural-type-tabs button').nth(2).click();
  assert.equal(await page.locator('select[name=servicio]').count(),1);
  assert.equal(await page.locator('select[name=operacion]').count(),0);
  assert.equal(await page.locator('.rural-field-card').count(),0);
  await page.locator('.rural-type-tabs button').first().click();
  assert.equal(await page.locator('select[name=servicio],select[name=operacion]').count(),0);
  await page.locator('input[name=provincia]').fill('No existe esta zona 182873');
  await page.locator('.v3-home-search button').click();
  assert.equal(await page.locator('.rural-card-grid article').count(),0);
  await page.locator('.rural-result-toolbar button').click();
  await page.setViewportSize({width:375,height:900});
  await page.locator('.rural-mobile-toggle').click();
  assert.ok(await page.locator('.rural-map-panel').isVisible());
  assert.ok(!(await page.locator('.rural-results').isVisible()));
  await page.locator('.rural-mobile-toggle').click();
  assert.ok(await page.locator('.rural-results').isVisible());
  console.log('PASS responsive unified home, filter types, empty state, map/list',path);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(`${origin}/?pais=AR`,{waitUntil:'networkidle'});
 await page.locator('.rural-service-pin').first().click();
 assert.ok((await page.locator('.rural-map-selection').innerText()).includes('Cobertura'));
 assert.equal(await page.locator('.rural-service-card.v3-selected-card').count(),1);
 await page.locator('.rural-field-pin').first().click();
 assert.equal(await page.locator('.rural-field-card.v3-selected-card').count(),1);
 const box=await page.locator('.v3-map-canvas').boundingBox();
 await page.mouse.move(box.x+box.width-25,box.y+box.height*.6);
 await page.mouse.down();await page.mouse.move(box.x+25,box.y+box.height*.6,{steps:15});await page.mouse.up();
 await page.locator('.rural-result-toolbar').getByText('en esta zona',{exact:false}).waitFor();
 assert.equal(await page.locator('.rural-card-grid article').count(),0);
 await page.locator('.rural-map-controls').getByRole('button',{name:'Ver todo el país',exact:true}).click();
 assert.ok(await page.locator('.rural-card-grid article').count()>0);
 console.log('PASS colocated service/field markers select respective cards; map movement filters both types; reset restores');
 for(const [country,headline] of [['BR','Todo o campo.'],['US','All the countryside.']]) {
  await page.goto(`${origin}/?pais=${country}`,{waitUntil:'networkidle'});
  assert.ok((await page.locator('h1').innerText()).includes(headline));
  assert.equal(await page.locator('select[name=pais]').inputValue(),country);
  await page.locator('.rural-type-tabs button').nth(2).click();
  assert.equal(await page.locator('select[name=servicio]').count(),1);
  console.log('PASS localized unified country',country);
 }
 await page.goto(`${origin}/?pais=AR&tipo=campo&provincia=Santa%20Fe&operacion=alquiler&aptitud=agricola`,{waitUntil:'networkidle'});
 const detail=page.locator('.rural-card-grid .v3-listing-info').first();
 assert.ok(await detail.count(),'UAT must provide a field to verify detail return');
 await detail.click();
 await page.waitForURL('**/v3/campos/**');
 await page.locator('.v3-detail-back').click();
 await page.waitForURL('**/v3?**');
 assert.equal(await page.locator('input[name=provincia]').inputValue(),'Santa Fe');
 assert.equal(await page.locator('select[name=operacion]').inputValue(),'alquiler');
 assert.equal(await page.locator('select[name=aptitud]').inputValue(),'agricola');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS detail returns to unified search preserving applied filters; no JS errors');
} finally { await browser.close(); }
