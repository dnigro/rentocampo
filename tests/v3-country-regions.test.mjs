import test from 'node:test';
import assert from 'node:assert/strict';
import {COUNTRY_CODES} from '../data/countries.ts';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
// The existing region data uses app aliases: transpile with the same test adapter as other data contracts.
const source=readFileSync('data/regiones-productivas.ts','utf8');
const expansion=await import('../data/latam-expansion.ts');
const js=ts.transpileModule(source.replace('import { EXPANSION_COUNTRY_CODES, EXPANSION_REGIONS } from "@/data/latam-expansion";', 'const {EXPANSION_COUNTRY_CODES,EXPANSION_REGIONS}=globalThis.__regionalTestExpansion;'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
globalThis.__regionalTestExpansion=expansion;
const {REGIONES_PRODUCTIVAS}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
delete globalThis.__regionalTestExpansion;
test('every supported country retains its own productive region cards',()=>{
 assert.equal(COUNTRY_CODES.length,19);
 for(const country of COUNTRY_CODES){const rows=REGIONES_PRODUCTIVAS[country];assert.equal(rows.length,4,country);for(const row of rows)for(const key of ['zona','subdivision','actividad'])assert.ok(row[key]?.trim(),country+' '+key);}
 assert.equal(REGIONES_PRODUCTIVAS.AR[0].zona,'Pergamino');assert.equal(REGIONES_PRODUCTIVAS.BR[0].zona,'Ribeirão Preto');assert.equal(REGIONES_PRODUCTIVAS.US[0].zona,'Des Moines');
});
test('field, service and unified explorer reuse the country-aware regional panel',()=>{
 for(const path of ['app/v3/campos/page.tsx','app/v3/servicios/page.tsx','app/v3/components/V3UnifiedExplorer.tsx'])assert.match(readFileSync(path,'utf8'),/<V3RegionalPanel country=\{country\}/);
 const hook=readFileSync('lib/i18n/useRegionalCountry.ts','utf8');assert.ok(hook.includes('[pathname, queryCountry]'));
});
