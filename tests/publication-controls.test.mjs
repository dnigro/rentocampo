import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function source(path) {
  return readFileSync(new URL("../" + path, import.meta.url), "utf8");
}

// Executa el módulo real TS en Node, sin duplicar expresiones regulares en el test.
const exports = {};
const compiled = ts.transpileModule(source("lib/publication-content-guard.ts"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
runInNewContext(compiled, { exports });

const { errorTextoPublico, errorCampoPublico, errorServicioPublico } = exports;

const campoValido = {
  titulo: "Campo agrícola 240 ha en Córdoba",
  descripcion: "Producción extensiva con acceso rural, agua y galpones en buen estado.",
  ubicacion: "Marcos Juárez, Córdoba",
  provincia: "Córdoba",
  departamento: "Marcos Juárez",
  localidad: "Marcos Juárez",
  hectareas: 240,
  aptitud: "agricola",
  operacion: "alquiler",
  disponibilidad: "a_convenir",
  latitud: -32.69,
  longitud: -62.11,
};

const servicioValido = {
  country_code: "AR",
  nombre_comercial: "Agroservicios Norte",
  detalle: "Trabajo de cosecha y siembra con maquinaria propia y cobertura regional.",
  zona: "Rafaela y localidades cercanas",
  provincia: "Santa Fe",
  localidad: "Rafaela",
  latitud: -31.25,
  longitud: -61.48,
  servicios_rurales: ["cosecha", "siembra"],
  fotos_urls: ["https://images.example.net/photo.jpg"],
};

test("permite textos descriptivos reales, cantidades y temporadas", () => {
  for (const text of ["Campo 240 ha Córdoba", "Cosecha de trigo campaña 2026", "Agroservicios López y Asociados", "Alquiler 1000 hectáreas"]) {
    assert.equal(errorTextoPublico(text, "Título", { required: true, min: 5, max: 100 }), null, text);
  }
});

test("rechaza datos de contacto en textos públicos", () => {
  for (const text of [
    "Llamame al +54 9 11 1234-5678",
    "Escribime a productor@example.com",
    "Contactar www.ejemplo.com",
    "Encontrame en https://ejemplo.org",
    "Seguime @agro_servicios",
    "Contáctame por WhatsApp",
  ]) {
    assert.match(errorTextoPublico(text, "Descripción", { max: 2500 }) ?? "", /chat/i, text);
  }
});

test("validación del campo incluye títulos, ubicación, superficie y precio", () => {
  assert.equal(errorCampoPublico(campoValido), null);
  assert.equal(errorCampoPublico({ ...campoValido, titulo: "A".repeat(70) }), null);
  assert.match(errorCampoPublico({ ...campoValido, titulo: "A".repeat(71) }), /máximo 70/);
  assert.equal(errorCampoPublico({ ...campoValido, titulo: "A".repeat(71) }, 100), null);
  assert.match(errorCampoPublico({ ...campoValido, titulo: "12345" }) ?? "", /descriptivo/);
  assert.match(errorCampoPublico({ ...campoValido, descripcion: "Tel. 11 5555-6666" }) ?? "", /chat/i);
  assert.match(errorCampoPublico({ ...campoValido, hectareas: 0 }) ?? "", /Superficie/);
  assert.match(errorCampoPublico({ ...campoValido, precio: -1 }) ?? "", /Precio/);
  assert.match(errorCampoPublico({ ...campoValido, longitud: undefined }) ?? "", /mapa/);
});

test("servicios controla rubros, foto, nombre y contacto", () => {
  assert.equal(errorServicioPublico(servicioValido, ["cosecha", "siembra"]), null);
  assert.equal(errorServicioPublico({ ...servicioValido, nombre_comercial: "A".repeat(70) }, ["cosecha", "siembra"]), null);
  assert.match(errorServicioPublico({ ...servicioValido, nombre_comercial: "A".repeat(71) }, ["cosecha", "siembra"]), /máximo 70/);
  assert.match(errorServicioPublico({ ...servicioValido, detalle: "Mi email es contacto@campo.com" }, ["cosecha", "siembra"]) ?? "", /chat/i);
  assert.match(errorServicioPublico({ ...servicioValido, servicios_rurales: ["cosecha", "cosecha"] }, ["cosecha", "siembra"]) ?? "", /sin repetirlas/);
  assert.match(errorServicioPublico({ ...servicioValido, fotos_urls: [] }, ["cosecha", "siembra"]) ?? "", /imágenes/);
  assert.match(errorServicioPublico({ ...servicioValido, nombre_comercial: "" }, ["cosecha", "siembra"]) ?? "", /Completá/);
});

test("ambos formularios pasan por validaciones de servidor y el header no duplica CTAs", () => {
  const nav = source("components/layout/Navbar.tsx");
  const fieldApi = source("app/api/campos/publicar/route.ts");
  const serviceApi = source("app/api/servicios/publicar/route.ts");
  const form = source("components/servicios/ServicioRuralForm.tsx");
  assert.doesNotMatch(nav, /className="navbar-register-btn"|className="navbar-mobile-signup"|className="btn-primary"/);
  assert.match(nav, /href="\/login"/);
  assert.match(fieldApi, /errorCampoPublico\(form\)/);
  assert.match(serviceApi, /errorServicioPublico\(data, validServices, titleMax\)/);
  assert.match(serviceApi, /propietario_id: user.id/);
  assert.match(form, /fetch\("\/api\/servicios\/publicar"/);
  assert.doesNotMatch(form, /supabase\.from\("servicios_publicaciones"\)/);
});


function loadServiceApi(userId, writeSpy, { active = true } = {}) {
  const mockClient = {
    auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null } }) },
    from(table) {
      if (table === "profiles") return {
        select() { return { eq() { return { async maybeSingle() { return { data: { activo: active }, error: null }; } }; } }; },
      };
      assert.equal(table, "servicios_publicaciones");
      return {
        async insert(row) {
          writeSpy.push({ action: "insert", row });
          return { error: null };
        },
        update(row) {
          writeSpy.push({ action: "update", row });
          const query = {
            eq() { return query; },
            select() { return query; },
            async maybeSingle() { return { data: { id: "a".repeat(36) }, error: null }; },
          };
          return query;
        },
      };
    },
  };
  const mocks = {
    "next/server": { NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200 }) } },
    "@/lib/supabase/server": { createClient: async () => mockClient },
    "@/lib/supabase/admin": { createAdminClient: () => mockClient },
    "@/data/countries": { isCountryCode: code => ["AR", "US", "BR"].includes(code) },
    "@/data/servicios-rurales": { SERVICIOS_RURALES: ["cosecha", "siembra"].map(value => ({ value })) },
    "@/lib/publication-content-guard": { errorServicioPublico },
  };
  const apiExports = {};
  const apiCode = ts.transpileModule(source("app/api/servicios/publicar/route.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(apiCode, { exports: apiExports, require: name => {
    assert.ok(name in mocks, "unexpected import: " + name);
    return mocks[name];
  }});
  return apiExports;
}

