// Read-only browser UAT. Requires the existing synthetic AR/Santa Fe listing.
// Run against a V3 preview or a local server configured with the UAT public key.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.V3_TEST_URL || 'http://127.0.0.1:3000';
const evidence = process.env.V3_EVIDENCE_DIR || 'test-results/v3';
mkdirSync(evidence, { recursive: true });
const assert=require('node:assert/strict');
const runFile = promisify(execFile);
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox'],...(process.env.HTTPS_PROXY ? {proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}} : {})});const context=await b.newContext();if (process.env.V3_TILE_BRIDGE === '1') {
  const tiles = new Map();
  await context.route('https://*.tile.openstreetmap.org/**', async route => {
    const url = route.request().url();
    if (!tiles.has(url)) tiles.set(url, runFile('curl', ['-fsS', '--max-time', '20', '--proxy', process.env.HTTPS_PROXY || '', '-A', 'RentoCampoPreviewQA/1.0', url], {encoding:'buffer', maxBuffer: 2 * 1024 * 1024}));
    try { const {stdout} = await tiles.get(url); await route.fulfill({contentType:'image/png',body:stdout}); }
    catch { await route.abort(); }
  });
}
const p=await context.newPage();const errors=[],failures=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failures.push({url:new URL(r.url()).hostname,error:r.failure()?.errorText}));let writes=0;await context.route('**/*.supabase.co/**',async route=>{if(!['GET','HEAD','OPTIONS'].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
async function go(path){const r=await p.goto(origin+path,{waitUntil:'networkidle',timeout:60000});assert.equal(r.status(),200,path);}
await go('/campos?pais=AR&operacion=alquiler&provincia=Santa+Fe');await p.locator('.v3-listing-card').first().waitFor();console.log('PASS canonical catalog alias');
for(const width of [320,360,375,390,430,768,1280,1440,1920]){await p.setViewportSize({width,height:900});await p.waitForTimeout(150);const ok=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);assert.ok(ok,`overflow ${width}`);const menu=p.locator('.v3-mobile-nav summary');if(width<850){const box=await menu.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width,`menu clipped ${width}`);}await p.screenshot({path:`${evidence}/campos-${width}.png`,animations:'disabled'});console.log('PASS responsive',width);}
await p.setViewportSize({width:1440,height:900});await p.locator('.v3-listing-info').first().click();await p.waitForURL('**/v3/campos/**');await p.locator('.v3-detail-back').waitFor();const back=await p.locator('.v3-detail-back').getAttribute('href');assert.equal(new URL(back,'http://localhost').searchParams.get('provincia'),'Santa Fe');assert.equal(new URL(back,'http://localhost').searchParams.get('operacion'),'alquiler');await p.locator('.v3-detail-back').click();await p.locator('.v3-listing-card').first().waitFor();console.log('PASS detail return preserves country and filters');
await p.setViewportSize({width:1440,height:900});
async function moveMapAway() {
  await p.locator('.v3-map-frame[aria-busy="false"]').waitFor();
  const box = await p.locator('.v3-map-canvas').boundingBox();
  await p.mouse.move(box.x + box.width - 25, box.y + box.height * .65);
  await p.mouse.down();
  await p.mouse.move(box.x + 25, box.y + box.height * .65, { steps: 15 });
  await p.mouse.up();
}
await moveMapAway();
await p.getByText('en esta zona del mapa', { exact: false }).waitFor();
await p.locator('.v3-marketplace-empty').waitFor({state:'visible'});
await p.getByRole('button',{name:'Ver todo el país',exact:true}).click();
await p.locator('.v3-listing-card').first().waitFor();
console.log('PASS move-map search filters results and reset restores them');
await p.getByLabel('Buscar al mover el mapa').uncheck();
await moveMapAway();
await p.getByRole('button',{name:'Buscar en esta zona',exact:true}).waitFor();
assert.ok(await p.locator('.v3-listing-card').first().isVisible());
await p.getByRole('button',{name:'Buscar en esta zona',exact:true}).click();
await p.locator('.v3-marketplace-empty').waitFor({state:'visible'});
await p.getByRole('button',{name:'Ver todo el país',exact:true}).click();
await p.locator('.v3-listing-card').first().waitFor();
console.log('PASS explicit area search waits for confirmation');
await p.setViewportSize({width:390,height:900});await p.getByRole('button',{name:'Ver mapa',exact:true}).click();await p.locator('.leaflet-marker-icon').first().click();await p.locator('.v3-map-selection').waitFor({state:'visible'});assert.ok(await p.locator('.v3-map-canvas').isVisible());const selectedLink = await p.locator('.v3-map-selection a').boundingBox();const toggleBox = await p.getByRole('button',{name:'Ver lista',exact:true}).boundingBox();assert.ok(selectedLink.y+selectedLink.height<=toggleBox.y || selectedLink.x+selectedLink.width<=toggleBox.x || selectedLink.x>=toggleBox.x+toggleBox.width,'Map/list control must not cover the detail link');await p.screenshot({path:`${evidence}/mobile-map-selected.png`,animations:'disabled'});console.log('PASS marker selection keeps map and selected listing visible');await p.getByRole('button',{name:'Ver lista',exact:true}).click();assert.ok(await p.locator('.v3-listing-card').first().isVisible());
await go('/campos/mapa?pais=AR&operacion=alquiler');assert.equal(new URL(p.url()).pathname,'/campos');assert.equal(new URL(p.url()).searchParams.get('operacion'),'alquiler');console.log('PASS legacy map redirect preserves query');
await go('/lite/campos/mapa?pais=AR&operacion=alquiler');assert.equal(new URL(p.url()).pathname,'/lite/campos');assert.ok(await p.locator('.v3-marketplace').isVisible());console.log('PASS App Lite unified catalog and redirect');
await go('/v3/campos?pais=BR');await p.locator('.v3-mobile-nav summary').click();await p.locator('.v3-mobile-nav').getByRole('link',{name:'Servicios rurales',exact:true}).click();await p.waitForURL('**/v3/servicios?pais=BR');console.log('PASS country retained between catalogs');
await go('/v3/campos?pais=AR&north=-30&south=-40&east=-55&west=-65');
await p.locator('.v3-listing-info').first().click();
await p.locator('.v3-detail-back').waitFor();
const boundedBack = await p.locator('.v3-detail-back').getAttribute('href');
assert.equal(new URL(boundedBack,'http://localhost').searchParams.get('north'),'-30.000000');
assert.equal(new URL(boundedBack,'http://localhost').searchParams.get('west'),'-65.000000');
console.log('PASS detail link preserves map area');
for(const route of ['/v3','/v3/servicios?pais=AR','/v3/mi-rentocampo']){await go(route);console.log('PASS route',route);}
console.log('pageerrors',JSON.stringify(errors));console.log('requestfailures',JSON.stringify(failures.slice(0,8)));assert.equal(errors.length,0);assert.equal(writes,0);console.log('PASS no browser Supabase writes');await b.close();})().catch(e=>{console.error(e);process.exit(1)});
