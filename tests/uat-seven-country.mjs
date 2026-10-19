import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

const origin = "http://127.0.0.1:3000";
const expectedUat = "https://wibqszhvuvpjycheaxzi.supabase.co";
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== expectedUat ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_") ||
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env.RESEND_API_KEY || process.env.VERCEL_ENV) {
  throw new Error("Refusing test with production, payment, email or privileged credentials.");
}
const countries = [
  {code:"AR",field:"044",service:"016",place:"Pergamino"},
  {code:"UY",field:"045",service:"017",place:"Colonia"},
  {code:"PY",field:"046",service:"018",place:"Itapúa"},
  {code:"CL",field:"041",service:"013",place:"Ñuble"},
  {code:"BO",field:"042",service:"014",place:"Santa Cruz"},
  {code:"PE",field:"043",service:"015",place:"Junín"},
  {code:"BR",field:"047",service:"019",place:"Ribeirão Preto"}
];
const fieldId = code => "20000000-0000-4000-8000-000000000" + code;
const serviceId = code => "10000000-0000-4000-8000-000000000" + code;
const reports = [];
mkdirSync("test-results/seven-country", {recursive:true});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let server;
async function check(name, callback, page) {
  try { await callback(); reports.push({name, status:"PASS"}); console.log("PASS "+name); }
  catch(e) {
    reports.push({name,status:"FAIL",detail:String(e).slice(0,1500)});
    console.error("FAIL "+name+" "+String(e).slice(0,500));
    if (page && !page.isClosed()) await page.screenshot({path:"test-results/seven-country/failure-"+reports.length+".png",fullPage:true,timeout:4000}).catch(()=>{});
  }
}
async function open(page,path,selector) {
  const res=await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:25000});
  if(res?.status()!==200)throw Error("HTTP "+res?.status()+" for "+path);
  await page.locator(selector).first().waitFor({state:"visible",timeout:12000});
}
async function waitReady() {
  for(let n=0;n<120;n++){
    if(server.exitCode!==null)throw Error("Next server exited before ready");
    try{const res=await fetch(origin+"/login",{signal:AbortSignal.timeout(1200)});if(res.status===200)return;}catch{}
    await sleep(500);
  }
  throw Error("UAT server did not start");
}
async function run() {
  server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port","3000"],{
    env:{...process.env,NEXT_TELEMETRY_DISABLED:"1"},stdio:"ignore"
  });
  await waitReady();
  const browser=await chromium.launch();
  try {
    for (const size of [{name:"desktop",width:1440,height:900},{name:"mobile",width:390,height:844}]) {
      const context=await browser.newContext({viewport:size,locale:"es-AR"});
      await context.route(/(googletagmanager|google-analytics|analytics.google)/,r=>r.abort());
      try {
        const page=await context.newPage();
        await check(size.name+" country changes on first selection",async()=>{
          await open(page,"/?pais=AR",".navbar");
          const sel=size.name==="desktop"?page.locator(".navbar-desktop select"):page.locator(".navbar-mobile-right select");
          await sel.selectOption("BR");
          await page.waitForFunction(() => new URL(location.href).searchParams.get("pais")==="BR",null,{timeout:7500});
          if(await sel.inputValue()!=="BR")throw Error("Double selection required");
          const lang=await page.evaluate(()=>document.documentElement.lang);
          if(lang!=="pt-BR")throw Error("Locale not switched: "+lang);
          await page.getByText("GRÁTIS PARA O CAMPO.",{exact:false}).first().waitFor({state:"visible",timeout:8000});
          const cookie=await context.cookies();if(!cookie.find(c=>c.name==="rentocampo_country"&&c.value==="BR"))throw Error("Country cookie not persisted");
          await sel.selectOption("AR");
          await page.waitForFunction(() => new URL(location.href).searchParams.get("pais")==="AR",null,{timeout:7500});
          if(await sel.inputValue()!=="AR")throw Error("Could not switch back on first selection");
        },page);
        await check(size.name+" regional map recenters after country selection",async()=>{
          await open(page,"/campos/mapa?pais=AR",".mapa-wrapper");
          const selector=size.name==="desktop"?page.locator(".navbar-desktop select"):page.locator(".navbar-mobile-right select");
          await page.waitForFunction((selectorText) => {
            const s=document.querySelector(selectorText);
            return s && !s.disabled;
          },size.name==="desktop"?".navbar-desktop select":".navbar-mobile-right select");
          const regions=[
            {code:"PY",center:"-23.7,-58.3"},
            {code:"UY",center:"-32.8,-56"},
            {code:"BO",center:"-16.7,-64.7"},
            {code:"BR",center:"-14.2,-51.9"},
            {code:"CL",center:"-35.7,-71.5"},
            {code:"PE",center:"-9.4,-75.2"},
            {code:"AR",center:"-34,-63.5"}
          ];
          for(const region of regions){
            await selector.selectOption(region.code);
            await page.waitForFunction(({code,center})=>{
              const wrapper=document.querySelector(".mapa-wrapper");
              return new URL(location.href).searchParams.get("pais")===code &&
                wrapper?.getAttribute("data-country")===code &&
                wrapper?.getAttribute("data-map-center")===center;
            },region,{timeout:12000});
          }
          await page.screenshot({path:"test-results/seven-country/map-country-"+size.name+".png",fullPage:true});
        },page);
        await check(size.name+" unified Fields and Services header layout",async()=>{
          for(const path of ["/campos?pais=PY","/servicios-rurales?pais=PY"]){
            await open(page,path,".rc-explorer-header");
            const actions=page.locator(".rc-explorer-toolbar");
            await actions.getByRole("link",{name:/ver en mapa/i}).waitFor({state:"visible"});
            if(await actions.locator("#listing-country").inputValue()!=="PY")throw Error("Country selector not aligned");
            if(await actions.locator(".rc-explorer-toolbar__related").count()!==1)throw Error("Related listing link missing");
          }
          await page.screenshot({path:"test-results/seven-country/explorer-header-"+size.name+".png",fullPage:true});
        },page);
        await check(size.name+" responsive filters precede both listing types",async()=>{
          for(const path of ["/campos?pais=PY","/servicios-rurales?pais=PY"]){
            await open(page,path,".rc-explorer-filters");
            const filters=page.locator(".rc-explorer-filters");
            const positions=await page.evaluate(()=>{
              const filters=document.querySelector(".rc-explorer-filters");
              const results=document.querySelector(".rc-explorer-grid__results, .explorador-contenido");
              return {filters:filters?.getBoundingClientRect().top, results:results?.getBoundingClientRect().top};
            });
            if(positions.filters===undefined||positions.results===undefined)throw Error("Missing filter/results panels");
            if(size.name==="mobile"){
              const toggle=filters.locator(".rc-explorer-filters__toggle");
              await toggle.waitFor({state:"visible"});
              if(await toggle.getAttribute("aria-expanded")!=="false")throw Error("Filter drawer should initially be collapsed");
              await toggle.click();
              if(await toggle.getAttribute("aria-expanded")!=="true")throw Error("Filter drawer did not open");
              await filters.locator(".filtros-panel").waitFor({state:"visible"});
              await toggle.click();
              if(await toggle.getAttribute("aria-expanded")!=="false")throw Error("Filter drawer did not close");
            } else {
              await filters.locator(".filtros-panel").waitFor({state:"visible"});
              if(positions.filters>positions.results+80)throw Error("Desktop filters are still below results");
            }
          }
        },page);
        await check(size.name+" Lite offers filters before its cards",async()=>{
          for(const kind of ["campos","servicios"]){
            await open(page,"/lite/"+kind,"main");
            const selector=page.locator('main a[href*="/lite/'+kind+'/filtrar?pais="]').first();
            const visible=await selector.isVisible();
            if(!visible)throw Error("Lite filters action not visible");
            const preceding=await page.evaluate(kind=>{
              const filter=document.querySelector('main a[href*="/lite/'+kind+'/filtrar?pais="]');
              const card=document.querySelector('main .campo-card-pub, main .lite-campo-card, main article');
              return !card||Boolean(filter&&(filter.compareDocumentPosition(card)&Node.DOCUMENT_POSITION_FOLLOWING));
            },kind);
            if(!preceding)throw Error("Lite filter CTA is after a card");
          }
        },page);
        await check(size.name+" regional productive zones are visible, not clipped, and register locally",async()=>{
          for (const x of countries) {
            await context.addCookies([{name:"rentocampo_country",value:x.code,url:origin}]);
            await open(page,"/campos?pais="+x.code,".rc-regions-showcase");
            const zone=page.locator(".rc-regions-showcase");
            const cards=zone.locator(".rc-regions-showcase__card");
            if(await cards.count()!==4)throw Error(x.code+": missing regional cards");
            const links=cards.locator("a.rc-regions-showcase__action");
            if(await links.count()!==4)throw Error(x.code+": registration links missing");
            for(const href of await links.evaluateAll(nodes=>nodes.map(n=>n.getAttribute("href")))){
              const url=new URL(href,origin);
              if(url.pathname!=="/register"||url.searchParams.get("pais")!==x.code||url.searchParams.get("tipo")!=="propietario"||!url.searchParams.get("zona"))throw Error(x.code+": wrong registration link "+href);
            }
            if(await zone.getByText(/demanda activa|hay productores buscando tierra/i).count())throw Error(x.code+": misleading demand statement");
            const box=await zone.boundingBox();
            const head=await zone.locator("h2").boundingBox();
            if(!box||!head||head.x < box.x-2||head.x+head.width > box.x+box.width+2)throw Error(x.code+": heading overflow/clipped");
          }
          await page.screenshot({path:"test-results/seven-country/regions-"+size.name+".png",fullPage:true});
        },page);
        if(size.name==="mobile") {
          await check("mobile hero pills and video layout at 320, 390 and 430px",async()=>{
            for(const country of ["AR","BR"]) {
              await context.addCookies([{name:"rentocampo_country",value:country,url:origin}]);
              for(const width of [320,390,430]){
                await page.setViewportSize({width,height:844});
                await open(page,"/?pais="+country,".triptychHero__panelCta");
                const layout=await page.evaluate(()=>{
                  const hero=document.querySelector(".triptychHero");
                  const ctas=[...document.querySelectorAll(".triptychHero__panelCta")].filter(el=>el.getBoundingClientRect().width>2);
                  const panels=[...document.querySelectorAll(".triptychHero__panel")].filter(el=>el.getBoundingClientRect().width>2);
                  const register=document.querySelector(".triptychHero__button--register");
                  const section=document.querySelector(".rc-map-section");
                  const video=document.querySelector(".rc-map-section .rc-aerial-video");
                  const copy=document.querySelector(".rc-map-section .rc-map-copy");
                  return {
                    count:ctas.length,
                    ctas:ctas.map((el,index)=>{
                      const box=el.getBoundingClientRect();
                      const midY=box.y+box.height/2;
                      const samples=[box.x+5,box.x+box.width/2,box.right-5].map(x=>{
                        const node=document.elementFromPoint(x,midY);
                        return node===panels[index]||panels[index]?.contains(node);
                      });
                      return {label:el.textContent?.trim(),overflow:el.scrollWidth>el.clientWidth+2,
                        width:box.width,height:box.height,samples};
                    }),
                    registerBottom:register?.getBoundingClientRect().bottom,
                    videoTop:video?.getBoundingClientRect().top,
                    copyTop:copy?.getBoundingClientRect().top,
                    videoBottom:video?.getBoundingClientRect().bottom,
                    heroBottom:hero?.getBoundingClientRect().bottom,
                    sectionTop:section?.getBoundingClientRect().top,
                    horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2
                  };
                });
                if(layout.count!==3)throw Error("Expected three image CTAs: "+JSON.stringify(layout));
                for(const cta of layout.ctas){
                  if(cta.overflow||!cta.samples.every(Boolean))throw Error("Clipped CTA at "+country+"/"+width+": "+JSON.stringify(cta));
                }
                const gap=layout.videoTop-layout.registerBottom;
                if(gap<0||gap>28)throw Error("Video must closely follow registration ("+country+"/"+width+"): "+gap);
                if(layout.copyTop<layout.videoBottom-2)throw Error("Video is not above section copy");
                if(layout.horizontalOverflow)throw Error("Horizontal overflow on "+width+"px");
                await page.screenshot({path:"test-results/seven-country/hero-"+country+"-"+width+".png",fullPage:true});
              }
            }
            await page.setViewportSize({width:390,height:844});
          },page);
        }
        await check(size.name+" free home and no pack calls-to-action",async()=>{
          await open(page,"/?pais=AR",".rc-faq");
          const faq=(await page.locator(".rc-faq").innerText()).toLowerCase();
          if(!faq.includes("100% gratis") || faq.includes("pack tierra productiva"))throw Error("Paid pack marketing visible");
        },page);
        for(const x of countries){
          await context.addCookies([{name:"rentocampo_country",value:x.code,url:origin}]);
          await check(size.name+" "+x.code+" field DEMO listing, photo and safe detail",async()=>{
            await open(page,"/campos?pais="+x.code,".campo-card-pub");
            const card=page.locator(".campo-card-pub").filter({has:page.locator('a[href="/campos/'+fieldId(x.field)+'"]')}).first();
            await card.waitFor({state:"visible",timeout:9500});
            if(!(await card.innerText()).includes("DEMO"))throw Error("No DEMO label on card");
            const src=await card.locator("img").first().getAttribute("src");
            if(!src?.includes("rentocampo-hero-campo-bn-1920x1080.webp"))throw Error("Wrong DEMO image "+src);
            await open(page,"/campos/"+fieldId(x.field),".ficha-demo-notice");
            const text=await page.locator(".ficha-demo-notice").innerText();
            if(!text.includes("DEMO"))throw Error("Missing DEMO notice");
            if(await page.locator(".btn-consultar").filter({hasText:/consultar campo|consultar terra/i}).count())throw Error("Commercial consultation enabled on DEMO");
          },page);
          await check(size.name+" "+x.code+" service DEMO listing, photo and detail",async()=>{
            await open(page,"/servicios-rurales?pais="+x.code,'article.prestador-card[data-demo="true"]');
            const card=page.locator('article.prestador-card[data-demo="true"]').filter({has:page.locator('a[href="/servicios-rurales/'+serviceId(x.service)+'"]')}).first();
            await card.waitFor({state:"visible",timeout:9500});
            const src=await card.locator("img").first().getAttribute("src");
            if(!src?.includes("demo-servicio-veterinaria.jpg"))throw Error("Wrong service DEMO image: "+src);
            await open(page,"/servicios-rurales/"+serviceId(x.service),".servicio-ficha");
            if(!(await page.locator(".servicio-ficha").innerText()).match(/DEMO|demonstrativ|demostrativ/i))throw Error("Service DEMO disclaimer missing");
          },page);
          await check(size.name+" "+x.code+" map and Lite country views",async()=>{
            await open(page,"/campos/mapa?pais="+x.code,".mapa-page");
            await open(page,"/lite/campos","body");
            if(!(await page.locator("body").innerText()).includes(x.place))throw Error("Lite fields miss DEMO");
            await open(page,"/lite/servicios","body");
            const content=await page.locator("body").innerText();
            if(!content.includes(x.code==="BR"?"Ribeirão Preto":x.code==="PE"?"La Libertad":x.code==="CL"?"Maule":x.code==="BO"?"Santa Cruz":x.code==="PY"?"Itapúa":x.code==="UY"?"Colonia":"Pergamino"))throw Error("Lite services miss DEMO");
          },page);
        }
        await check(size.name+" public login and recovery screens",async()=>{
          await open(page,"/login?pais=BR","#password");
          await open(page,"/recuperar-contrasena?pais=BR","#email");
          await open(page,"/register?pais=BR","#country_code");
          if(await page.locator("#country_code").inputValue()!=="BR")throw Error("BR signup not selected");
        },page);
        await context.close();
      } catch (e) {await context.close();throw e;}
    }
    const response=await fetch(origin+"/api/billing/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planId:"productiva"})});
    await check("Direct paid checkout disabled across countries",async()=>{
      const body=await response.json();
      if(response.status!==403 || body.code!=="billing_paused")throw Error("Checkout remained available: "+response.status);
    });
  } finally { await browser.close(); }
}
try {await run();}
finally {
  server?.kill("SIGINT");
  const status={candidate:process.env.UAT_CANDIDATE_SHA,scope:"isolated browser+public UAT data, no real signup or private role keys",checks:reports};
  writeFileSync("test-results/seven-country/results.json",JSON.stringify(status,null,2));
  console.log("UAT:",reports.filter(x=>x.status==="PASS").length,"pass,",reports.filter(x=>x.status==="FAIL").length,"fail");
}
if(reports.some(x=>x.status==="FAIL"))process.exitCode=1;
