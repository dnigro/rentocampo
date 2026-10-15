import {chromium,firefox,webkit} from "playwright";
import {createClient} from "@supabase/supabase-js";
import {randomUUID} from "node:crypto";
import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";

const ref="wibqszhvuvpjycheaxzi",uat="https://"+ref+".supabase.co",origin="http://127.0.0.1:3000";
const pub=process.env.UAT_SUPABASE_PUBLISHABLE_KEY,secret=process.env.UAT_SUPABASE_SERVICE_ROLE_KEY;
if(process.env.NEXT_PUBLIC_SUPABASE_URL!==uat||!pub?.startsWith("sb_publishable_")||!secret||
 process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!==pub||process.env.SUPABASE_SERVICE_ROLE_KEY!==secret||
 process.env.VERCEL_ENV||process.env.RESEND_API_KEY||process.env.MERCADOPAGO_ACCESS_TOKEN)
 throw Error("UAT-only local runtime required; production, payments and email integrations refused.");
if(secret.startsWith("eyJ")){
 const claims=JSON.parse(Buffer.from(secret.split(".")[1],"base64url").toString());
 if(claims.ref!==ref||claims.role!=="service_role")throw Error("Non-UAT key refused");
}else if(!secret.startsWith("sb_secret_"))throw Error("Invalid UAT secret format");
const admin=createClient(uat,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const engines={chromium,firefox,webkit},viewports=[
 {name:"mobile-320",width:320,height:700},{name:"mobile-375",width:375,height:812},
 {name:"mobile-430",width:430,height:932},{name:"tablet-768",width:768,height:1024},
 {name:"tablet-landscape-1024",width:1024,height:768},{name:"desktop-1440",width:1440,height:900},
 {name:"mobile-landscape-844",width:844,height:390}
];
const actors=[{country:"AR",role:"propietario"},{country:"UY",role:"productor"},{country:"PY",role:"prestador"}];
const results=[],userIds=[];
mkdirSync("test-results/screenshots",{recursive:true});
const pause=t=>new Promise(r=>setTimeout(r,t));
let child,serverLog="";
async function check(name,fn,page){
 try{await fn();results.push({name,result:"PASS"});console.log("PASS "+name)}
 catch(e){results.push({name,result:"FAIL",detail:String(e).slice(0,1000)});
 console.error("FAIL "+name+" "+String(e).slice(0,1000));
 if(page&&!page.isClosed())await page.screenshot({path:"test-results/screenshots/"+results.length+".png",fullPage:true,timeout:4000}).catch(()=>{});
 }
}
async function context(browser,size){
 const c=await browser.newContext({viewport:size,locale:"es-AR"});
 await c.route(/(googletagmanager\.com|google-analytics\.com|analytics\.google\.com)/,r=>r.abort());
 return c;
}
async function open(page,path,selector){
 const r=await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:25000});
 if(r?.status()!==200||!page.url().startsWith(origin))throw Error("Wrong origin or HTTP "+r?.status()+" URL="+page.url());
 await page.locator(selector).first().waitFor({state:"visible",timeout:12000});
}
async function overflow(page,label){
 const s=await page.evaluate(()=>{
  const zoom=Number.parseFloat(getComputedStyle(document.documentElement).zoom)||1;
  return {viewport:document.documentElement.clientWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth,zoom};
 });
 // A desktop CSS zoom of .8 intentionally gives 125% unscaled layout width.
 if(s.html>s.viewport+2||s.body*s.zoom>s.viewport+2)throw Error(label+" visible horizontal overflow: "+JSON.stringify(s));
}
async function start(){
 child=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port","3000"],{env:{...process.env,NEXT_TELEMETRY_DISABLED:"1"},stdio:["ignore","pipe","pipe"]});
 child.stdout.on("data",d=>serverLog+=d.toString());
 child.stderr.on("data",d=>serverLog+=d.toString());
 for(let i=0;i<110;i++){
  if(child.exitCode!==null)throw Error("Next exited: "+serverLog.slice(-800));
  try{const r=await fetch(origin+"/login",{signal:AbortSignal.timeout(1800)});if(r.status===200)return}catch{}
  await pause(400);
 }
 throw Error("Local UAT server did not start: "+serverLog.slice(-900));
}
async function matrix(){
 for(const [engineName,engine] of Object.entries(engines)){
  const browser=await engine.launch();
  try{
   for(const size of viewports){
    const c=await context(browser,{width:size.width,height:size.height}),page=await c.newPage();
    await check("Responsive "+engineName+" "+size.name+" registration/login/recovery",async()=>{
     await open(page,"/register?pais=AR&tipo=propietario","#country_code");
     if(await page.locator("#country_code").inputValue()!=="AR"||!await page.locator("#tipo-propietario").isChecked())throw Error("Wrong default registration state");
     await overflow(page,"registration");
     await page.locator("label[for=tipo-prestador]").click();
     if(!await page.locator("#tipo-prestador").isChecked())throw Error("Radio not actionable");
     await page.locator("#country_code").selectOption("UY");
     if(await page.locator("#country_code").inputValue()!=="UY")throw Error("Country selector broken");
     await open(page,"/login","#password");await overflow(page,"login");
     await page.getByRole("button",{name:"Mostrar contraseña"}).click();
     if(await page.locator("#password").getAttribute("type")!=="text")throw Error("Password toggle broken");
     await open(page,"/recuperar-contrasena","#email");await overflow(page,"recovery");
     if(!await page.getByRole("button",{name:/enviar link de recuperación/i}).isVisible())throw Error("Recovery button unavailable");
    },page);
    await c.close();
   }
  }finally{await browser.close()}
 }
}
async function profile(id,country,role){
 for(let i=0;i<18;i++){
  const r=await admin.from("profiles").select("country_code,roles").eq("id",id).maybeSingle();
  if(!r.error&&r.data?.country_code===country&&r.data.roles?.includes(role))return;
  await pause(500);
 }
 throw Error("Role/country not persisted in UAT profiles: "+country+"/"+role);
}
async function login(user,size){
 const b=await chromium.launch(),c=await context(b,size),page=await c.newPage();
 try{
  await open(page,"/login","#password");
  await page.locator("#email").fill(user.email);await page.locator("#password").fill(user.password);
  await page.getByRole("button",{name:"Ingresar",exact:true}).click();
  await page.waitForURL(/\/dashboard(?:\?|$)/,{timeout:22000});
  await page.locator(".dashboard-title").waitFor({state:"visible",timeout:12000});
  if(!await page.getByText("Mi perfil",{exact:true}).count())throw Error("Missing authenticated dashboard links");
  await overflow(page,"dashboard");
 }finally{await c.close();await b.close()}
}
async function register(){
 const b=await chromium.launch(),c=await context(b,{width:390,height:844}),page=await c.newPage();
 const u={email:"uat-reg-"+randomUUID()+"@yopmail.com",password:"Uat!9"+randomUUID().replaceAll("-",""),country:"AR",role:"propietario"};
 try{
  await check("REAL registration form -> UAT Auth -> profile -> confirmation -> login",async()=>{
   await open(page,"/register?pais=AR&tipo=propietario","#country_code");
   await page.locator("#nombre").fill("UAT Registro Controlado");
   await page.locator("#email").fill(u.email);await page.locator("#password").fill(u.password);
   await page.locator(".register-terms input").check();
   await page.getByRole("button",{name:"Crear cuenta",exact:true}).click();
   await Promise.race([
    page.waitForURL(/\/confirmar-email(?:\?|$)/,{timeout:19000}).catch(()=>{}),
    page.locator(".auth-error[role=alert]").first().waitFor({state:"visible",timeout:19000}).catch(()=>{})
   ]);
   const listed=await admin.auth.admin.listUsers({page:1,perPage:1000});
   if(listed.error)throw Error("Cannot inspect UAT account "+listed.error.message);
   const signed=listed.data.users.find(a=>a.email===u.email);
   if(signed)userIds.push(signed.id);
   if(!page.url().includes("/confirmar-email"))throw Error("Signup did not complete: "+(await page.locator(".auth-error[role=alert]").allTextContents()).join(" "));
   if(!signed)throw Error("UI reported success but UAT Auth user absent");
   await profile(signed.id,u.country,u.role);
   const confirmed=await admin.auth.admin.updateUserById(signed.id,{email_confirm:true});
   if(confirmed.error)throw Error("UAT email confirmation "+confirmed.error.message);
   await login(u,{width:390,height:844});
  },page);
 }finally{await c.close();await b.close()}
}
async function deepLinksAndLogins(){
 const b=await chromium.launch();
 try{
  for(const x of actors){
   const c=await context(b,{width:1366,height:768}),page=await c.newPage();
   await check("Registration deep link "+x.country+"/"+x.role,async()=>{
    await open(page,"/register?pais="+x.country+"&tipo="+x.role,"#country_code");
    if(await page.locator("#country_code").inputValue()!==x.country||!await page.locator("#tipo-"+x.role).isChecked())throw Error("Deep link selection not preserved");
   },page);await c.close();
   const u={...x,email:"uat-login-"+randomUUID()+"@example.com",password:"Uat!9"+randomUUID().replaceAll("-","")};
   await check("Persisted UAT profile and real browser login "+x.country+"/"+x.role,async()=>{
    const res=await admin.auth.admin.createUser({email:u.email,password:u.password,email_confirm:true,user_metadata:{nombre:"UAT "+x.country,tipo:x.role,country_code:x.country}});
    if(res.error)throw Error(res.error.message);
    userIds.push(res.data.user.id);
    await profile(res.data.user.id,x.country,x.role);
    await login(u,x.country==="AR"?{width:320,height:700}:x.country==="UY"?{width:768,height:1024}:{width:1440,height:900});
   });
  }
 }finally{await b.close()}
}
async function recover(){
 const b=await chromium.launch(),c=await context(b,{width:375,height:812}),page=await c.newPage();
 try{
  await check("Submit password recovery through UAT Auth",async()=>{
   await open(page,"/recuperar-contrasena","#email");
   await page.locator("#email").fill("uat-recovery-"+randomUUID()+"@example.com");
   await page.getByRole("button",{name:"Enviar link de recuperación"}).click();
   await page.getByRole("heading",{name:"Revisá tu email"}).waitFor({timeout:15000});
  },page);
 }finally{await c.close();await b.close()}
}
try{
 const r=await admin.auth.admin.listUsers({page:1,perPage:1});
 if(r.error)throw Error("UAT admin verification failed: "+r.error.message);
 await start();await matrix();await deepLinksAndLogins();await register();await recover();
}catch(error){results.push({name:"UAT setup",result:"FAIL",detail:String(error)});console.error(error)}
finally{
 for(const id of userIds){const r=await admin.auth.admin.deleteUser(id);if(r.error)results.push({name:"UAT cleanup",result:"FAIL",detail:r.error.message})}
 if(child)child.kill("SIGINT");
 writeFileSync("test-results/uat-responsive.json",JSON.stringify({date:new Date().toISOString(),target:"localhost Next + Supabase UAT only",engines:Object.keys(engines),viewports,results,notes:"Actual browser signup uses UAT Auth; confirmation via UAT admin. Does not verify inbox delivery. GA4 calls blocked."},null,2));
}
const failed=results.filter(r=>r.result!=="PASS").length;
console.log("UAT CROSS-FORMAT: "+(results.length-failed)+" PASS; "+failed+" FAIL");
if(failed)process.exitCode=1;
