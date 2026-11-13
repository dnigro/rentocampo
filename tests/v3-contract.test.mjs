import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

test("V3 critical routes are present and isolated from main", () => {
  const paths = [
    "app/v3/layout.tsx",
    "app/v3/page.tsx",
    "app/v3/campos/page.tsx",
    "app/v3/campos/[id]/page.tsx",
    "app/v3/servicios/page.tsx",
    "app/v3/servicios/[id]/page.tsx",
    "app/v3/mi-rentocampo/page.tsx"
  ];
  for (const path of paths) assert.ok(existsSync(join(root, path)), path);
  const layout = read("app/v3/layout.tsx");
  assert.match(layout, /robots:\s*\{\s*index:\s*false/);
  const frame = read("components/layout/PreviewSiteFrame.tsx");
  assert.match(frame, /<SiteFooter/);
  const footer = read("components/layout/Footer.tsx");
  assert.ok(footer.includes("tipo=campo"));
  assert.ok(footer.includes("tipo=servicio"));
  assert.match(frame, /href="\/v3\/mi-rentocampo"/);
});

test("Marketplace reuses published data and exposes unified map/list", () => {
  const page = read("app/v3/campos/page.tsx");
  const explorer = read("app/v3/components/V3Explorer.tsx");
  const map = read("app/v3/components/V3Map.tsx");
  assert.match(page, /\.eq\("status",\s*"activo"\)/);
  assert.match(page, /V3Explorer/);
  assert.match(page, /select\(".*campos_fotos/);
  assert.match(explorer, /v3-marketplace-grid/);
  assert.match(explorer, /V3Map/);
  assert.match(explorer, /setMobileMap/);
  assert.match(map, /L\.map/);
  assert.match(map, /L\.marker/);
  assert.match(map, /ResizeObserver/);
});

test("V3 UAT does not introduce mutations on real Supabase data", () => {
  const files = [
    "app/v3/page.tsx",
    "lib/v3/load-home-listings.ts",
    "app/v3/campos/page.tsx",
    "app/v3/campos/[id]/page.tsx",
    "app/v3/servicios/page.tsx",
    "app/v3/servicios/[id]/page.tsx",
    "app/v3/mi-rentocampo/page.tsx",
    "app/v3/components/V3Explorer.tsx"
  ];
  for (const file of files) {
    const src = read(file);
    assert.doesNotMatch(src, /\.insert\s*\(|\.upsert\s*\(|\.update\s*\(|\.delete\s*\(/, file);
  }
  assert.match(read("app/v3/components/V3Explorer.tsx"), /sessionStorage/);
});

test("Detailed listings keep eight-photo limit and no live UAT contact", () => {
  const detail = read("app/v3/campos/[id]/page.tsx");
  assert.match(detail, /\.slice\(0,\s*8\)/);
  assert.match(detail, /Mensajería no habilitada en UAT/);
  assert.match(read("app/v3/servicios/[id]/page.tsx"), /Contacto deshabilitado en UAT/);
});

test("Responsive layouts include mobile map/list controls", () => {
  const css = read("app/v3/v3-marketplace.css");
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /v3-mobile-show-map/);
  assert.match(css, /v3-home-featured-grid/);
});
