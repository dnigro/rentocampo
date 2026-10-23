import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { isCountryCode, resolveCountry, COUNTRIES, COUNTRY_CODES, getCountrySubdivisions } from '../data/countries.ts';
import { campoFilterParams } from '../lib/campos/filter-params.ts';

for (const country of ['AR', 'UY', 'PY', 'CL', 'BO', 'PE', 'BR']) {
  test(`explicit ${country} overrides a different saved preference`, () => {
    assert.equal(resolveCountry(country, country === 'AR' ? 'PY' : 'AR'), country);
    assert.equal(isCountryCode(country), true);
  });
  test(`list/map round trip retains all ${country} filters`, () => {
    const filters = {pais:country, provincia:country === 'BR' ? 'São Paulo' : country === 'UY' ? 'Artigas' : country === 'PY' ? 'Itapúa' : country === 'CL' ? 'Maule' : country === 'BO' ? 'Santa Cruz' : country === 'PE' ? 'Junín' : 'Santa Fe', operacion:'alquiler', aptitud:'ganadera', disponibilidad:'inmediata', hectareas_min:'10', hectareas_max:'200', precio_min:'1', precio_max:'1000'};
    const map = campoFilterParams({...filters, page:'2', unknown:'discard'});
    assert.deepEqual(Object.fromEntries(map), filters);
    assert.deepEqual(Object.fromEntries(campoFilterParams(Object.fromEntries(map))), filters);
  });
}
test('country fallback uses saved preference and rejects unsupported values', () => {
  assert.equal(resolveCountry(undefined, 'UY'), 'UY');
  assert.equal(resolveCountry('invalid', 'PY'), 'PY');
  assert.equal(resolveCountry('invalid', 'invalid'), 'AR');
  assert.equal(isCountryCode('admin'), false);
});
test('subdivision labels distinguish countries', () => {
  assert.equal(COUNTRIES.AR.subdivisionLabel, 'Provincia');
  assert.equal(COUNTRIES.UY.subdivisionLabel, 'Departamento');
  assert.equal(COUNTRIES.PY.subdivisionLabel, 'Departamento');
  assert.equal(COUNTRIES.CL.subdivisionLabel, 'Región');
  assert.equal(COUNTRIES.BO.subdivisionLabel, 'Departamento');
  assert.equal(COUNTRIES.PE.subdivisionLabel, 'Departamento');
});

