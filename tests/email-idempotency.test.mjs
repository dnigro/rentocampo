import test from 'node:test';
import assert from 'node:assert/strict';
import { emailEventKey } from '../lib/email-idempotency.ts';
test('email retries reuse a stable key without exposing recipient addresses',()=>{
 const key=emailEventKey('plan-expiry','synthetic@example.org','2027-01-01','7d');
 assert.equal(emailEventKey('plan-expiry','synthetic@example.org','2027-01-01','7d'),key);
 assert.equal(key.includes('synthetic@example.org'),false);
 assert.notEqual(emailEventKey('plan-expiry','synthetic@example.org','2027-01-01','1d'),key);
 assert.notEqual(emailEventKey('campo-message','1'),emailEventKey('direct-message','1'));
});
