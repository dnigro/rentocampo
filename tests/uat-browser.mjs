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
const actors=[
 {country:"AR",role:"propietario"},{country:"UY",role:"productor"},{country:"PY",role:"prestador"},
 {country:"CL",role:"propietario"},{country:"BO",role:"productor"},{country:"PE",role:"prestador"},
 {country:"BR",role:"propietario"}
];
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
// Launch-day public E2E smoke: regional DEMO cards, photos, map pins and UAT data.
async function regionalDemoSmoke(){
 const cases=[
  {pais:"AR",campo:"20000000-0000-4000-8000-000000000044",servicio:"10000000-0000-4000-8000-000000000016",campoZona:"Buenos Aires",servicioZona:"Buenos Aires"},
  {pais:"UY",campo:"20000000-0000-4000-8000-000000000045",servicio:"10000000-0000-4000-8000-000000000017",campoZona:"Colonia",servicioZona:"Colonia"},
  {pais:"PY",campo:"20000000-0000-4000-8000-000000000046",servicio:"10000000-0000-4000-8000-000000000018",campoZona:"Itapúa",servicioZona:"Itapúa"},
  {pais:"BR",campo:"20000000-0000-4000-8000-000000000047",servicio:"10000000-0000-4000-8000-000000000019",campoZona:"São Paulo",servicioZona:"São Paulo"},
  {pais:"CL",campo:"20000000-0000-4000-8000-000000000041",servicio:"10000000-0000-4000-8000-000000000013",campoZona:"Ñuble",servicioZona:"Maule"},
  {pais:"BO",campo:"20000000-0000-4000-8000-000000000042",servicio:"10000000-0000-4000-8000-000000000014",campoZona:"Santa Cruz",servicioZona:"Santa Cruz"},
  {pais:"PE",campo:"20000000-0000-4000-8000-000000000043",servicio:"10000000-0000-4000-8000-000000000015",campoZona:"Junín",servicioZona:"La Libertad"}
 ];
 const b=await chromium.launch();
 try{
  for(const spec of cases){
   const c=await context(b,{width:390,height:844}),page=await c.newPage();
   try{
    await check("REGIONAL "+spec.pais+" persisted UAT demo image and service coordinates",async()=>{
     const [{data:campo,error:e1},{data:fotos,error:e2},{data:servicio,error:e3}]=await Promise.all([
      admin.from("campos").select("id,country_code,provincia,latitud,longitud,status").eq("id",spec.campo).single(),
      admin.from("campos_fotos").select("url,storage_path").eq("campo_id",spec.campo),
      admin.from("demo_servicios_rurales").select("id,country_code,activo,provincia_servicio,imagen_url,latitud,longitud").eq("id",spec.servicio).single()
     ]);
     if(e1||e2||e3)throw Error("Missing UAT fixture: "+[e1?.message,e2?.message,e3?.message].filter(Boolean).join(", "));
     if(campo.country_code!==spec.pais||campo.provincia!==spec.campoZona||campo.status!=="activo"||!Number.isFinite(campo.latitud)||!Number.isFinite(campo.longitud))throw Error("Invalid demo field data");
     if(fotos.length!==1||fotos[0].url!=="/rentocampo-hero-campo-bn-1920x1080.webp")throw Error("Wrong uploaded DEMO field image: "+JSON.stringify(fotos));
     if(servicio.country_code!==spec.pais||servicio.provincia_servicio!==spec.servicioZona||servicio.activo!==true||!Number.isFinite(servicio.latitud)||!Number.isFinite(servicio.longitud)||servicio.imagen_url!=="/demo-servicio-veterinaria.jpg")throw Error("Wrong service DEMO image or geocoordinates");
    },page);
    await check("REGIONAL "+spec.pais+" public registration and field card/photo",async()=>{
     await open(page,"/register?pais="+spec.pais,"#country_code");
     if(await page.locator("#country_code").inputValue()!==spec.pais)throw Error("Country selection lost in register");
     await open(page,"/campos?pais="+spec.pais,".campo-card-pub");
     const card=page.locator(".campo-card-pub").filter({has:page.locator('a[href="/campos/'+spec.campo+'"]')}).first();
     if(!await card.count())throw Error("Demo field invisible in country listing");
     const img=await card.locator("img").first().getAttribute("src");
     if(!img?.includes("rentocampo-hero-campo-bn-1920x1080.webp"))throw Error("Wrong DEMO image "+img);
     await overflow(page,"regional fields");
     await open(page,"/campos/"+spec.campo,".ficha-titulo");
     if(!(await page.locator(".ficha-titulo").innerText()).includes("DEMO"))throw Error("Field detail not marked DEMO");
    },page);
    await check("REGIONAL "+spec.pais+" public service card/photo and detail",async()=>{
     await open(page,"/servicios-rurales?pais="+spec.pais,"article.prestador-card[data-demo=true]");
     const card=page.locator("article.prestador-card[data-demo=true]").first();
     if(!(await card.innerText()).includes("DEMO"))throw Error("Demo badge missing");
     const href=await card.getByRole("link",{name:/ver ficha demo/i}).getAttribute("href");
     if(href!=="/servicios-rurales/"+spec.servicio)throw Error("Bad service detail URL "+href);
     const photo=await card.locator("img").first().getAttribute("src");
     if(!photo?.includes("demo-servicio-veterinaria.jpg"))throw Error("Wrong service photo "+photo);
     await open(page,href,".servicio-ficha");
     if(!/Publicación demostrativa|Anúncio demonstrativo/i.test(await page.locator("body").innerText()))throw Error("Service not marked noncommercial");
     await overflow(page,"regional services");
    },page);
    await check("REGIONAL "+spec.pais+" map pins and Lite lists",async()=>{
     await open(page,"/campos/mapa?pais="+spec.pais,".mapa-page");
     await page.locator(".leaflet-interactive").first().waitFor({state:"visible",timeout:18000});
     await open(page,"/campos/mapa?pais="+spec.pais+"&vista=servicios",".mapa-page");
     await page.locator(".leaflet-interactive").first().waitFor({state:"visible",timeout:18000});
     await c.addCookies([{name:"rentocampo_country",value:spec.pais,url:origin}]);
     await open(page,"/lite/campos","body");
     if(!(await page.locator("body").innerText()).includes(spec.campoZona))throw Error("Lite field list missing regional demo");
     await open(page,"/lite/servicios","body");
     if(!(await page.locator("body").innerText()).includes(spec.servicioZona))throw Error("Lite service list missing regional demo");
    },page);
   }finally{await c.close()}
  }
 }finally{await b.close()}
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
 // SMTP is external infrastructure: the hosted UAT project currently rejects
 // new signup email sends with over_email_send_rate_limit. Do not repeatedly
 // consume Auth quotas or misrepresent this test as passing.
 if(process.env.UAT_SMTP_ENABLED!=="true"){
  const name="Public signup + actual email delivery";
  results.push({name,result:"BLOCKED",detail:"Hosted UAT email quota; set UAT_SMTP_ENABLED=true only after configuring isolated test SMTP."});
  console.log("BLOCKED "+name+" (UAT SMTP unconfigured, no production traffic)");
  return;
 }
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
async function generatedConfirmationLink(){
 const b=await chromium.launch(),c=await context(b,{width:390,height:844}),page=await c.newPage();
 try{
  await check("UAT token_hash signup confirmation -> real authenticated dashboard",async()=>{
   // Admin generates a genuine Supabase signup token WITHOUT sending an email.
   // This independently tests our confirmation route while UAT's built-in mail quota is exhausted.
   const email="uat-link-"+randomUUID()+"@yopmail.com";
   const response=await admin.auth.admin.generateLink({
    type:"signup",email,password:"Uat!9"+randomUUID().replaceAll("-",""),
    options:{data:{nombre:"UAT Link",tipo:"productor",country_code:"AR"}}
   });
   if(response.error)throw Error("UAT generateLink: "+response.error.message);
   if(response.data.user?.id)userIds.push(response.data.user.id);
   const token=response.data.properties?.hashed_token;
   if(!token)throw Error("Supabase did not generate a signup token hash");
   await page.goto(origin+"/auth/confirm?token_hash="+encodeURIComponent(token)+"&type=email",{waitUntil:"domcontentloaded",timeout:22000});
   await page.waitForURL(url=>["/dashboard","/login"].includes(new URL(url).pathname),{timeout:20000});
   if(new URL(page.url()).hostname !== new URL(origin).hostname) {
    throw Error("Auth confirmation redirected across hosts and lost the browser's host-only cookies: "+page.url());
   }
   if(new URL(page.url()).pathname!=="/dashboard"){
    const hints=await page.locator(".auth-error, .auth-subtitle, h1").allTextContents();
    throw Error("Token was not confirmed into a browser session; final="+page.url()+"; screen="+hints.slice(0,4).join(" / "));
   }
   await page.locator(".dashboard-title").waitFor({state:"visible",timeout:12000});
   if(response.data.user?.id)await profile(response.data.user.id,"AR","productor");
   await overflow(page,"confirmation dashboard");
  },page);
 }finally{await c.close();await b.close()}
}

async function recover(){
 if (process.env.UAT_SMTP_ENABLED !== "true") {
   results.push({name:"Real password reset email delivery",result:"BLOCKED",detail:"UAT SMTP disabled intentionally; recovery interface tested by public browser matrix."});
   return;
 }
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

// Real authenticated regional writes, isolated to Supabase UAT and cleaned after the run.
const regionalFieldIds=[],regionalServiceIds=[],regionalStoragePaths=[];
async function regionalAuthenticatedWrites(){
 const cases=[
  {country:"AR",provincia:"Buenos Aires",localidad:"Pergamino",lat:-33.8895,lng:-60.5736},
  {country:"UY",provincia:"Colonia",localidad:"Colonia Valdense",lat:-34.337,lng:-57.262},
  {country:"PY",provincia:"Itapúa",localidad:"Encarnación",lat:-27.33,lng:-55.866},
  {country:"BR",provincia:"São Paulo",localidad:"Ribeirão Preto",lat:-21.169,lng:-47.81},
  {country:"CL",provincia:"Ñuble",localidad:"Chillán",lat:-36.6064,lng:-72.1034},
  {country:"BO",provincia:"Santa Cruz",localidad:"Montero",lat:-17.3392,lng:-63.2568},
  {country:"PE",provincia:"Junín",localidad:"Huancayo",lat:-12.0651,lng:-75.2049}
 ];
 const browser=await chromium.launch();
 try{
  for(const x of cases){
   const u={email:"uat-write-"+randomUUID()+"@example.com",password:"Uat!9"+randomUUID().replaceAll("-","")};
   const created=await admin.auth.admin.createUser({email:u.email,password:u.password,email_confirm:true,
    user_metadata:{nombre:"UAT write "+x.country,tipo:"propietario",country_code:x.country}});
   if(created.error)throw Error("UAT actor creation: "+created.error.message);
   userIds.push(created.data.user.id);
   await profile(created.data.user.id,x.country,"propietario");
   const c=await context(browser,{width:390,height:844}),page=await c.newPage();
   try{
    await check("REGIONAL "+x.country+" authenticated field publish, quota and public visibility",async()=>{
     await open(page,"/login","#password");
     await page.locator("#email").fill(u.email);
     await page.locator("#password").fill(u.password);
     await page.getByRole("button",{name:"Ingresar",exact:true}).click();
     await page.waitForURL(/\/dashboard(?:\?|$)/,{timeout:20000});
     await open(page,"/mis-campos/nuevo","form.campo-form");
     if(await page.locator("select[name=country_code]").inputValue()!==x.country)throw Error("Field form lost user's country");
     const payload={country_code:x.country,titulo:"UAT TEMP "+x.country+" "+randomUUID().slice(0,8),
      ubicacion:x.localidad+", "+x.provincia,provincia:x.provincia,localidad:x.localidad,
      hectareas:25,aptitud:"agricola",moneda:"USD",operacion:"alquiler",
      disponibilidad:"a_convenir",mejoras:"No",latitud:x.lat,longitud:x.lng};
     const written=await page.evaluate(async form=>{
      const response=await fetch("/api/campos/publicar",{method:"POST",
       headers:{"Content-Type":"application/json"},body:JSON.stringify({form,estado:"activo"})});
      return {status:response.status,body:await response.json()};
     },payload);
     if(written.status!==200||!written.body.id)throw Error("Authenticated field publish "+JSON.stringify(written));
     regionalFieldIds.push(written.body.id);
     const {data:row,error:err}=await admin.from("campos").select("id,country_code,status,propietario_id").eq("id",written.body.id).single();
     if(err||row.country_code!==x.country||row.status!=="activo"||row.propietario_id!==created.data.user.id)throw Error("Wrong persisted field "+String(err?.message));
     const {data:event,error:evErr}=await admin.from("land_publication_events").select("id").eq("campo_id",written.body.id);
     if(evErr||event?.length!==0)throw Error("Free publication unexpectedly consumed paid quota");
     // The second active publication proves that the old 1-field free quota is gone.
     const second=await page.evaluate(async form=>{
       const r=await fetch("/api/campos/publicar",{method:"POST",headers:{"Content-Type":"application/json"},
         body:JSON.stringify({form:{...form,titulo:form.titulo+" SECOND"},estado:"activo"})});
       return {status:r.status,body:await r.json()};
     },payload);
     if(second.status!==200||!second.body.id)throw Error("Second free publication blocked: "+JSON.stringify(second));
     regionalFieldIds.push(second.body.id);
     if(["AR","BR"].includes(x.country)){
       const img=await page.evaluate(async campoId=>{
         const bytes=Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/VsoAAAAASUVORK5CYII="),ch=>ch.charCodeAt(0));
         const file=new File([bytes],"uat-photo.png",{type:"image/png"});
         const form=new FormData();form.set("campoId",campoId);form.set("orden","0");form.set("file",file);
         const r=await fetch("/api/campos/fotos",{method:"POST",body:form});
         return {status:r.status,body:await r.json()};
       },written.body.id);
       if(img.status!==200||!img.body.id)throw Error("Authenticated photo upload rejected "+JSON.stringify(img));
       const {data:stored,error:pErr}=await admin.from("campos_fotos").select("storage_path").eq("id",img.body.id).single();
       if(pErr||!stored?.storage_path)throw Error("Photo row missing "+pErr?.message);
       regionalStoragePaths.push(stored.storage_path);
       const patched=await page.evaluate(async campoId=>{
         const r=await fetch("/api/campos/fotos",{method:"PATCH",
           headers:{"Content-Type":"application/json"},body:JSON.stringify({campoId,fotos:[]})});
         return {status:r.status,body:await r.json()};
       },written.body.id);
       if(patched.status!==200)throw Error("Photo delete failed: "+JSON.stringify(patched));
       const {data:left}=await admin.from("campos_fotos").select("id").eq("campo_id",written.body.id);
       if(left?.length)throw Error("Removed photo record remains");
     }
     await open(page,"/campos?pais="+x.country,".campo-card-pub");
     if(!await page.locator('a[href="/campos/'+written.body.id+'"]').count())throw Error("Field missing public listing");
    },page);
    await check("REGIONAL "+x.country+" service RLS insert and paid checkout blocked",async()=>{
     await open(page,"/mis-servicios-rurales/nuevo","form.servicio-publicacion-form");
     if(await page.locator("#servicio-pais").inputValue()!==x.country)throw Error("Service form lost user's country");
     const authClient=createClient(uat,pub,{auth:{persistSession:false,autoRefreshToken:false}});
     const signed=await authClient.auth.signInWithPassword({email:u.email,password:u.password});
     if(signed.error)throw Error("Service login failed "+signed.error.message);
     const {data:svc,error:sErr}=await authClient.from("servicios_publicaciones").insert({
      propietario_id:created.data.user.id,country_code:x.country,servicios_rurales:["veterinaria"],
      foto_url:"/demo-servicio-veterinaria.jpg",provincia:x.provincia,localidad:x.localidad,
      zona:x.localidad,detalle:"UAT TEMP regional E2E",latitud:x.lat,longitud:x.lng
     }).select("id").single();
     if(sErr||!svc?.id)throw Error("Service authenticated RLS insert "+sErr?.message);
     regionalServiceIds.push(svc.id);
     const response=await page.evaluate(async()=>{
      const r=await fetch("/api/billing/checkout",{method:"POST",
       headers:{"Content-Type":"application/json"},body:JSON.stringify({planId:"productiva"})});
      return {status:r.status,body:await r.json()};
     });
     if(response.status!==403||response.body.code!=="billing_paused")
      throw Error("Paid checkout must be blocked for all countries "+JSON.stringify(response));
     await open(page,"/servicios-rurales?pais="+x.country,"article.prestador-card");
     if(!(await page.locator("article.prestador-card[data-demo=false]").allTextContents()).some(t=>t.includes("UAT write "+x.country)))throw Error("Authenticated service missing country listing");
     await open(page,"/servicios-rurales/"+svc.id,".servicio-ficha");
     await authClient.auth.signOut();
    },page);
   }finally{await c.close()}
  }
 }finally{await browser.close()}
}

try{
 const r=await admin.auth.admin.listUsers({page:1,perPage:1});
 if(r.error)throw Error("UAT admin verification failed: "+r.error.message);
 await start();await regionalDemoSmoke();await matrix();await deepLinksAndLogins();await regionalAuthenticatedWrites();await register();await generatedConfirmationLink();await recover();
}catch(error){results.push({name:"UAT setup",result:"FAIL",detail:String(error)});console.error(error)}
finally{
 if(regionalServiceIds.length){
  const {error}=await admin.from("servicios_publicaciones").delete().in("id",regionalServiceIds);
  if(error)results.push({name:"UAT service cleanup",result:"FAIL",detail:error.message});
 }
 if(regionalStoragePaths.length){
  const removed=await admin.storage.from("campos-fotos").remove(regionalStoragePaths);
  if(removed.error)results.push({name:"UAT storage cleanup",result:"FAIL",detail:removed.error.message});
 }
 if(regionalFieldIds.length){
  const ev=await admin.from("land_publication_events").delete().in("campo_id",regionalFieldIds);
  if(ev.error)results.push({name:"UAT quota cleanup",result:"FAIL",detail:ev.error.message});
  const fields=await admin.from("campos").delete().in("id",regionalFieldIds);
  if(fields.error)results.push({name:"UAT field cleanup",result:"FAIL",detail:fields.error.message});
 }
 for(const id of userIds){const r=await admin.auth.admin.deleteUser(id);if(r.error)results.push({name:"UAT cleanup",result:"FAIL",detail:r.error.message})}
 if(child)child.kill("SIGINT");
 writeFileSync("test-results/uat-responsive.json",JSON.stringify({date:new Date().toISOString(),target:"localhost Next + Supabase UAT only",engines:Object.keys(engines),viewports,results,notes:"Browser E2E login, recovery, token-hash confirmation against isolated UAT. Hosted UAT SMTP delivery is explicitly BLOCKED unless dedicated SMTP enabled. GA4 blocked."},null,2));
}
const failed=results.filter(r=>r.result==="FAIL").length;
const blocked=results.filter(r=>r.result==="BLOCKED").length;
console.log("UAT CROSS-FORMAT: "+results.filter(r=>r.result==="PASS").length+" PASS; "+failed+" FAIL; "+blocked+" BLOCKED (SMTP delivery not certified)");
if(failed)process.exitCode=1;
