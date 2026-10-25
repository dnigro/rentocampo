import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { isCountryCode, resolveCountry, COUNTRIES, COUNTRY_CODES, COUNTRY_CODES_ALPHABETICAL, getCountrySubdivisions } from '../data/countries.ts';
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
test('hero shows 100% GRATIS, SUMATE as one bold underlined line', () => {
  const hero=readFileSync(new URL('../components/landing/LandingTriptychHero.tsx', import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles/hero-2026-isolated.css', import.meta.url),'utf8');
  const lite=readFileSync(new URL('../app/lite/page.tsx', import.meta.url),'utf8');
  assert.equal(COUNTRY_CODES.length,19);
  assert.match(hero, /className="rcHero26__freeLine"/);
  assert.ok(!hero.includes('rcHero26__number'));
  assert.match(hero, /UNIMOS EL CAMPO/);
  assert.match(hero, /UNIMOS O CAMPO/);
  assert.ok(!hero.includes('rcHero26__steps'));
  assert.ok(!lite.includes('#1 RED FEDERAL'));
  assert.match(lite, /UNIMOS EL CAMPO/);
  assert.ok(!lite.includes('index<steps.length-1'));
  assert.match(hero, /t\("100% GRATIS,","100% GRÁTIS,"\)/);
  assert.match(hero, /t\("SUMATE","JUNTE-SE"\)/);
  assert.ok(!hero.includes('COUNTRY_CODES.slice('));
  assert.match(css, /\.rcHero26__freeLine\{[^}]*border-bottom:3px solid var\(--gold\)/);
  assert.match(css, /\.rcHero26__sumate\{font-size:clamp\(/);
  assert.match(lite, /t\("100% GRATIS,", "100% GRÁTIS,"\)/);
  assert.match(lite, /t\("SUMATE", "JUNTE-SE"\)/);
  assert.match(hero, /className="rcHero26__register"/);
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

test('four regional zone markers are not mislabeled as field DEMOs', () => {
 const map=readFileSync(new URL('../components/campos/CampoMapa.tsx',import.meta.url),'utf8');
 assert.match(map,/Zona productiva · referencia/);
 assert.ok(!map.includes("4 zonas productivas de referencia · no son campos DEMO ni demanda verificada"));
 assert.match(map,/fillColor: "#f4c542"/);
 assert.match(map,/Zona productiva \(no es un campo\)/);
});

test('approved V2 teaser is restored below FAQ with original images',()=>{ const home=readFileSync(new URL('../components/landing/LandingPageContent.tsx',import.meta.url),'utf8'); const v2=readFileSync(new URL('../components/landing/LandingIntelligence.tsx',import.meta.url),'utf8'); assert.ok(home.indexOf('<LandingFAQ />')<home.indexOf('<LandingIntelligence />')); for(const s of ['PRÓXIMAMENTE','AgroClimate','GeoMarket','/intelligence-agro-approved.webp','/intelligence-geo-approved.webp']) assert.ok(v2.includes(s)); });

test('V2 evolution cards use a compact image crop and prose instead of bullet lists', () => {
  const v2=readFileSync(new URL('../components/landing/LandingIntelligence.tsx',import.meta.url),'utf8');
  assert.match(v2,/aspect-ratio:2\.05 \/ 1/);
  assert.match(v2,/background-size:contain/);
  assert.ok(!v2.includes('<ul>') && !v2.includes('<li '));
  for(const term of ['AgroClimate','GeoMarket','pronósticos por campo y zona','alertas de heladas','aptitud productiva','PRÓXIMAMENTE']) {
    assert.ok(v2.includes(term), 'missing V2 card benefit: '+term);
  }
  assert.ok(v2.includes('/intelligence-agro-approved.webp'));
  assert.ok(v2.includes('/intelligence-geo-approved.webp'));
});

test('V2 original image composition is fully visible and footer is legible', () => {
 const v2=readFileSync(new URL('../components/landing/LandingIntelligence.tsx',import.meta.url),'utf8');
 assert.equal((v2.match(/aspect-ratio:2\.05 \/ 1/g)||[]).length,2);
 assert.match(v2,/background-size:contain;background-repeat:no-repeat/);
 assert.match(v2,/\.rci-footer\{[^}]*font-size:12px;font-weight:800/);
 assert.ok(v2.includes('/intelligence-agro-approved.webp'));
 assert.ok(v2.includes('/intelligence-geo-approved.webp'));
 assert.ok(!v2.includes('aspect-ratio:2.85 / 1'));
});

test('country selector shows 19 unique markets in Spanish alphabetical order', () => {
 const names=COUNTRY_CODES_ALPHABETICAL.map(code => COUNTRIES[code].name);
 assert.equal(names.length,19);
 assert.equal(new Set(names).size,19);
 assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,"es",{sensitivity:"base"})));
 assert.equal(names[0],"Argentina");
 assert.equal(names.at(-1),"Venezuela");
 const nav=readFileSync(new URL('../components/layout/Navbar.tsx',import.meta.url),'utf8');
 assert.equal((nav.match(/COUNTRY_CODES_ALPHABETICAL\.map\(/g)||[]).length,2);
 assert.ok(nav.includes('{COUNTRIES[code].flag} {code}'));
 assert.match(nav,/selectRegionalCountry\(country\);\s*window\.location\.reload\(\)/);
 assert.match(nav,/htmlFor="navbar-pais-desktop"/);
 assert.match(nav,/htmlFor="navbar-pais-mobile"/);
 assert.equal((nav.match(/>PAÍS<\/label>/g)||[]).length,2);
 assert.equal((nav.match(/\{COUNTRIES\[code\]\.flag\} \{code\}<\/option>/g)||[]).length,2);
});
test('new-country green available field pins paint above yellow editorial pins', () => {
 const source=readFileSync(new URL('../components/campos/CampoMapa.tsx',import.meta.url),'utf8');
 assert.ok(source.indexOf('ZONAS_PRODUCTIVAS_LATAM.filter(')<source.indexOf('camposConCoordenadas.forEach('));
 assert.match(source,/fillColor: "#2d6a2d"/);
 assert.match(source,/fillColor: "#f4c542"/);
 assert.match(source,/\[demandaLayer.current, camposLayer.current\]/);
 assert.match(source,/leafletMap\.fitBounds\(L\.latLngBounds/);
 assert.match(source,/fieldPoints\.length/);
});

test('a country change reloads the matching map after updating URL and cookie', () => {
 const nav=readFileSync(new URL('../components/layout/Navbar.tsx',import.meta.url),'utf8');
 const lite=readFileSync(new URL('../components/lite/LiteHeader.tsx',import.meta.url),'utf8');
 const regional=readFileSync(new URL('../lib/i18n/useRegionalCountry.ts',import.meta.url),'utf8');
 const serverPage=readFileSync(new URL('../app/(public)/campos/mapa/page.tsx',import.meta.url),'utf8');
 assert.match(nav,/selectRegionalCountry\(country\);\s*window\.location\.reload\(\)/);
 assert.match(lite,/selectRegionalCountry\(next\);[\s\S]*?window\.location\.reload\(\)/);
 assert.match(regional,/destination\.searchParams\.set\("pais", country\)/);
 assert.match(regional,/rentocampo_country=\$\{country\}/);
 assert.match(serverPage,/resolveCountry\(pais, storedCountry\)/);
 assert.match(serverPage,/key=\{selectedCountry\}/);
 assert.match(serverPage,/\.eq\("country_code", selectedCountry\)/);
});


test('single regional publication CTA contract covers all 19 countries, service and field, anonymous and logged', async () => {
 const { regionalPublicationHref, regionalPublicationLabel } = await import('../lib/publicacion-regional.ts');
 const { demoServiceRegisterHref } = await import('../data/visible-demo-services.ts');
 for (const country of COUNTRY_CODES) for (const kind of ['campo','servicio']) {
   const logged=regionalPublicationHref({country,kind,authenticated:true,zona:'Río Cuarto'});
   const anonymous=regionalPublicationHref({country,kind,authenticated:false,zona:'Río Cuarto'});
   assert.ok(logged.startsWith(kind==='campo'?'/mis-campos/nuevo?':'/mis-servicios-rurales/nuevo?'));
   assert.equal(new URLSearchParams(logged.split('?')[1]).get('pais'),country);
   assert.equal(new URLSearchParams(logged.split('?')[1]).get('zona'),'Río Cuarto');
   assert.equal(new URLSearchParams(anonymous.split('?')[1]).get('next'),logged);
   assert.ok(regionalPublicationLabel({country,kind,authenticated:true}).includes(country==='BR'?'ANUNCIAR':country==='US'?'POST':'PUBLICAR') || (country==='US' && kind==='campo' && regionalPublicationLabel({country,kind,authenticated:true}).includes('LIST')));
   assert.ok(regionalPublicationLabel({country,kind,authenticated:false}).includes(country==='BR'?'ENTRAR':country==='US'?'SIGN IN':'INICIAR SESIÓN'));
 }
 assert.equal(demoServiceRegisterHref('CO'),'/login?next='+encodeURIComponent('/mis-servicios-rurales/nuevo?pais=CO'));
 assert.equal(demoServiceRegisterHref('CO',true),'/mis-servicios-rurales/nuevo?pais=CO');
});
test('regional productive zone panel appears in both listing categories and uses auth-aware routing',()=>{
 const panel=readFileSync(new URL('../components/campos/DemandaZonasPanel.tsx',import.meta.url),'utf8');
 const campos=readFileSync(new URL('../components/campos/CamposListing.tsx',import.meta.url),'utf8');
 const servicios=readFileSync(new URL('../app/(public)/servicios-rurales/page.tsx',import.meta.url),'utf8');
 const fichaCampo=readFileSync(new URL('../app/(public)/campos/[id]/page.tsx',import.meta.url),'utf8');
 const fichaServicio=readFileSync(new URL('../app/(public)/servicios-rurales/[id]/page.tsx',import.meta.url),'utf8');
 const lite=readFileSync(new URL('../components/lite/LiteServiciosListado.tsx',import.meta.url),'utf8');
 const map=readFileSync(new URL('../components/campos/CampoMapa.tsx',import.meta.url),'utf8');
 assert.match(panel,/REGIONES_PRODUCTIVAS\[country\]/);
 assert.match(panel,/regionalPublicationHref\(\{ country, kind, authenticated, zona: region.zona \}\)/);
 assert.match(campos,/DemandaZonasPanel country=\{pais\}[\s\S]*?authenticated=\{Boolean\(user\)\} kind="campo"/);
 assert.match(servicios,/DemandaZonasPanel country=\{pais\}[\s\S]*?authenticated=\{Boolean\(user\)\} kind="servicio"/);
 assert.match(fichaCampo,/regionalPublicationHref\(\{ country: countryCode, kind: "campo", authenticated: Boolean\(user\)/);
 assert.match(fichaServicio,/demoServiceRegisterHref\(pais, Boolean\(user\)\)/);
 assert.match(lite,/demoServiceRegisterHref\(pais, Boolean\(user\)\)/);
 assert.match(map,/demoServiceRegisterHref\(countryCode, Boolean\(resolvedUserId\)\)/);
});
test('publish screens honor country and the selected regional zone after sign-in',()=>{
 const campo=readFileSync(new URL('../app/(dashboard)/mis-campos/nuevo/page.tsx',import.meta.url),'utf8');
 const servicio=readFileSync(new URL('../app/(dashboard)/mis-servicios-rurales/nuevo/page.tsx',import.meta.url),'utf8');
 const serviceForm=readFileSync(new URL('../components/servicios/ServicioRuralForm.tsx',import.meta.url),'utf8');
 assert.match(campo,/resolveCountry\(search.pais, profile\?\.country_code\)/);
 assert.match(campo,/Zona de referencia:/);
 assert.match(servicio,/initialZona=\{search.zona\}/);
 assert.match(serviceForm,/initialZona \?\? profile\?\.zona_servicio/);
});


test('United States: 19th market, 50 states plus Washington DC, map and USD', () => {
 assert.equal(COUNTRY_CODES.length,19);
 assert.equal(isCountryCode('US'),true);
 assert.equal(resolveCountry('US','AR'),'US');
 const states=getCountrySubdivisions('US');
 assert.equal(states.length,51);
 assert.equal(new Set(states).size,51);
 for(const place of ['Iowa','Texas','California','Kansas','New York','Washington, D.C.']) assert.ok(states.includes(place));
 assert.equal(COUNTRIES.US.flag,'🇺🇸');
 assert.equal(COUNTRIES.US.locale,'en-US');
 assert.equal(COUNTRIES.US.currency,'USD');
 assert.equal(COUNTRIES.US.subdivisionLabel,'State');
 assert.equal(COUNTRIES.US.mapCenter.length,2);
 const filters=campoFilterParams({pais:'US',provincia:'Texas',operacion:'alquiler'});
 assert.equal(filters.get('pais'),'US');
 assert.equal(filters.get('provincia'),'Texas');
});
test('every country has a visible emoji flag next to its ISO code in web and Lite',()=>{
 const nav=readFileSync(new URL('../components/layout/Navbar.tsx',import.meta.url),'utf8');
 const lite=readFileSync(new URL('../components/lite/LiteHeader.tsx',import.meta.url),'utf8');
 assert.equal((nav.match(/\{COUNTRIES\[code\]\.flag\} \{code\}<\/option>/g)||[]).length,2);
 assert.match(lite,/\{COUNTRIES\[code\]\.flag\} \{code\}<\/option>/);
 for(const code of COUNTRY_CODES) assert.ok(COUNTRIES[code].flag.length>=2,code);
});
test('US preview fails closed rather than inheriting production credentials',()=>{
 assert.throws(()=>enforceUatIsolation({VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/us19-flags-20261025',NEXT_PUBLIC_SUPABASE_URL:'https://production.invalid'}),/UAT isolation/);
 const env={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/us19-flags-20261025',NEXT_PUBLIC_SUPABASE_URL:'https://production.invalid',UAT_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_uat_fixture'};
 enforceUatIsolation(env);
 assert.equal(env.NEXT_PUBLIC_SUPABASE_URL,'https://wibqszhvuvpjycheaxzi.supabase.co');
 assert.equal(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,'sb_publishable_uat_fixture');
});
