import test from "node:test";
import assert from "node:assert/strict";
import {
  isCommercialAccount,
  isCommercialPublication,
  isActiveCommercialLand,
  isActiveCommercialService,
  isCommercialContact,
} from "../lib/analytics/commercial-filters.ts";

const real = { email: "productor@example.org", email_confirmed_at: "2026-10-01T00:00:00Z" };
const internal = { email: " DANTENIGRO@gmail.com ", email_confirmed_at: "2026-10-01T00:00:00Z" };
const unconfirmed = { email: "productor@example.org", email_confirmed_at: null };

test("only confirmed, non-internal accounts enter commercial indicators", () => {
  assert.equal(isCommercialAccount(real), true);
  assert.equal(isCommercialAccount(internal), false);
  assert.equal(isCommercialAccount({ email: "dantednigro@gmail.com", email_confirmed_at: "2026-10-01" }), false);
  assert.equal(isCommercialAccount(unconfirmed), false);
  assert.equal(isCommercialAccount({ email: null, email_confirmed_at: "2026-10-01" }), false);
});

test("demo and test publications are excluded even if active", () => {
  assert.equal(isCommercialPublication({ titulo: "Campo DEMO AR" }), false);
  assert.equal(isCommercialPublication({ ambiente: "prueba" }), false);
  assert.equal(isCommercialPublication({ titulo: "Test de campo" }), false);
  assert.equal(isCommercialPublication({ is_demo: true, titulo: "Campo válido" }), false);
  assert.equal(isCommercialPublication({ titulo: "Campo productivo de Santa Fe" }), true);
});

test("commercial active lands and services require real owners", () => {
  assert.equal(isActiveCommercialLand({ titulo: "Campo agrícola", status: "activo", owner: real }), true);
  assert.equal(isActiveCommercialLand({ titulo: "Campo agrícola", status: "pausado", owner: real }), false);
  assert.equal(isActiveCommercialLand({ titulo: "Campo agrícola DEMO", status: "activo", owner: real }), false);
  assert.equal(isActiveCommercialService({ titulo: "Servicios mecánicos", activo: true, owner: real }), true);
  assert.equal(isActiveCommercialService({ titulo: "DEMO servicios", activo: true, owner: real }), false);
  assert.equal(isActiveCommercialService({ titulo: "Servicios", activo: true, owner: internal }), false);
  assert.equal(isActiveCommercialService({ titulo: "Servicios", activo: false, owner: real }), false);
});

test("internal or unconfirmed contact does not count as a real inquiry", () => {
  assert.equal(isCommercialContact(real, real), true);
  assert.equal(isCommercialContact(real, internal), false);
  assert.equal(isCommercialContact(unconfirmed, real), false);
});
