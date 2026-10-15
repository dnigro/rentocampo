import test from 'node:test';
import assert from 'node:assert/strict';
import { isCountryCode, resolveCountry, COUNTRIES } from '../data/countries.ts';
import { campoFilterParams } from '../lib/campos/filter-params.ts';

for (const country of ['AR', 'UY', 'PY']) {
  test(`explicit ${country} overrides a different saved preference`, () => {
    assert.equal(resolveCountry(country, country === 'AR' ? 'PY' : 'AR'), country);
    assert.equal(isCountryCode(country), true);
  });
  test(`list/map round trip retains all ${country} filters`, () => {
    const filters = {pais:country, provincia:country === 'UY' ? 'Artigas' : country === 'PY' ? 'Itapúa' : 'Santa Fe', operacion:'alquiler', aptitud:'ganadera', disponibilidad:'inmediata', hectareas_min:'10', hectareas_max:'200', precio_min:'1', precio_max:'1000'};
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
test('subdivision labels distinguish Argentina from UY/PY', () => {
  assert.equal(COUNTRIES.AR.subdivisionLabel, 'Provincia');
  assert.equal(COUNTRIES.UY.subdivisionLabel, 'Departamento');
  assert.equal(COUNTRIES.PY.subdivisionLabel, 'Departamento');
});

const {enforceUatIsolation} = await import('../lib/uat-isolation.ts');
for (const target of ['production','development']) test(`UAT guard leaves ${target} unchanged`, () => {
 const env={VERCEL_ENV:target,VERCEL_GIT_COMMIT_REF:'feat/regional-ar-uy-py-20261014',RESEND_API_KEY:'fixture'};
 const before={...env};enforceUatIsolation(env);assert.deepEqual(env,before);
});
test('UAT preview removes inherited private/paid credentials while keeping public Auth available', () => {
 const env={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/regional-ar-uy-py-20261014',NEXT_PUBLIC_SUPABASE_URL:'https://wibqszhvuvpjycheaxzi.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'wrong-project-fixture',RESEND_API_KEY:'fixture',MERCADOPAGO_ACCESS_TOKEN:'fixture',POSTGRES_URL:'fixture',CRON_SECRET:'fixture'};
 enforceUatIsolation(env);
 for(const key of ['SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','MERCADOPAGO_ACCESS_TOKEN','POSTGRES_URL','CRON_SECRET']) assert.equal(env[key],undefined);
 assert.equal(env.NEXT_PUBLIC_SUPABASE_URL,'https://wibqszhvuvpjycheaxzi.supabase.co');
});
test('UAT preview cannot start against another database', () => {
 assert.throws(()=>enforceUatIsolation({VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/regional-ar-uy-py-20261014',NEXT_PUBLIC_SUPABASE_URL:'https://other.invalid'}),/UAT isolation/);
});
