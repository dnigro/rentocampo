import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

/* Read-only UAT: never use production, privileged, payment or email credentials. */
const origin="http://127.0.0.1:3000";
if(process.env.NEXT_PUBLIC_SUPABASE_URL!=="https://wibqszhvuvpjycheaxzi.supabase.co"||
 !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_")||
 process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.MERCADOPAGO_ACCESS_TOKEN||
 process.env.RESEND_API_KEY||process.env.VERCEL_ENV)throw Error("UAT-only public key required");
const results=[];mkdirSync("test-results/design-uat",{recursive:true});
const sleep=n=>new Promise(r=>setTimeout(r,n));
let server;
async function check(name,page,fn){
 try{await fn();results.push({name,status:"PASS"});console.log("PASS "+name)}
 catch(e){results.push({name,status:"FAIL",detail:String(e).slice(0,500)});console.error("FAIL "+name+" "+e);
  if(page&&!page.isClosed())await page.screenshot({path:"test-results/design-uat/error-"+results.length+".png",fullPage:true,timeout:5000}).catch(()=>{})}
}
async function open(page,path,selector="body"){
 const r=await page.goto(origin+path,{waitUntil:"domcontentloaded",timeout:30000});
 if(r?.status()!==200)throw Error(path+" HTTP "+r?.status());
 await page.locator(selector).first().waitFor({state:"visible",timeout:12000});
}
async function noOverflow(page){
 const s=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 if(s.scroll>s.width+3)throw Error("Horizontal overflow "+JSON.stringify(s));
}
try{
 server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port","3000"],{env:{...process.env,NEXT_TELEMETRY_DISABLED:"1"},stdio:"ignore"});
 let ready=false;
 for(let i=0;i<120;i++){
  if(server.exitCode!==null)throw Error("UAT Next server stopped");
  try{const r=await fetch(origin+"/",{signal:AbortSignal.timeout(900)});if(r.status===200){ready=true;break}}catch{}
  await sleep(400);
 }
 if(!ready)throw Error("UAT local server not ready");
 const browser=await chromium.launch();
 try{
  for(const [label,width,height] of [["320",320,740],["390",390,844],["768",768,1024],["1440",1440,900]]){
   const context=await browser.newContext({viewport:{width,height},locale:"es-AR"});
   const page=await context.newPage();await page.route(/googletagmanager|google-analytics/,route=>route.abort());
   await check("Home / FAQ / header / footer "+label,page,async()=>{
    await open(page,"/","#rcf-hero-title");
    if(!(await page.locator("#rcf-hero-title").innerText()).includes("SIN VUELTAS"))throw Error("Wrong claim");
    await page.getByText("CONECTÁ DIRECTO.",{exact:true}).waitFor({state:"visible"});
    if((await page.locator(".rcf-hero__metric-value").count())!==2)throw Error("Missing 0% or 100% metric");
    if((await page.locator(".rcf-actions a").count())!==2)throw Error("Wrong CTA count");
    if((await page.locator(".rc-how--web .rc-how__step").count())!==3)throw Error("How it works count");
    if((await page.locator(".rcf-faq__item").count())!==5)throw Error("FAQ count");
    await page.locator(".rcf-faq__item summary").first().click();
    if(!(await page.locator(".rcf-faq__item").first().evaluate(e=>e.open)))throw Error("FAQ does not open");
    if(!await page.locator(".navbar").count()||!await page.locator("footer.footer").count())throw Error("Header/footer absent");
    if(!await page.locator('a[href="/#como-funciona"]').count())throw Error("Menu anchor missing");
    const desktopHowLink = page.locator('.navbar-links a[href="/#como-funciona"]');
    if (await desktopHowLink.isVisible()) {
      await desktopHowLink.click();
    } else {
      await page.locator('button.hamburguesa').click();
      await page.locator('.mobile-menu-nav a[href="/#como-funciona"]').click();
    }
    await page.waitForFunction(()=>location.hash==="#como-funciona",{timeout:7000});
    if(!await page.locator('section#como-funciona').isVisible())throw Error("How it works anchor broken");
    await noOverflow(page);
    if(label==="390"||label==="1440")await page.screenshot({path:"test-results/design-uat/home-"+label+".png",fullPage:true});
   });
   await check("Lite / header / footer "+label,page,async()=>{
    await open(page,"/lite",".rcLiteDirectHero__title");
    if(!(await page.locator(".rcLiteDirectHero__title").innerText()).includes("SIN VUELTAS"))throw Error("Lite claim");
    if((await page.locator(".rcLiteDirectHero__metric strong").count())!==2)throw Error("Lite metrics");
    if((await page.locator(".rcLiteBottomNav a").count())!==4)throw Error("Lite navigation");
    if((await page.locator(".rc-how--lite .rc-how__step").count())!==3)throw Error("Lite how-it-works missing");
    if(!await page.locator(".lite-regional-header").count()||!await page.locator("footer.footer").count())throw Error("Lite shell");
    await noOverflow(page);
    if(label==="390")await page.screenshot({path:"test-results/design-uat/lite-390.png",fullPage:true});
   });
   if(label==="390"||label==="1440")await check("Read-only public routes "+label,page,async()=>{
    for(const path of ["/register","/login","/campos","/campos/mapa","/servicios-rurales"]){
     await open(page,path);
     await noOverflow(page);
    }
   });
   await context.close();
  }
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  await check("BR / US localization and 0% benefit",page,async()=>{
    for(const [code,text] of [["BR","CONECTE-SE DIRETO."],["US","CONNECT DIRECTLY."]]){
     await open(page,"/?pais="+code,"#rcf-hero-title");
     await page.getByText(text,{exact:true}).waitFor({state:"visible",timeout:10000});
     if((await page.locator(".rcf-hero__metric-value").count())!==2)throw Error("Benefits for "+code);
    }
  });
  await ctx.close();
 }finally{await browser.close()}
}catch(e){results.push({name:"Harness",status:"FAIL",detail:String(e)});console.error(e)}
finally{
 server?.kill("SIGTERM");
 writeFileSync("test-results/design-uat/report.json",JSON.stringify(results,null,2));
 const failed=results.filter(x=>x.status==="FAIL").length;
 console.log("UAT design: "+(results.length-failed)+" PASS, "+failed+" FAIL");
 if(failed)process.exitCode=1;
}
