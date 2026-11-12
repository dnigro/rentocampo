// Local-only synthetic fixture. Never creates users or database records.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.V3_TEST_URL || 'http://127.0.0.1:3000';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw Error('Run gallery fixtures only on a local development server.');
const fixture = new URL('../app/v3/qa-gallery-fixture/', import.meta.url);
if (existsSync(fixture)) throw Error('Fixture directory already exists; refusing to overwrite it.');
let browser;
try {
  mkdirSync(fixture);
  writeFileSync(new URL('page.tsx', fixture), `import Gallery from "../components/V3PhotoGallery";
import Photos from "../components/V3CardPhotos";
const photos = Array.from({ length: 8 }, () => "/rentocampo-hero-campo-bn-1920x1080.webp");
export default function QA() { return <div className="v3-detail"><h1>Fixture sintética temporal</h1><Gallery photos={photos} title="Campo de prueba"/><div className="v3-listing-media" style={{width:300,marginTop:20}}><Photos photos={photos} href="/v3/campos?pais=AR" title="Campo de prueba"/></div></div>; }
`);
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await page.goto(`${origin}/v3/qa-gallery-fixture`, { waitUntil: 'networkidle' });
    if (response.status() === 200) break;
    await page.waitForTimeout(500);
  }
  await page.getByRole('button', { name: 'Ver 8 fotos', exact: true }).click();
  const dialog = page.getByRole('dialog');
  assert.ok(await dialog.isVisible());
  await page.keyboard.press('ArrowLeft');
  assert.ok(await dialog.getByText('Foto 8 de 8').isVisible());
  await page.keyboard.press('ArrowRight');
  assert.ok(await dialog.getByText('Foto 1 de 8').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(), false);
  assert.ok(await page.getByRole('button', { name: 'Ver 8 fotos', exact: true }).evaluate(element => element === document.activeElement));
  await page.getByRole('button', { name: 'Foto siguiente de Campo de prueba', exact: true }).click();
  assert.ok(await page.getByText('2 / 8', { exact: true }).isVisible());
  console.log('PASS gallery: eight photos, keyboard wrap, Escape, focus return, card carousel');
} finally {
  await browser?.close();
  rmSync(fixture, { recursive: true, force: true });
}
