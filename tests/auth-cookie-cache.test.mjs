import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
let source = readFileSync(new URL('../proxy.ts',import.meta.url),'utf8');
source=source.replace('import { createServerClient } from "@supabase/ssr";', 'const createServerClient = globalThis.__authProxyClient;');
source=source.replace('import { getSupabasePublicConfig } from "@/lib/supabase/config";', 'const getSupabasePublicConfig = () => ({url:"https://example.supabase.co",key:"synthetic-public-key"});');
source=source.replace('from "next/server"',`from ${JSON.stringify(pathToFileURL(require.resolve('next/server')).href)}`);
async function loadProxy(user) {
 globalThis.__authProxyClient=(_url,_key,options)=>({auth:{getUser:async()=>{
  options.cookies.setAll([{name:'synthetic-session',value:'refreshed',options:{path:'/'}}],{'Cache-Control':'private, no-store','Pragma':'no-cache','Expires':'0'});
  return {data:{user}};
 }}});
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 return import('data:text/javascript;base64,'+Buffer.from(compiled+'\n// '+Math.random()).toString('base64'));
}
test('refreshed auth cookies carry no-store headers on authenticated responses',async()=>{
 try {
  const {proxy}=await loadProxy({id:'synthetic-user'});
  const response=await proxy(new NextRequest('https://rentocampo.com/dashboard'));
  assert.equal(response.cookies.get('synthetic-session').value,'refreshed');
  assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  assert.equal(response.headers.get('Pragma'),'no-cache');
 } finally {delete globalThis.__authProxyClient;}
});
test('private report and service redirects preserve refreshed cookies without caching',async()=>{
 try {
  const {proxy}=await loadProxy(null);
  for(const path of ['/gerencial','/mis-servicios-rurales']) {
   const response=await proxy(new NextRequest('https://rentocampo.com'+path));
   assert.equal(response.status,307);
   const location=new URL(response.headers.get('Location'));
   assert.equal(location.pathname,'/login');
   assert.equal(location.searchParams.get('next'),path);
   assert.equal(response.cookies.get('synthetic-session').value,'refreshed');
   assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  }
 } finally {delete globalThis.__authProxyClient;}
});
