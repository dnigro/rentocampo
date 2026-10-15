import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const ref='wibqszhvuvpjycheaxzi';
const url='https://'+ref+'.supabase.co';
const base=process.env.UAT_PREVIEW_URL || 'https://rentocampo-git-feat-regional-ar-uy-py-20261014-rento-campo.vercel.app';
const publicKey=process.env.UAT_SUPABASE_PUBLISHABLE_KEY;
const privateKey=process.env.UAT_SUPABASE_SERVICE_ROLE_KEY;
if(!publicKey?.startsWith('sb_publishable_') || !privateKey) throw Error('UAT-only CI secrets are required');
if(privateKey.startsWith('eyJ')){
  const payload=privateKey.split('.')[1];
  if(!payload)throw Error('Malformed legacy UAT key');
  const claims=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
  if(claims.ref!==ref || claims.role!=='service_role')throw Error('UAT project mismatch');
}else if(!privateKey.startsWith('sb_secret_')){
  throw Error('Unsupported UAT admin key format');
}
if(new URL(base).hostname==='rentocampo.com') throw Error('Refusing production origin');
const admin=createClient(url,privateKey,{auth:{persistSession:false}});
const verification=await admin.auth.admin.listUsers({page:1,perPage:1});
if(verification.error)throw Error('UAT admin key verification failed: '+verification.error.message);
const browser=await chromium.launch({headless:true});
const users=[];
const results=[];
async function test(name,fn){try{await fn();results.push({name,result:'PASS'});console.log('PASS',name)}catch(e){results.push({name,result:'FAIL',error:String(e)});console.error('FAIL',name,String(e))}}
try{
 for(const country of ['AR','UY','PY']){
  await test('Registration country and role '+country,async()=>{
   const page=await browser.newPage();
   try{
    await page.goto(base+'/register?pais='+country+'&tipo=prestador',{waitUntil:'domcontentloaded'});
    await page.locator('#country_code').waitFor();
    if(await page.locator('#country_code').inputValue()!==country)throw Error('country default mismatch');
    if(!await page.locator('#tipo-prestador').isChecked())throw Error('role default mismatch');
    await page.screenshot({path:'/tmp/uat-register-'+country+'.png'});
   }finally{await page.close()}
  });
  await test('Actual browser login and persisted profile '+country,async()=>{
   const email='uat-'+randomUUID()+'@example.invalid',password='Uat!'+randomUUID()+'x';
   const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{nombre:'UAT '+country,tipo:'prestador',country_code:country}});
   if(created.error)throw created.error;
   users.push(created.data.user.id);
   const page=await browser.newPage();
   try{
    await page.goto(base+'/login',{waitUntil:'domcontentloaded'});
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button',{name:'Ingresar',exact:true}).click();
    await page.waitForURL(/\/dashboard/,{timeout:20000});
    const profile=await admin.from('profiles').select('country_code,roles').eq('id',created.data.user.id).single();
    if(profile.error || profile.data.country_code!==country)throw Error('persisted country mismatch');
   }finally{await page.close()}
  });
 }
 await test('Password recovery form submits to UAT Auth',async()=>{
  const page=await browser.newPage();
  try{
   await page.goto(base+'/recuperar-contrasena',{waitUntil:'domcontentloaded'});
   await page.locator('#email').fill('uat-recovery-'+randomUUID()+'@example.invalid');
   await page.getByRole('button',{name:/enviar|recuperar|restablecer/i}).click();
   await page.getByText('Revisá tu email').waitFor({timeout:15000});
  }finally{await page.close()}
 });
 for(const country of ['AR','UY','PY']){
  await test('Country field/service list pages '+country,async()=>{
   const page=await browser.newPage();
   try{
    for(const path of ['/campos','/servicios-rurales']){
     const response=await page.goto(base+path+'?pais='+country,{waitUntil:'domcontentloaded'});
     if(response?.status()!==200)throw Error(path+' HTTP '+response?.status());
     await page.locator('body').waitFor();
    }
   }finally{await page.close()}
  });
 }
}finally{
 for(const id of users){const d=await admin.auth.admin.deleteUser(id);if(d.error)console.error('Cleanup failed for disposable user',id,d.error.message)}
 await browser.close();
}
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.result!=='PASS'))process.exitCode=1;
