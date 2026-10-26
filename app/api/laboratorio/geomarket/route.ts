import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const revalidate = 86400;
const centers: Record<string,{name:string;lat:number;lon:number}> = {
 AR:{name:"Zona pampeana",lat:-34.6,lon:-60.2},
 UY:{name:"Litoral agrícola",lat:-33.2,lon:-57.7},
 PY:{name:"Región Oriental",lat:-25.6,lon:-56.2},
 US:{name:"Midwest",lat:40.4,lon:-93.4}
};
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"public, s-maxage=1800, stale-while-revalidate=3600"}});
const avg=(xs:number[])=>xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length*10)/10:null;
async function nasa(lat:number,lon:number,start:string,end:string){
 const u=new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
 for(const [k,v] of Object.entries({parameters:"PRECTOTCORR,T2M,RH2M,WS10M",community:"AG",longitude:String(lon),latitude:String(lat),start,end,format:"JSON"}))u.searchParams.set(k,v);
 const res=await fetch(u,{next:{revalidate:86400},signal:AbortSignal.timeout(16000)});
 if(!res.ok)throw new Error("NASA POWER "+res.status);
 const data=await res.json();
 const params=data?.properties?.parameter;
 if(!params?.PRECTOTCORR)throw new Error("NASA POWER sin datos");
 const entries=Object.entries(params.PRECTOTCORR) as [string,number][];
 const rain=entries.filter(([,x])=>typeof x==="number"&&Number.isFinite(x)&&x>=0&&x<900).map(([,x])=>x);
 const dailyRain=entries.filter(([,x])=>typeof x==="number"&&Number.isFinite(x)&&x>=0&&x<900).map(([date,mm])=>({date,mm}));
 if(rain.length<10)throw new Error("Incomplete precipitation series");
 const temp=Object.values(params.T2M??{}).filter((x):x is number=>typeof x==="number"&&Number.isFinite(x)&&x>-90&&x<90);
 const valid=(key:string,min:number,max:number)=>Object.values(params[key]??{}).filter((x):x is number=>typeof x==="number"&&Number.isFinite(x)&&x>=min&&x<=max);
 return {lat,lon,rainfallMm:Math.round(rain.reduce((a,b)=>a+b,0)*10)/10,meanTempC:avg(temp),meanHumidityPct:avg(valid("RH2M",0,100)),meanWindMs:avg(valid("WS10M",0,90)),days:rain.length,dailyRain};
}
export async function GET(req:NextRequest){
 const country=req.nextUrl.searchParams.get("country")??"AR";
 const center=centers[country];if(!center)return json({error:"País no admitido"},400);
 const end=new Date(Date.now()-4*86400000),start=new Date(end.getTime()-13*86400000);
 const fmt=(d:Date)=>d.toISOString().slice(0,10).replaceAll("-","");
 const offsets=[-1,0,1];
 const positions=offsets.flatMap(a=>offsets.map(b=>({lat:Math.round((center.lat+a*0.5)*100)/100,lon:Math.round((center.lon+b*0.625)*1000)/1000})));
 const results:PromiseSettledResult<Awaited<ReturnType<typeof nasa>>>[]=[];
 for(let i=0;i<positions.length;i+=3){const batch=await Promise.allSettled(positions.slice(i,i+3).map(p=>nasa(p.lat,p.lon,fmt(start),fmt(end))));results.push(...batch);}
 const points=results.flatMap(x=>x.status==="fulfilled"?[x.value]:[]);
 if(!points.length)return json({error:"NASA POWER no disponible; no se muestran datos simulados",source:"NASA POWER"},503);
 let alerts:{event:string;severity:string;headline:string}[]=[];
 let alertsAvailable=false;
 if(country==="US")try{
 const r=await fetch("https://api.weather.gov/alerts/active?point="+center.lat+","+center.lon,{headers:{"User-Agent":"RentoCampo GeoMarket (hola@rentocampo.com)","Accept":"application/geo+json"},next:{revalidate:1800},signal:AbortSignal.timeout(8000)});
 if(r.ok){alertsAvailable=true;const d=await r.json();alerts=(d.features??[]).slice(0,8).map((f:{properties?:{event?:string;severity?:string;headline?:string}})=>({event:f.properties?.event??"Aviso",severity:f.properties?.severity??"Unknown",headline:f.properties?.headline??""}));}
 }catch{}
 const central=points.reduce((best,p)=>Math.abs(p.lat-center.lat)+Math.abs(p.lon-center.lon)<Math.abs(best.lat-center.lat)+Math.abs(best.lon-center.lon)?p:best,points[0]);
 const rainValues=points.map(p=>p.rainfallMm);
 const summary={sampleCount:points.length,minimumMm:Math.min(...rainValues),maximumMm:Math.max(...rainValues),meanMm:Math.round(rainValues.reduce((a,b)=>a+b,0)/rainValues.length*10)/10,centralDailyRain:central.dailyRain,centralHumidityPct:central.meanHumidityPct,centralWindMs:central.meanWindMs,centralTempC:central.meanTempC};
 const quality={expectedCells:positions.length,validCells:points.length,coveragePct:Math.round(points.length/positions.length*100),centralRainDays:central.days,alertsAvailable:country==="US"?alertsAvailable:null};
 return json({quality,summary,country,region:center.name,center:[center.lat,center.lon],period:{start:fmt(start),end:fmt(end)},source:"NASA POWER Daily API",metric:"Precipitación acumulada histórica (mm), últimos 14 días disponibles",points,partial:points.length<positions.length,grid:{latStep:0.5,lonStep:0.625,expected:positions.length},alerts,alertsSource:country==="US"?"NOAA NWS":"No disponible",updatedAt:new Date().toISOString()});
}