const {enforceUatIsolation} = await import('../lib/uat-isolation.ts');
for (const target of ['production','development']) test(`UAT guard leaves ${target} unchanged`, () => {
 const env={VERCEL_ENV:target,VERCEL_GIT_COMMIT_REF:'feat/regional-six-countries-20261015',RESEND_API_KEY:'fixture'};
 const before={...env};enforceUatIsolation(env);assert.deepEqual(env,before);
});
test('UAT preview removes inherited private/paid credentials while keeping public Auth available', () => {
 const env={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/regional-six-countries-20261015',NEXT_PUBLIC_SUPABASE_URL:'https://wibqszhvuvpjycheaxzi.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',SUPABASE_SERVICE_ROLE_KEY:'wrong-project-fixture',RESEND_API_KEY:'fixture',MERCADOPAGO_ACCESS_TOKEN:'fixture',POSTGRES_URL:'fixture',CRON_SECRET:'fixture'};
 enforceUatIsolation(env);
 for(const key of ['SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','MERCADOPAGO_ACCESS_TOKEN','POSTGRES_URL','CRON_SECRET']) assert.equal(env[key],undefined);
 assert.equal(env.NEXT_PUBLIC_SUPABASE_URL,'https://wibqszhvuvpjycheaxzi.supabase.co');
});
test('UAT preview cannot start against another database', () => {
 assert.throws(()=>enforceUatIsolation({VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/regional-six-countries-20261015',NEXT_PUBLIC_SUPABASE_URL:'https://other.invalid'}),/UAT isolation/);
});


test('Brazil exposes all 27 federative units and BRL/pt-BR configuration', () => {
  const states = getCountrySubdivisions('BR');
  assert.equal(states.length, 27);
  assert.equal(new Set(states).size, 27);
  assert.ok(states.includes('Distrito Federal'));
  assert.ok(states.includes('São Paulo'));
  assert.ok(states.includes('Mato Grosso'));
  assert.equal(COUNTRIES.BR.locale, 'pt-BR');
  assert.equal(COUNTRIES.BR.currency, 'BRL');
  assert.equal(COUNTRIES.BR.subdivisionLabel, 'Estado');
  assert.equal(resolveCountry(undefined, 'BR'), 'BR');
});

test('Brazil preview fails closed without isolated credentials', () => {
  assert.throws(() => enforceUatIsolation({VERCEL_ENV:'preview', VERCEL_GIT_COMMIT_REF:'feat/brasil-foundation-20261019'}), /UAT isolation/);
});

test('Brazil UAT branch overrides an inherited production publishable key', () => {
  const base = {
    VERCEL_ENV: 'preview',
    VERCEL_GIT_COMMIT_REF: 'feat/brasil-foundation-20261019',
    NEXT_PUBLIC_SUPABASE_URL: 'https://production.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_wrong',
    UAT_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_uat_fixture',
  };
  assert.throws(() => enforceUatIsolation({ ...base, UAT_SUPABASE_PUBLISHABLE_KEY: undefined }), /branch-specific UAT credentials/);
  enforceUatIsolation(base);
  assert.equal(base.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'sb_publishable_uat_fixture');
  assert.equal(base.NEXT_PUBLIC_SUPABASE_URL, 'https://wibqszhvuvpjycheaxzi.supabase.co');
});

for (const code of ['MX','GT','SV','HN','NI','CR','PA','CO','EC','VE','DO']) {
  test('LATAM '+code+' routing, subdivisions and country map', () => {
    assert.equal(isCountryCode(code), true);
    assert.equal(resolveCountry(code, 'AR'), code);
    assert.ok(getCountrySubdivisions(code).length >= 7);
    assert.equal(new Set(getCountrySubdivisions(code)).size, getCountrySubdivisions(code).length);
    assert.equal(COUNTRIES[code].mapCenter.length, 2);
    const params=campoFilterParams({pais:code, operacion:'alquiler', provincia:getCountrySubdivisions(code)[0]});
    assert.equal(params.get('pais'), code);
    assert.equal(params.get('provincia'), getCountrySubdivisions(code)[0]);
  });
}
test('Mexico pilot: all 32 states, localization and currency', () => {
  assert.equal(getCountrySubdivisions('MX').length, 32);
  assert.ok(getCountrySubdivisions('MX').includes('Sinaloa'));
  assert.ok(getCountrySubdivisions('MX').includes('Ciudad de México'));
  assert.equal(COUNTRIES.MX.locale, 'es-MX');
  assert.equal(COUNTRIES.MX.currency, 'MXN');
});
test('LATAM preview fails closed without dedicated UAT credentials', () => {
  assert.throws(() => enforceUatIsolation({VERCEL_ENV:'preview', VERCEL_GIT_COMMIT_REF:'feat/latam18-mx-uat-20261023',
    NEXT_PUBLIC_SUPABASE_URL:'https://production.invalid', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prod'}), /UAT isolation/);
  const env={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/latam18-mx-uat-20261023', NEXT_PUBLIC_SUPABASE_URL:'https://production.invalid',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_prod',UAT_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_uat_fixture'};
  enforceUatIsolation(env);
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, 'https://wibqszhvuvpjycheaxzi.supabase.co');
  assert.equal(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'sb_publishable_uat_fixture');
});

// The homepage must be derived from the same ISO catalog as selectors and filters.
test('LATAM18 homepage displays both lines of ISO country abbreviations', () => {
  const hero=readFileSync(new URL('../components/landing/LandingTriptychHero.tsx', import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles/hero-2026-isolated.css', import.meta.url),'utf8');
  assert.equal(COUNTRY_CODES.length,18);
  assert.match(hero,/COUNTRY_CODES\.slice\(0,9\)\.join/);
  assert.match(hero,/COUNTRY_CODES\.slice\(9\)\.join/);
  assert.ok(!hero.includes('AR · UY · PY · CL · BO · PE · BR</p>'));
  assert.match(css,/\.rcHero26__countries span/);
});
test('LATAM18 map zoning catalog has four valid geolocated references per new country', async () => {
  const { EXPANSION_COUNTRY_CODES, EXPANSION_REGIONS, EXPANSION_SUBDIVISIONS, EXPANSION_COUNTRIES }=await import('../data/latam-expansion.ts');
  const map=readFileSync(new URL('../components/campos/CampoMapa.tsx', import.meta.url),'utf8');
  assert.match(map,/ZONAS_PRODUCTIVAS_LATAM\.filter\(/);
  assert.match(map,/Región productiva de referencia/);
  assert.equal(EXPANSION_COUNTRY_CODES.length,11);
  const points=[];
  for(const code of EXPANSION_COUNTRY_CODES){
    assert.equal(EXPANSION_COUNTRIES[code].currency,COUNTRIES[code].currency);
    assert.equal(EXPANSION_REGIONS[code].length,4);
    for(const z of EXPANSION_REGIONS[code]){
      assert.ok(EXPANSION_SUBDIVISIONS[code].includes(z.subdivision),code+':'+z.subdivision);
      assert.ok(z.latitud>=-90&&z.latitud<=90);
      assert.ok(z.longitud>=-180&&z.longitud<=180);
      points.push(z);
    }
  }
  assert.equal(points.length,44);
});

// Every new country's UAT fixture must be discoverable on map and service listing.
test('LATAM18 demo services are visible by explicit ID in both public service views', async () => {
  const map=readFileSync(new URL('../app/(public)/campos/mapa/page.tsx',import.meta.url),'utf8');
  const list=readFileSync(new URL('../app/(public)/servicios-rurales/page.tsx',import.meta.url),'utf8');
  const ids=readFileSync(new URL('../data/visible-demo-services.ts',import.meta.url),'utf8');
  assert.match(map,/esServicioDemoVisible\(String\(prestador\.id\)\)/);
  assert.match(list,/esServicioDemoVisible\(item\.id\)/);
  assert.match(ids,/EXPANSION_COUNTRY_CODES\.map/);
  assert.match(ids,/101 \+ index/);
  assert.ok(!ids.includes('startsWith(id)'));
});