test("la API de servicios requiere sesión y bloquea entradas inválidas", async () => {
  const writes = [];
  const anonymous = loadServiceApi(null, writes);
  const denied = await anonymous.POST({ json: async () => servicioValido });
  assert.equal(denied.status, 401);
  const owner = loadServiceApi("owner-123", writes);
  const rejected = await owner.POST({ json: async () => ({ ...servicioValido, detalle: "llamame al +54 11 1234-5678" }) });
  assert.equal(rejected.status, 400);
  assert.equal(writes.length, 0, "invalid listings should not reach storage");
});

test("API asigna el dueño autenticado e impide que el cliente se imponga como propietario", async () => {
  const writes = [];
  const api = loadServiceApi("owner-123", writes);
  const response = await api.POST({ json: async () => ({ ...servicioValido, propietario_id: "other-user" }) });
  assert.equal(response.status, 201);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].row.propietario_id, "owner-123");
  assert.equal(writes[0].row.nombre_comercial, "Agroservicios Norte");

  const updated = await api.PATCH({ json: async () => ({ id: "a".repeat(36), form: servicioValido }) });
  assert.equal(updated.status, 200);
  assert.equal(writes[1].action, "update");
  assert.equal("propietario_id" in writes[1].row, false);
});

test("publication status changes require a server session, owner filter and server-only write privileges", () => {
  const fieldStatus = source("app/api/campos/estado/route.ts");
  const serviceStatus = source("app/api/servicios/estado/route.ts");
  const fieldWrite = source("app/api/campos/publicar/route.ts");
  const serviceWrite = source("app/api/servicios/publicar/route.ts");
  const sql = source("supabase/migrations/20261108173433_server_only_publication_writes.sql");
  for (const route of [fieldStatus, serviceStatus]) {
    assert.ok(route.includes("client.auth.getUser()"));
    assert.ok(route.includes('.eq("propietario_id", user.id)'));
    assert.ok(route.includes("createAdminClient()"));
  }
  assert.ok(!fieldWrite.includes("if (FREE_PUBLICATIONS_ENABLED) return { user, admin: supabase }"));
  assert.ok(serviceWrite.includes('createAdminClient().from("servicios_publicaciones")'));
  assert.match(sql, /REVOKE INSERT, UPDATE ON TABLE public.campos/);
  assert.match(sql, /REVOKE INSERT, UPDATE ON TABLE public.servicios_publicaciones/);
});


