import test from 'node:test';
import assert from 'node:assert/strict';
import { v3Routes } from '../lib/v3-routing.ts';
import { campoFilterParams } from '../lib/campos/filter-params.ts';

for (const branch of ['feature/rentocampo-v3', 'codex/rentocampo-v3-review-20261112', 'codex/rentocampo-v3-rc-20261113']) {
  test(`V3 preview routes support web and Lite on ${branch}`, () => {
    const routes = v3Routes({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: branch });
    assert.deepEqual(routes.rewrites.beforeFiles.find(r => r.source === "/lite/servicios"), {source:"/lite/servicios",destination:"/v3/servicios"});
    for (const prefix of ['', '/lite']) {
      assert.deepEqual(routes.redirects.find(r => r.source === `${prefix}/campos/mapa`), {
        source: `${prefix}/campos/mapa`, destination: `${prefix}/campos`, permanent: false,
      });
      assert.deepEqual(routes.rewrites.beforeFiles.find(r => r.source === `${prefix}/campos`), {
        source: `${prefix}/campos`, destination: '/v3/campos',
      });
    }
  });
}

test('production, local and unrelated branches retain the current routes', () => {
  for (const env of [ {}, { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'feature/rentocampo-v3' },
    { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'main' } ]) {
    assert.deepEqual(v3Routes(env), { redirects: [], rewrites: { beforeFiles: [] } });
  }
});

test('detail return query preserves allowed filters and safely encodes location', () => {
  const params = campoFilterParams({ pais: 'BR', provincia: 'São Paulo & região', operacion: 'alquiler',
    hectareas_min: '50', precio_max: '1000', next: 'https://example.com' });
  assert.equal(params.get('pais'), 'BR');
  assert.equal(params.get('provincia'), 'São Paulo & região');
  assert.equal(new URLSearchParams(params.toString()).get('precio_max'), '1000');
  assert.equal(params.has('next'), false);
});

test('the production branch activates the V3 catalog and Lite routes', () => {
  const routes = v3Routes({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' });
  assert.ok(routes.rewrites.beforeFiles.some(route => route.source === '/campos' && route.destination === '/v3/campos'));
  assert.ok(routes.rewrites.beforeFiles.some(route => route.source === '/lite' && route.destination === '/v3'));
});
