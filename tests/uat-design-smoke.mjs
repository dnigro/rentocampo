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
async function footerMetrics(page) {
 return await page.locator("footer.footer").evaluate(footer => {
  const container=footer.querySelector(".footer-inner");
  const services=footer.querySelector(".footer-col--services");
  const contact=footer.querySelector(".footer-col--contact");
  const link=footer.querySelector(".footer-link");
  if(!container||!services||!contact||!link)throw Error("Footer incomplete");
  const position=el=>el.getBoundingClientRect();
  return {
   cols:getComputedStyle(container).gridTemplateColumns.split(" ").length,
   servicesY:position(services).y,
   contactY:position(contact).y,
   linkFont:parseFloat(getComputedStyle(link).fontSize),
   footerOverflow:footer.scrollWidth>footer.clientWidth+3
  };
 });
}
async function checkPatagoniaColors(page,where) {
 const colors=await page.locator("footer.footer").evaluate(footer=>{
  const link=footer.querySelector(".footer-link");
  const brand=footer.querySelector(".brand-clean-name");
  if(!link||!brand)throw Error("Footer brand/link missing");
  const rgb=str=>(str.match(/[\\d.]+/g)||[]).slice(0,3).map(Number);
  const luminance=triplet=>{
    const linear=triplet.map(v=>{const n=v/255;return n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4});
    return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
  };
  const contrast=(a,b)=>{const aa=luminance(rgb(a)),bb=luminance(rgb(b));return (Math.max(aa,bb)+.05)/(Math.min(aa,bb)+.05)};
  const bg=getComputedStyle(footer).backgroundColor;
  const text=getComputedStyle(link).color;
  const brandText=getComputedStyle(brand).color;
  return {bg,text,brandText,linkContrast:contrast(text,bg),brandContrast:contrast(brandText,bg)};
 });
 if(colors.linkContrast<7||colors.brandContrast<7)
   throw Error(where+" footer illegible: "+JSON.stringify(colors));
}
async function checkMobileFooter(page,expected,where) {
 if(expected.cols!==2||Math.abs(expected.servicesY-expected.contactY)>4
   ||expected.linkFont>15||expected.footerOverflow)
  throw Error(where+" footer differs from home 2x2 layout: "+JSON.stringify(expected));
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
    await page.getByText("CAMPOS Y SERVICIOS",{exact:true}).waitFor({state:"visible"});
    if((await page.locator(".rcf-hero__metric-value").count())!==2)throw Error("Missing 0% or 100% metric");
    if(width>=901){
      const heroGeometry=await page.locator(".rcf-hero").evaluate(hero=>{
        const title=hero.querySelector(".rcf-hero__title");
        const matte=hero.querySelector(".rcf-hero__matte");
        const proof=hero.querySelector(".rcf-hero__proof");
        if(!title||!matte||!proof)throw Error("Incomplete hero geometry");
        const outer=hero.getBoundingClientRect(),copy=title.getBoundingClientRect(),band=proof.getBoundingClientRect();
        return {
          height:outer.height,
          textRight:copy.right-outer.left,
          centerDiagonal:outer.width*.57,
          usableArea:outer.width*.55,
          copyRatio:copy.width/(outer.width*.55),
          overflowTitle:title.scrollWidth>title.clientWidth+3,
          proofVisible:band.top>=outer.top&&band.bottom<=outer.bottom+2,
          matteClip:getComputedStyle(matte).clipPath,
        };
      });
      if(heroGeometry.height>513||heroGeometry.height<438)throw Error("Hero not compact: "+JSON.stringify(heroGeometry));
      if(heroGeometry.textRight>heroGeometry.centerDiagonal+8)throw Error("Headline overlaps cattle diagonal: "+JSON.stringify(heroGeometry));
      if(Math.abs(heroGeometry.copyRatio-.8)>.025)throw Error("Copy does not fill 80% of safe area: "+JSON.stringify(heroGeometry));
      if(heroGeometry.overflowTitle)throw Error("Headline text overflows: "+JSON.stringify(heroGeometry));
      if(!heroGeometry.proofVisible)throw Error("0/100 benefit cropped: "+JSON.stringify(heroGeometry));
    }

    if((await page.locator(".rcf-actions a").count())!==2)throw Error("Wrong CTA count");
    if((await page.locator(".rc-how--web .rc-how__step").count())!==3)throw Error("How it works count");
    if(width<=680){
      const fit=await page.locator(".rc-how--web .rc-how__steps").evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,columns:getComputedStyle(el).gridTemplateColumns.split(" ").length}));
      if(fit.scroll>fit.width+3||fit.columns!==1)throw Error("Steps must fit mobile width: "+JSON.stringify(fit));
    }
    if((await page.locator(".rcf-faq__item").count())!==5)throw Error("FAQ count");
    await page.locator(".rcf-faq__item summary").first().click();
    if(!(await page.locator(".rcf-faq__item").first().evaluate(e=>e.open)))throw Error("FAQ does not open");
    if(!await page.locator(".navbar").count()||!await page.locator("footer.footer").count())throw Error("Header/footer absent");
    if(width<=600)await checkMobileFooter(page,await footerMetrics(page),"Home");
    await checkPatagoniaColors(page,"Home");
    if(!await page.locator('a[href="/#como-funciona"]').count())throw Error("Menu anchor missing");
    const desktopHowLink = page.locator('.navbar-links a[href="/#como-funciona"]');
    if (await desktopHowLink.isVisible()) {
      await desktopHowLink.click();
    } else {
      await page.locator('button.hamburguesa').click();
      await page.locator('.mobile-menu-nav a[href="/#como-funciona"]').click();
    }
    await page.waitForFunction(()=>location.hash==="#como-funciona",null,{timeout:7000});
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
    if(width<=680){
      const fit=await page.locator(".rc-how--lite .rc-how__steps").evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
      if(fit.scroll>fit.width+3)throw Error("Lite cards overflow: "+JSON.stringify(fit));
    }
    await page.locator(".lite-regional-account").click();
    const howLite=page.locator('a[href="/lite#como-funciona-lite"]');
    if(!await howLite.isVisible())throw Error("Lite how-it-works menu item missing");
    await howLite.click();
    await page.waitForFunction(()=>location.hash==="#como-funciona-lite",null,{timeout:7000});
    if(!await page.locator(".lite-regional-header").count()||!await page.locator("footer.footer").count())throw Error("Lite shell");
    if(width<=600)await checkMobileFooter(page,await footerMetrics(page),"Lite");
    await checkPatagoniaColors(page,"Lite");
    await noOverflow(page);
    if(label==="390")await page.screenshot({path:"test-results/design-uat/lite-390.png",fullPage:true});
   });
   if(label==="390"||label==="1440")await check("Read-only public routes "+label,page,async()=>{
    for(const path of ["/register","/login","/campos","/campos/mapa","/servicios-rurales"]){
     await open(page,path);
     await noOverflow(page);
     if(width<=600)await checkMobileFooter(page,await footerMetrics(page),"Internal "+path);
     await checkPatagoniaColors(page,"Internal "+path);
     if(path==="/campos/mapa") {
       const metrics=await page.evaluate(()=>{
         const map=document.querySelector(".mapa-page"),footer=document.querySelector("footer.footer");
         const links=[...document.querySelectorAll(".mapa-page .mapa-lista-link")];
         if(!map||!footer||links.length!==2)throw Error("Map or footer missing");
         return {gap:footer.getBoundingClientRect().top-map.getBoundingClientRect().bottom,
           bodyOverflow:getComputedStyle(document.body).overflowY,
           links:links.map(el=>({label:el.textContent?.trim(),r:getComputedStyle(el).borderRadius,minHeight:el.getBoundingClientRect().height}))};
       });
       if(metrics.gap<-2)throw Error("Map covered by footer: "+JSON.stringify(metrics));
       if(metrics.bodyOverflow==="hidden")throw Error("Map scroll is still blocked");
       if(metrics.links.some(link=>!link.r.startsWith("999")||link.minHeight<40||link.label?.includes("←")))
         throw Error("Map list actions are not pill buttons: "+JSON.stringify(metrics));
     }
    }
   });
   await context.close();
  }
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  await check("BR / US localization and 0% benefit",page,async()=>{
    for(const [code,text] of [["BR","TERRAS E SERVIÇOS"],["US","LAND & SERVICES"]]){
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
