import test from 'node:test';
import assert from 'node:assert/strict';
import { safeAuthNext } from '../lib/auth/safe-next.ts';
test('authentication keeps legitimate web and Lite destinations with their filters', () => {
 for(const path of ['/perfil?elegir=rol','/v3/mi-rentocampo?pais=AR','/lite/cuenta/nueva-clave','/dashboard#cuenta']) assert.equal(safeAuthNext(path),path);
});
test('authentication rejects external, backslash and encoded redirect variants', () => {
 for(const path of ['https://example.org','//example.org','/\\example.org','/%5cexample.org','/%2fexample.org','/..//example.org','/\n/example.org','/%0a/example.org','/%zz',null,undefined]) assert.equal(safeAuthNext(path),'/dashboard');
 assert.equal(safeAuthNext('//example.org','/lite/perfil'),'/lite/perfil');
});
