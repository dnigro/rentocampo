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
  assert.match(errorCampoPublico({ ...campoValido, titulo: "12345" }) ?? "", /descriptivo/);
  assert.match(errorCampoPublico({ ...campoValido, descripcion: "Tel. 11 5555-6666" }) ?? "", /chat/i);
  assert.match(errorCampoPublico({ ...campoValido, hectareas: 0 }) ?? "", /Superficie/);
  assert.match(errorCampoPublico({ ...campoValido, precio: -1 }) ?? "", /Precio/);
  assert.match(errorCampoPublico({ ...campoValido, longitud: undefined }) ?? "", /mapa/);
});

test("servicios controla rubros, foto, nombre y contacto", () => {
  assert.equal(errorServicioPublico(servicioValido, ["cosecha", "siembra"]), null);
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
  assert.match(serviceApi, /errorServicioPublico\(data, validServices\)/);
  assert.match(serviceApi, /propietario_id: user.id/);
  assert.match(form, /fetch\("\/api\/servicios\/publicar"/);
  assert.doesNotMatch(form, /supabase\.from\("servicios_publicaciones"\)/);
});
