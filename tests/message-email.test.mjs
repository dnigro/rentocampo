import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
let source=readFileSync(new URL('../lib/send-message-notification.ts',import.meta.url),'utf8');
source=source.replace('"./email-idempotency"',JSON.stringify(new URL('../lib/email-idempotency.ts',import.meta.url).href));
source=source.replace('import { Resend } from "resend";','const Resend=globalThis.__MockResend;');
source=source.replace('import { createAdminClient } from "@/lib/supabase/admin";','const createAdminClient=()=>globalThis.__MockNotificationAdmin;');
test('message notification retries use event keys, escape HTML and include plain text without sending email',async()=>{
 const calls=[];
 const saved={key:process.env.RESEND_API_KEY,url:process.env.NEXT_PUBLIC_APP_URL};
 process.env.RESEND_API_KEY='synthetic-test-key';process.env.NEXT_PUBLIC_APP_URL='https://example.org';
 globalThis.__MockResend=class {emails={send:async(payload,options)=>{calls.push({payload,options});return {data:{id:'synthetic-id'},error:null}}}};
 globalThis.__MockNotificationAdmin={auth:{admin:{getUserById:async()=>({data:{user:{email:'synthetic@example.org'}},error:null})}},from:()=>({select(){return this},eq(){return this},single:async()=>({data:{contenido:'<script>synthetic</script>',destinatario_id:'synthetic-recipient',campo:{id:'synthetic-field',titulo:'Campo <prueba>'},remitente:{nombre:'Persona <prueba>'},destinatario:{nombre:'Destinatario sintético'}},error:null})})};
 try {
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const {sendMessageNotification}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  await sendMessageNotification('synthetic-message');await sendMessageNotification('synthetic-message');
  assert.equal(calls.length,2);
  assert.equal(calls[0].options.idempotencyKey,calls[1].options.idempotencyKey);
  assert.ok(calls[0].payload.html.includes('&lt;script&gt;'));
  assert.equal(calls[0].payload.html.includes('<script>'),false);
  assert.ok(calls[0].payload.text.includes('https://example.org/mensajes/synthetic-field'));
 } finally {
  delete globalThis.__MockResend;delete globalThis.__MockNotificationAdmin;
  for(const [name,value] of [['RESEND_API_KEY',saved.key],['NEXT_PUBLIC_APP_URL',saved.url]]) {if(value===undefined)delete process.env[name];else process.env[name]=value;}
 }
});
