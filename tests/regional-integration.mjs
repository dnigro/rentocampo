import {readFileSync,writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
process.loadEnvFile('.env.local');
const ref='wibqszhvuvpjycheaxzi', url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(url!==`https://${ref}.supabase.co`)throw Error('UAT target mismatch');
if(process.env.RESEND_API_KEY||process.env.MERCADOPAGO_ACCESS_TOKEN)throw Error('Real external integrations must be disabled');
const claims=JSON.parse(Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY.split('.')[1],'base64url'));
if(claims.ref!==ref||claims.role!=='service_role')throw Error('Private key target mismatch');
const config={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,config);
const anon=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,config);
const results=[],actors=[],fields=[],serviceIds=[],photoPaths=[];
const stamp=Date.now(),base='http://127.0.0.1:3000';
function record(test,ok,evidence){
 const row={test,result:ok?'PASS':'FAIL',evidence};
 results.push(row);console.log(JSON.stringify(row));
 if(!ok)process.exitCode=1;
}
function checked(r,label){if(r.error)throw Error(label+': '+r.error.message);return r.data;}
function cookie(a){return [...a.cookies].map(([k,v])=>k+'='+v).join('; ');}
async function req(a,path,method='GET',body){const r=await fetch(base+path,{method,headers:{...(a?{Cookie:cookie(a)}:{}),...(body===undefined||body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body),redirect:'manual',signal:AbortSignal.timeout(180000)});const text=await r.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:r.status,data,headers:r.headers};}
async function makeActor(country){const password=randomBytes(24).toString('base64url'),name=`UAT-${stamp}-${country}`;
 const user=checked(await admin.auth.admin.createUser({email:`uat-${stamp}-${country.toLowerCase()}@example.invalid`,password,email_confirm:true,user_metadata:{nombre:name,tipo:'propietario',country_code:country}}),'create disposable fixture').user;
 const a={country,name,id:user.id,cookies:new Map()};actors.push(a);
 a.client=createServerClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[...a.cookies].map(([name,value])=>({name,value})),setAll:cs=>cs.forEach(c=>a.cookies.set(c.name,c.value))}});
 checked(await a.client.auth.signInWithPassword({email:user.email,password}),'fixture login');
 const p=checked(await admin.from('profiles').select('country_code,roles').eq('id',a.id).single(),'profile');
 record(`Initial profile country ${country}`,p.country_code===country,`requested=${country}; persisted=${p.country_code}; admin-created fixture, not signup UI`);

 return a;
}
const locations={AR:{provincia:'Santa Fe',localidad:'Rafaela',latitud:-31.25,longitud:-61.49,moneda:'ARS'},UY:{provincia:'Maldonado',localidad:'Maldonado',latitud:-34.9,longitud:-54.95,moneda:'UYU'},PY:{provincia:'Itapúa',localidad:'Encarnación',latitud:-27.33,longitud:-55.87,moneda:'PYG'}};
function form(a,country){return {country_code:country,titulo:`${a.name}-campo`,descripcion:'Ficticio UAT sin oferta comercial',ubicacion:locations[country].localidad,departamento:locations[country].provincia,...locations[country],hectareas:100,aptitud:'agricola',operacion:'alquiler',disponibilidad:'a_convenir'};}
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1'],{env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});let serverLog='';child.stdout.on('data',b=>serverLog+=b);child.stderr.on('data',b=>serverLog+=b);
try{
 console.log('Preparing disposable AR/UY/PY actors; no external email or payment credentials');
 for(let i=0;i<100&&!serverLog.includes('Ready in')&&child.exitCode===null;i++)await new Promise(r=>setTimeout(r,200));
 if(!serverLog.includes('Ready in'))throw Error('Server failed to start: '+serverLog.slice(-1200));
 await Promise.all(['AR','UY','PY'].map(makeActor));
 await Promise.all(actors.map(async a=>{const r=await req(a,'/api/campos/publicar','POST',{estado:'activo',form:form(a,a.country)});record(`Own-market field creation ${a.country}`,r.status===200,`HTTP ${r.status}`);if(!r.data.id)throw Error('Cannot prepare field');a.field=r.data.id;fields.push(a.field);}));
 console.log('Checking cross-country edits and anonymous country queries');
 for(const country of ['AR','UY','PY'])await Promise.all(actors.map(async a=>{const r=await req(a,'/api/campos/publicar','PATCH',{campoId:a.field,estado:'activo',form:form(a,country)});const saved=checked(await anon.from('campos').select('country_code,provincia,moneda').eq('id',a.field).single(),'read edited field');record(`Account ${a.country} publishes in ${country}`,r.status===200&&saved.country_code===country&&saved.provincia===locations[country].provincia&&saved.moneda===locations[country].moneda,`HTTP ${r.status}; ${saved.country_code}/${saved.provincia}/${saved.moneda}`);}));
 await Promise.all(actors.map(a=>req(a,'/api/campos/publicar','PATCH',{campoId:a.field,estado:'activo',form:form(a,a.country)})));
 const ar=actors.find(a=>a.country==='AR'),uy=actors.find(a=>a.country==='UY'),py=actors.find(a=>a.country==='PY');
 console.log('Checking ownership and free quota');
 const [edit,del,quota]=await Promise.all([req(py,'/api/campos/publicar','PATCH',{campoId:uy.field,estado:'activo',form:{titulo:'forbidden'}}),req(py,'/api/campos/'+uy.field,'DELETE'),req(uy,'/api/campos/publicar','POST',{estado:'activo',form:{...form(uy,'UY'),titulo:'second-free'}})]);
 record('Other account cannot edit field through app API',edit.status===404,`HTTP ${edit.status}`);record('Other account cannot delete field through app API',del.status===404,`HTTP ${del.status}`);record('Second free active publication rejected',quota.status===409&&quota.data.code==='quota_exhausted',`HTTP ${quota.status}; ${quota.data.code}`);
 for(const country of ['AR','UY','PY']){const a=actors.find(a=>a.country===country);const r=await req(a,'/api/profile','POST',{nombre:a.name,roles:['propietario','prestador'],country_code:country});const p=checked(await admin.from('profiles').select('country_code').eq('id',a.id).single(),'profile after API');record(`Save profile country ${country}`,r.status===200&&p.country_code===country,`HTTP ${r.status}; persisted=${p.country_code}`);}
 console.log('Checking favorites');
 const fav=await req(py,'/api/favoritos','POST',{campoId:uy.field});const ownFav=await req(py,'/api/favoritos?campoId='+uy.field);const otherFav=await req(ar,'/api/favoritos?campoId='+uy.field);
 record('Favorite add and reload',fav.status===200&&ownFav.data.esFavorito===true,`POST ${fav.status}; GET favorite=${ownFav.data.esFavorito}`);record('Favorites isolated between accounts',otherFav.data.esFavorito===false,'Other account favorite=false');
 const rmFav=await req(py,'/api/favoritos?campoId='+uy.field,'DELETE');const gone=await req(py,'/api/favoritos?campoId='+uy.field);record('Favorite delete persists',rmFav.status===200&&gone.data.esFavorito===false,`DELETE ${rmFav.status}; reload favorite=${gone.data.esFavorito}`);
 console.log('Checking field and direct messages; email notifications intentionally disabled');
 const msg=await req(py,'/api/mensajes','POST',{campoId:uy.field,destinatarioId:uy.id,contenido:'Mensaje UAT ficticio'});record('Field contact persists message',msg.status===200&&!!msg.data.mensaje?.id,`HTTP ${msg.status}; notificationSent=${msg.data.notificationSent}`);
 if(msg.data.mensaje?.id){const seen=checked(await uy.client.from('mensajes').select('id').eq('id',msg.data.mensaje.id),'recipient message');const hidden=checked(await ar.client.from('mensajes').select('id').eq('id',msg.data.mensaje.id),'outsider message');record('Field message recipient sees own conversation',seen.length===1,'recipient rows='+seen.length);record('Field message hidden from third account',hidden.length===0,'outsider rows='+hidden.length);}
 const invalid=await req(py,'/api/mensajes','POST',{campoId:uy.field,destinatarioId:ar.id,contenido:'forbidden'});record('Field contact rejects unrelated recipient',invalid.status===403,`HTTP ${invalid.status}`);
 const direct=await req(py,'/api/mensajes/directos','POST',{destinatarioId:uy.id,contenido:'Directo UAT ficticio'});const read=await req(uy,'/api/mensajes/directos?interlocutorId='+py.id);const stranger=await req(ar,'/api/mensajes/directos?interlocutorId='+py.id);
 record('Direct message sent and read through app API',direct.status===200&&read.status===200&&read.data.mensajes?.some(m=>m.id===direct.data.mensaje?.id),`POST ${direct.status}; GET ${read.status}; notificationSent=${direct.data.notificationSent}`);record('Direct conversation hidden from third account',stranger.status===200&&stranger.data.mensajes?.length===0,'third-party rows='+stranger.data.mensajes?.length);
 if(direct.data.mensaje?.id){const d=checked(await admin.from('mensajes_directos').select('leido').eq('id',direct.data.mensaje.id).single(),'read marker');record('Direct read receipt persists',d.leido===true,'leido='+d.leido);}
 console.log('Checking service photo and service publication contract');
 const photo=new FormData();photo.set('file',new Blob([readFileSync('public/hero-campo.jpeg')],{type:'image/jpeg'}),'uat-service.jpg');const upload=await req(uy,'/api/profile/service-photo','POST',photo);record('Service photo upload through application API',upload.status===200&&!!upload.data.url,`HTTP ${upload.status}`);
 if(upload.data.url){const objectPath=new URL(upload.data.url).pathname.split('/avatars/')[1];photoPaths.push({bucket:'avatars',path:decodeURIComponent(objectPath)});const p=checked(await uy.client.from('profiles').select('service_photo_url').eq('id',uy.id).single(),'service photo profile');const image=await fetch(upload.data.url,{signal:AbortSignal.timeout(30000)});record('Service photo persists and loads',p.service_photo_url===upload.data.url&&image.status===200,'profile URL persists; image HTTP '+image.status);}
 for(const a of actors){const payload={propietario_id:a.id,servicios_rurales:['veterinaria'],foto_url:upload.data.url??'/hero-campo.jpeg',provincia:locations[a.country].provincia,localidad:locations[a.country].localidad,zona:'UAT',detalle:a.name,...{latitud:locations[a.country].latitud,longitud:locations[a.country].longitud}};const s=checked(await a.client.from('servicios_publicaciones').insert(payload).select('*').single(),'service insert');serviceIds.push(s.id);a.service=s.id;record(`Service CRUD insert ${a.country}`,!!s.id,'Direct Data API as used by service form; row persisted');record(`Service stores explicit country ${a.country}`,s.country_code===a.country,'country_code '+(s.country_code??'ABSENT'));}
 const changedService=await py.client.from('servicios_publicaciones').update({detalle:'forbidden'}).eq('id',uy.service).select('id');record('Service rejects cross-account edit',!changedService.error&&changedService.data.length===0,'affected rows='+changedService.data?.length);
 const ownService=checked(await uy.client.from('servicios_publicaciones').update({detalle:'UAT edited'}).eq('id',uy.service).select('detalle').single(),'service edit');record('Service own edit persists',ownService.detalle==='UAT edited','detail persisted');
 console.log('Checking actual server-rendered lists (HTTP only; not browser)');
 for(const a of actors){const r=await req(null,'/campos?pais='+a.country);record(`Field server list ${a.country}`,r.status===200&&typeof r.data==='string'&&r.data.includes(a.name+'-campo'),`HTTP ${r.status}; own fixture title included`);}
 for(const a of actors){const r=await req(null,'/servicios-rurales?pais='+a.country);record(`Service server list ${a.country}`,r.status===200&&typeof r.data==='string'&&r.data.includes(a.name),`HTTP ${r.status}; fixture owner ${r.data.includes?.(a.name)?'present':'ABSENT'}`);}
 console.log('Checking regional registration, filters and invalid inputs');
 for(const a of actors){
  const registration = await req(null, `/register?pais=${a.country}&tipo=propietario`);
  const html = registration.data;
  record(`Registration SSR country/role ${a.country}`, registration.status===200 && new RegExp(`<option(?=[^>]*value="${a.country}")(?=[^>]*selected)[^>]*>`).test(html) && /<input(?=[^>]*id="tipo-propietario")(?=[^>]*checked)[^>]*>/.test(html), `HTTP ${registration.status}; server-rendered defaults, not browser interaction`);
  const fallback = await fetch(base+'/register?tipo=prestador',{headers:{Cookie:`rentocampo_country=${a.country}`}});
  const fallbackHtml = await fallback.text();
  record(`Registration saved-country fallback ${a.country}`, fallback.status===200 && new RegExp(`<option(?=[^>]*value="${a.country}")(?=[^>]*selected)[^>]*>`).test(fallbackHtml), `HTTP ${fallback.status}; cookie preference`);
  const map = await req(null, `/campos/mapa?pais=${a.country}&provincia=${encodeURIComponent(locations[a.country].provincia)}&aptitud=agricola&operacion=alquiler`);
  record(`Map keeps matching department and filters ${a.country}`,map.status===200&&map.data.includes(a.name+'-campo')&&map.data.includes('aptitud=agricola'),`HTTP ${map.status}; matching field and return filters present`);
  const empty = await req(null, `/campos/mapa?pais=${a.country}&provincia=Artigas&aptitud=ganadera`);
  record(`Map excludes nonmatching field ${a.country}`,empty.status===200&&!empty.data.includes(a.name+'-campo'),`HTTP ${empty.status}; nonmatching fixture absent`);
 }
 const invalidProfile = await req(uy,'/api/profile','POST',{nombre:uy.name,roles:['propietario'],country_code:'CL'});
 record('Profile rejects unsupported country',invalidProfile.status===400,`HTTP ${invalidProfile.status}`);
 const persisted = checked(await admin.from('profiles').select('country_code').eq('id',uy.id).single(),'invalid country check');
 record('Rejected profile update preserves previous country',persisted.country_code==='UY','UY retained');
 const explicit = checked(await uy.client.from('servicios_publicaciones').update({country_code:'PY'}).eq('id',uy.service).select('country_code').single(),'service explicit market');
 record('Service can use explicit market independently of owner profile',explicit.country_code==='PY','owner UY; publication PY');
 checked(await uy.client.from('servicios_publicaciones').update({country_code:'UY'}).eq('id',uy.service),'restore service market');
 const invalidService=await uy.client.from('servicios_publicaciones').update({country_code:'CL'}).eq('id',uy.service);
 record('Service rejects unsupported country',!!invalidService.error,'country constraint rejects CL');
 const deactivated=checked(await uy.client.from('servicios_publicaciones').update({activo:false}).eq('id',uy.service).select('activo').single(),'service deactivate');const publicly=checked(await anon.from('servicios_publicaciones').select('id').eq('id',uy.service),'service anon');record('Inactive service hidden from anonymous API',deactivated.activo===false&&publicly.length===0,'public rows='+publicly.length);
 const dash=await req(null,'/dashboard');record('Unauthenticated dashboard redirects to login',[302,303,307,308].includes(dash.status)&&dash.headers.get('location')?.includes('/login'),`HTTP ${dash.status}; login redirect`);
 const selfmsg=await req(py,'/api/mensajes/directos','POST',{destinatarioId:py.id,contenido:'self'});record('Direct message to self rejected',selfmsg.status===400,`HTTP ${selfmsg.status}`);
}catch(e){results.push({test:'Execution blocker',result:'BLOCKED',evidence:e.message});console.log(JSON.stringify(results.at(-1)));process.exitCode=1;}
finally{
 console.log('Cleaning only disposable fixture accounts and their records');
 for(const a of actors){try{await a.client.auth.signOut();}catch{}}
 for(const item of photoPaths){const r=await admin.storage.from(item.bucket).remove([item.path]);if(r.error)record('Fixture storage cleanup',false,r.error.message);}
 for(const a of actors){const r=await admin.auth.admin.deleteUser(a.id);if(r.error)record('Fixture account cleanup',false,r.error.message);}
 const check=await admin.from('campos').select('id').in('id',fields.length?fields:['00000000-0000-0000-0000-000000000000']);record('Fixture field cleanup verified',!check.error&&check.data.length===0,'remaining fixture fields='+check.data?.length);
 writeFileSync('tests/regional-integration-results.json',JSON.stringify({candidate:process.env.UAT_CANDIDATE_SHA??'PR198 working tree after regional fixes',date:new Date().toISOString(),scope:'HTTP/API + authenticated Data API; NOT browser E2E; extra accounts are admin-created disposable fixtures',results},null,2));
 child.kill('SIGINT');
}
