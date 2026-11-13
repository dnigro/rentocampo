import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const {NextRequest}=require('next/server');
let source=readFileSync(new URL('../app/auth/confirm/route.ts',import.meta.url),'utf8');
source=source.replace('import { createServerClient } from "@supabase/ssr";','const createServerClient=globalThis.__ConfirmClient;');
source=source.replace('import { getSupabasePublicConfig } from "@/lib/supabase/config";','const getSupabasePublicConfig=()=>({url:"https://example.supabase.co",key:"synthetic-public-key"});');
source=source.replace('"@/lib/auth/safe-next"',JSON.stringify(new URL('../lib/auth/safe-next.ts',import.meta.url).href));
source=source.replace('"next/server"',JSON.stringify(pathToFileURL(require.resolve('next/server')).href));
test('recovery confirmation keeps session cookies on its no-store redirect to the reset form',async()=>{
 globalThis.__ConfirmClient=(_url,_key,options)=>({auth:{verifyOtp:async args=>{
  assert.equal(args.type,'recovery');assert.equal(args.token_hash,'synthetic-hash');
  options.cookies.setAll([{name:'synthetic-session',value:'verified',options:{path:'/'}}],{'Cache-Control':'private, no-store'});
  return {error:null};
 }}});
 try {
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const {GET}=await import('data:text/javascript;base64,'+Buffer.from(output).toString('base64'));
  for(const extra of ['', '&next='+encodeURIComponent('/\\evil.example')]) {
   const response=await GET(new NextRequest('https://rentocampo.com/auth/confirm?type=recovery&token_hash=synthetic-hash'+extra));
   assert.equal(new URL(response.headers.get('Location')).pathname,'/auth/reset-password');
   assert.equal(response.cookies.get('synthetic-session').value,'verified');
   assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  }
 } finally {delete globalThis.__ConfirmClient;}
});
