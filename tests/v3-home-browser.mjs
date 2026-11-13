import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.V3_TEST_URL || 'http://127.0.0.1:3000';
const evidence = process.env.V3_EVIDENCE_DIR || 'test-results/v3-home';
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page = await browser.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*.supabase.co/**',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
 for (const path of ['/?pais=AR','/v3?pais=AR','/lite?pais=AR']) {
  const response = await page.goto(origin+path,{waitUntil:'networkidle',timeout:60000});
  assert.equal(response.status(),200);
  assert.equal(await page.locator('.v3-home').count(),1);
  assert.equal(await page.locator('.v3-header').count(),1);
  assert.equal(await page.locator('.v3-footer').count(),1);
  for(const width of [320,375,390,768,1280,1440,1920]) {
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path}: overflow ${width}`);
   const search=await page.locator('.v3-home-search button').boundingBox();
   assert.ok(search.width>=44&&search.height>=44,'search must be a usable touch target');
   await page.screenshot({path:`${evidence}/${path.startsWith('/lite')?'lite':path.startsWith('/v3')?'v3':'web'}-${width}.png`,animations:'disabled'});
  }
  console.log('PASS responsive home',path);
 }
 for(const [country,headline] of [['BR','Todo o campo.'],['US','All the countryside.']]) {
  await page.goto(`${origin}/?pais=${country}`,{waitUntil:'networkidle'});
  assert.ok((await page.locator('h1').innerText()).includes(headline));
  assert.equal(await page.locator('select[name=pais]').inputValue(),country);
  for(const link of await page.locator('.v3-home-categories a,.v3-home-paths a').all()) assert.equal(new URL(await link.getAttribute('href'),origin).searchParams.get('pais'),country);
  console.log('PASS localized country navigation',country);
 }
 await page.goto(`${origin}/?pais=AR`,{waitUntil:'networkidle'});
 await page.locator('select[name=operacion]').selectOption('venta');
 await page.locator('input[name=provincia]').fill('Santa Fe');
 await page.locator('select[name=aptitud]').selectOption('ganadera');
 await page.locator('.v3-home-search button').click();
 await page.waitForURL('**/v3/campos?**');
 const query=new URL(page.url()).searchParams;
 for(const [name,value] of [['pais','AR'],['operacion','venta'],['provincia','Santa Fe'],['aptitud','ganadera']]) assert.equal(query.get(name),value);
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS home search preserves all filters; no JavaScript errors');
} finally { await browser.close(); }
