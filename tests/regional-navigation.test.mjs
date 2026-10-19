import test from 'node:test';
import assert from 'node:assert/strict';
import { isCountryCode, resolveCountry, COUNTRIES, getCountrySubdivisions } from '../data/countries.ts';
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

test('Brazil UAT branch rejects an inherited public production key even with valid publishable format', () => {
  const base = {
    VERCEL_ENV: 'preview',
    VERCEL_GIT_COMMIT_REF: 'feat/brasil-foundation-20261019',
    NEXT_PUBLIC_SUPABASE_URL: 'https://wibqszhvuvpjycheaxzi.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_wrong',
    UAT_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_uat_fixture',
  };
  assert.throws(() => enforceUatIsolation({ ...base }), /Brazil preview public key/);
  const valid = { ...base, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: base.UAT_SUPABASE_PUBLISHABLE_KEY };
  enforceUatIsolation(valid);
  assert.equal(valid.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, base.UAT_SUPABASE_PUBLISHABLE_KEY);
  assert.equal(valid.NEXT_PUBLIC_SUPABASE_URL, 'https://wibqszhvuvpjycheaxzi.supabase.co');
});
