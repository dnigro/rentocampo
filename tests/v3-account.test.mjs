import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require=createRequire(import.meta.url);
let source=readFileSync(new URL('../app/v3/mi-rentocampo/page.tsx',import.meta.url),'utf8');
source=source.replace('import Link from "next/link";',`import React from ${JSON.stringify(pathToFileURL(require.resolve('react')).href)}; const Link=({children,...props})=>React.createElement('a',props,children);`);
source=source.replace('import { cookies } from "next/headers";','const cookies=async()=>({get:()=>undefined});');
source=source.replace('import { createClient } from "@/lib/supabase/server";','const createClient=globalThis.__v3AccountClient;');
source=source.replace('"@/data/countries"',JSON.stringify(new URL('../data/countries.ts',import.meta.url).href));
source=source.replace('"@/lib/analytics/commercial-filters"',JSON.stringify(new URL('../lib/analytics/commercial-filters.ts',import.meta.url).href));
source=source.replace(/import \{ UserRound,.*?from "lucide-react";/,'const Icon=()=>null; const UserRound=Icon,Heart=Icon,MessageCircle=Icon,ClipboardList=Icon,ArrowUpRight=Icon,MapPin=Icon,ChartNoAxesCombined=Icon,LogIn=Icon,Tractor=Icon;');
async function renderAccount(user) {
 let selectedId;
 globalThis.__v3AccountClient=async()=>({auth:{getUser:async()=>({data:{user}})},from:()=>({select(){return this},eq(_column,id){selectedId=id;return this},maybeSingle:async()=>({data:{nombre:'Persona sintética',activo:true,roles:['productor']},error:null})})});
 try {
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace('"react/jsx-runtime"',JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href));
  const {default:Page}=await import('data:text/javascript;base64,'+Buffer.from(output+'\n// '+Math.random()).toString('base64'));
  const html=renderToStaticMarkup(await Page({searchParams:Promise.resolve({pais:'AR'})}));
  return {html,selectedId};
 } finally {delete globalThis.__v3AccountClient;}
}
test('anonymous account shows real login and recovery instead of a fake dashboard',async()=>{
 const {html,selectedId}=await renderAccount(null);
 assert.ok(html.includes('/login?next='));assert.ok(html.includes('/recuperar-contrasena'));
 assert.equal(html.includes('/gerencial'),false);assert.equal(selectedId,undefined);
});
test('verified management owner retains report access; other accounts cannot see its link',async()=>{
 for(const [email,confirmed,allowed] of [['dantenigro@gmail.com',true,true],['synthetic@example.org',true,false],['dantenigro@gmail.com',false,false]]) {
  const {html,selectedId}=await renderAccount({id:'synthetic-user',email,email_confirmed_at:confirmed?'2026-01-01':null});
  assert.equal(selectedId,'synthetic-user');
  assert.equal(html.includes('href="/gerencial?pais=AR"'),allowed);
  assert.ok(html.includes('/perfil?pais=AR'));
  assert.ok(html.includes('/mis-servicios-rurales?pais=AR'));
 }
});
