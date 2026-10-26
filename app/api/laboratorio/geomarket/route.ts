import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const revalidate = 86400;
const centers: Record<string,{name:string;lat:number;lon:number}> = {
 AR:{name:"Zona pampeana",lat:-34.6,lon:-60.2},
 UY:{name:"Litoral agrícola",lat:-33.2,lon:-57.7},
 PY:{name:"Región Oriental",lat:-25.6,lon:-56.2},
 US:{name:"Midwest",lat:40.4,lon:-93.4}
};
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=86400"}});
const avg=(xs:number[])=>xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length*10)/10:null;
async function nasa(lat:number,lon:number,start:string,end:string){
 const u=new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
 for(const [k,v] of Object.entries({parameters:"PRECTOTCORR,T2M",community:"AG",longitude:String(lon),latitude:String(lat),start,end,format:"JSON"}))u.searchParams.set(k,v);
 const res=await fetch(u,{next:{revalidate:86400},signal:AbortSignal.timeout(16000)});
 if(!res.ok)throw new Error("NASA POWER "+res.status);
 const data=await res.json();
 const params=data?.properties?.parameter;
 if(!params?.PRECTOTCORR)throw new Error("NASA POWER sin datos");
 const rain=Object.values(params.PRECTOTCORR).filter((x):x is number=>typeof x==="number"&&Number.isFinite(x)&&x>=0&&x<900);
 const temp=Object.values(params.T2M??{}).filter((x):x is number=>typeof x==="number"&&Number.isFinite(x)&&x>-90&&x<90);
 return {lat,lon,rainfallMm:Math.round(rain.reduce((a,b)=>a+b,0)*10)/10,meanTempC:avg(temp),days:rain.length};
}
export async function GET(req:NextRequest){
 const country=req.nextUrl.searchParams.get("country")??"AR";
 const center=centers[country];if(!center)return json({error:"País no admitido"},400);
 const end=new Date(Date.now()-4*86400000),start=new Date(end.getTime()-13*86400000);
 const fmt=(d:Date)=>d.toISOString().slice(0,10).replaceAll("-","");
 const positions=[[0,0],[0.55,-0.65],[-0.55,0.65]].map(([a,b])=>({lat:Math.round((center.lat+a)*100)/100,lon:Math.round((center.lon+b)*100)/100}));
 const results=await Promise.allSettled(positions.map(p=>nasa(p.lat,p.lon,fmt(start),fmt(end))));
 const points=results.flatMap(x=>x.status==="fulfilled"?[x.value]:[]);
 if(!points.length)return json({error:"NASA POWER no disponible; no se muestran datos simulados",source:"NASA POWER"},503);
 let alerts:{event:string;severity:string;headline:string}[]=[];
 if(country==="US")try{
 const r=await fetch("https://api.weather.gov/alerts/active?point="+center.lat+","+center.lon,{headers:{"User-Agent":"RentoCampo GeoMarket (hola@rentocampo.com)","Accept":"application/geo+json"},next:{revalidate:1800},signal:AbortSignal.timeout(8000)});
 if(r.ok){const d=await r.json();alerts=(d.features??[]).slice(0,8).map((f:{properties?:{event?:string;severity?:string;headline?:string}})=>({event:f.properties?.event??"Aviso",severity:f.properties?.severity??"Unknown",headline:f.properties?.headline??""}));}
 }catch{}
 return json({country,region:center.name,center:[center.lat,center.lon],period:{start:fmt(start),end:fmt(end)},source:"NASA POWER Daily API",metric:"Precipitación acumulada histórica (mm), últimos 14 días disponibles",points,partial:points.length<positions.length,alerts,alertsSource:country==="US"?"NOAA NWS":"No disponible",updatedAt:new Date().toISOString()});
}