function loadStatusRoute(path, scenario = {}) {
  const userId = scenario.user === undefined ? "owner-1" : scenario.user;
  const operations = [];
  const mockedAdmin = {
    from(table) {
      const makeQuery = (operation, payload) => {
        const filters = [];
        const query = {
          eq(column, value) { filters.push([column, value]); return query; },
          select() { return query; },
          async maybeSingle() {
            operations.push({ table, operation, payload, filters: [...filters] });
            if (operation === "read") {
              return { data: scenario.owned === false ? null : { id: filters[0]?.[1], status: scenario.currentStatus ?? "pausado" }, error: null };
            }
            return { data: scenario.owned === false ? null : { id: filters[0]?.[1] }, error: null };
          },
          then(resolve, reject) {
            operations.push({ table, operation, payload, filters: [...filters] });
            return Promise.resolve({ error: scenario.writeError ?? null }).then(resolve, reject);
          },
        };
        return query;
      };
      return {
        select() { return makeQuery("read"); },
        update(payload) { return makeQuery("update", payload); },
      };
    },
  };
  const mocks = {
    "next/server": { NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200 }) } },
    "@/lib/supabase/server": { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null } }) },
      from(table) {
        assert.equal(table, "profiles");
        return { select() { return { eq() { return { async maybeSingle() {
          return { data: { activo: scenario.active !== false }, error: null };
        } }; } }; } };
      },
    }) },
    "@/lib/supabase/admin": { createAdminClient: () => mockedAdmin },
    "@/lib/billing/land-quota": {
      getLandQuotaStatus: async () => ({ canPublish: scenario.quota !== false }),
      consumeLandPublicationQuota: async () => ({ ok: scenario.consumed !== false, code: "quota_exhausted" }),
    },
  };
  const exports = {};
  const compiled = ts.transpileModule(source(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(compiled, { exports, require: name => {
    assert.ok(Object.hasOwn(mocks, name), "Unexpected import: " + name);
    return mocks[name];
  }});
  return { api: exports, operations };
}

const statusId = "123e4567-e89b-42d3-a456-426614174000";

test("field status API rejects anonymous and invalid requests before admin access", async () => {
  const anonymous = loadStatusRoute("app/api/campos/estado/route.ts", { user: null });
  assert.equal((await anonymous.api.PATCH({ json: async () => ({ id: statusId, status: "activo" }) })).status, 401);
  assert.equal(anonymous.operations.length, 0);
  const invalid = loadStatusRoute("app/api/campos/estado/route.ts");
  assert.equal((await invalid.api.PATCH({ json: async () => ({ id: "bad", status: "activo" }) })).status, 400);
  assert.equal(invalid.operations.length, 0);
});

test("field status cannot be changed by someone other than the owner", async () => {
  const forbidden = loadStatusRoute("app/api/campos/estado/route.ts", { owned: false });
  const response = await forbidden.api.PATCH({ json: async () => ({ id: statusId, status: "activo" }) });
  assert.equal(response.status, 404);
  assert.equal(forbidden.operations.filter(x => x.operation === "update").length, 0);
  assert.deepEqual(Array.from(forbidden.operations[0].filters, x => Array.from(x)), [
    ["id", statusId], ["propietario_id", "owner-1"],
  ]);
});

test("field activation checks quota and owner-scoped write", async () => {
  const exhausted = loadStatusRoute("app/api/campos/estado/route.ts", { quota: false });
  assert.equal((await exhausted.api.PATCH({ json: async () => ({ id: statusId, status: "activo" }) })).status, 409);
  assert.equal(exhausted.operations.filter(x => x.operation === "update").length, 0);
  const allowed = loadStatusRoute("app/api/campos/estado/route.ts");
  assert.equal((await allowed.api.PATCH({ json: async () => ({ id: statusId, status: "activo" }) })).status, 200);
  const mutation = allowed.operations.find(x => x.operation === "update");
  assert.equal(mutation.payload.status, "activo");
  assert.deepEqual(Array.from(mutation.filters, x => Array.from(x)), [
    ["id", statusId], ["propietario_id", "owner-1"],
  ]);
});

test("service activation must be authenticated and strictly scoped to the owner", async () => {
  const anonymous = loadStatusRoute("app/api/servicios/estado/route.ts", { user: null });
  assert.equal((await anonymous.api.PATCH({ json: async () => ({ id: statusId, activo: true }) })).status, 401);
  const invalid = loadStatusRoute("app/api/servicios/estado/route.ts");
  assert.equal((await invalid.api.PATCH({ json: async () => ({ id: statusId, activo: "true" }) })).status, 400);
  const own = loadStatusRoute("app/api/servicios/estado/route.ts");
  assert.equal((await own.api.PATCH({ json: async () => ({ id: statusId, activo: true }) })).status, 200);
  const mutation = own.operations.find(x => x.operation === "update");
  assert.deepEqual(Array.from(mutation.filters, x => Array.from(x)), [
    ["id", statusId], ["propietario_id", "owner-1"],
  ]);
});

test("disabled accounts cannot create services or change listing state", async () => {
  const writes = [];
  const service = loadServiceApi("owner-123", writes, { active: false });
  const response = await service.POST({ json: async () => servicioValido });
  assert.equal(response.status, 401);
  assert.equal(writes.length, 0);
  for (const route of ["app/api/campos/estado/route.ts", "app/api/servicios/estado/route.ts"]) {
    const disabled = loadStatusRoute(route, { active: false });
    const status = await disabled.api.PATCH({ json: async () => ({
      id: statusId, ...(route.includes("/campos/") ? { status: "activo" } : { activo: true }),
    }) });
    assert.equal(status.status, 403);
    assert.equal(disabled.operations.length, 0);
  }
});
