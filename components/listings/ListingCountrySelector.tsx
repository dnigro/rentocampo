"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { COUNTRIES, COUNTRY_CODES, resolveCountry, type CountryCode } from "@/data/countries";

export default function ListingCountrySelector({ country }: { country: CountryCode }) {
 const router=useRouter(); const pathname=usePathname(); const searchParams=useSearchParams();
 const selected=resolveCountry(searchParams.get("pais"),country);
 function change(next: CountryCode){
  window.localStorage.setItem("rentocampo_country",next);
  document.cookie=`rentocampo_country=${next}; path=/; max-age=31536000; SameSite=Lax`;
  const params=new URLSearchParams(searchParams.toString());
  params.set("pais",next);params.delete("provincia");params.delete("page");
  router.push(`${pathname}?${params.toString()}`);router.refresh();
 }
 return <div style={{display:"inline-flex",alignItems:"center",gap:12,flexWrap:"wrap",margin:"16px 0 24px"}}>
 <label htmlFor="listing-country" style={{fontWeight:800,fontSize:16}}>Explorar país</label>
 <select id="listing-country" aria-label="Seleccionar país de publicaciones" value={selected} onChange={e=>change(e.target.value as CountryCode)} style={{minWidth:210,minHeight:58,padding:"12px 18px",borderRadius:14,border:"1px solid #252525",background:"#171717",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer"}}>
 {COUNTRY_CODES.map(code=><option value={code} key={code}>{COUNTRIES[code].flag} {COUNTRIES[code].name}</option>)}
 </select></div>;
}
