import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry, COUNTRIES } from "@/data/countries";
import { ArrowRight, MapPin, Search, Sprout, Tractor, Trees, Wheat, Beef, Users, ShieldCheck, MessageCircle, MapPinned } from "lucide-react";
const categories=[{name:"Campos en venta",href:"/v3/campos?operacion=venta",Icon:Trees},{name:"Campos en alquiler",href:"/v3/campos?operacion=alquiler",Icon:MapPin},{name:"Agrícola",href:"/v3/campos?aptitud=agricola",Icon:Wheat},{name:"Ganadero",href:"/v3/campos?aptitud=ganadera",Icon:Beef},{name:"Mixto",href:"/v3/campos?aptitud=mixta",Icon:Sprout},{name:"Servicios rurales",href:"/v3/servicios",Icon:Tractor},{name:"Productores",href:"/v3/mi-rentocampo",Icon:Users}];
export default async function HomeV3() {
 const country=resolveCountry(undefined,(await cookies()).get("rentocampo_country")?.value);
 let featured: Array<{id:string;titulo:string;localidad:string|null;provincia:string|null;hectareas:number|null;precio:number|null;moneda:string|null;fotos:Array<{url:string;orden:number|null}>}>=[];
 try {
   const supabase=await createClient();
   const { data }=await supabase.from("campos")
      .select("id,titulo,localidad,provincia,hectareas,precio,moneda,fotos:campos_fotos(url,orden)")
      .eq("status","activo").eq("country_code",country)
      .order("created_at",{ascending:false}).limit(12);
   featured=(data||[]).filter(item=>!item.id.startsWith("20000000-")&&!String(item.titulo||"").toUpperCase().includes("DEMO")).slice(0,8);
 } catch { /* Home remains navigable if preview data access is unavailable. */ }
 return <>
 <section className="v3-hero"><div className="v3-hero-bg"/><div className="v3-hero-content"><span className="v3-eyebrow">UNA NUEVA FORMA DE CONECTAR EL CAMPO</span><h1>El campo.<br/>Sin vueltas.</h1><p>Campos, productores y servicios rurales.<br/>Todo en un solo lugar.</p>
 <form action="/v3/campos" className="v3-search"><label><span>¿Qué buscás?</span><select name="operacion" defaultValue=""><option value="">Todos los campos</option><option value="alquiler">Campos en alquiler</option><option value="venta">Campos en venta</option></select></label><label><span>Ubicación</span><input name="provincia" placeholder="Provincia (opcional)" /></label><label><span>Aptitud</span><select name="aptitud" defaultValue=""><option value="">Todas</option><option value="agricola">Agrícola</option><option value="ganadera">Ganadera</option><option value="mixta">Mixta</option></select></label><button type="submit" aria-label="Buscar campos"><Search size={24}/><span>Buscar</span></button></form>
 </div></section>
 <section className="v3-category-section"><div className="v3-section-heading"><div><span className="v3-kicker">EXPLORÁ A TU MANERA</span><h2>Todo el campo, en un lugar.</h2></div><Link href="/v3/campos">Explorar campos <ArrowRight size={17}/></Link></div><div className="v3-categories">{categories.map(({name,href,Icon})=><Link href={href} key={name} className="v3-category"><Icon size={28} strokeWidth={1.7}/><span>{name}</span></Link>)}</div></section>
 <section className="v3-home-featured">
   <div className="v3-section-heading"><div><span className="v3-kicker">OPORTUNIDADES REALES</span><h2>Descubrí campos en ${COUNTRIES[country].name}</h2></div><Link href={`/v3/campos?pais=${country}`}>Ver todos <ArrowRight size={17}/></Link></div>
   {featured.length ? <div className="v3-home-featured-grid">{featured.map(item=>{
     const foto=[...(item.fotos||[])].sort((a,b)=>(a.orden??0)-(b.orden??0))[0]?.url;
     return <Link href={`/v3/campos/${item.id}`} className="v3-home-card" key={item.id}>
       <div className="v3-home-card-image">{foto?<Image src={foto} alt={item.titulo} fill sizes="(max-width:700px) 80vw, 25vw"/>:<span>Foto no disponible</span>}</div>
       <strong>{item.titulo}</strong><span>{[item.localidad,item.provincia].filter(Boolean).join(", ")}</span>
       <span>{item.hectareas != null?`${Number(item.hectareas).toLocaleString("es-AR")} ha`:"Campo rural"}</span>
       <b>{item.precio!=null?`${item.moneda||""} ${Number(item.precio).toLocaleString("es-AR")}`:"Precio a consultar"}</b>
     </Link>;
   })}</div>:<div className="v3-home-featured-empty">Explorá los campos publicados en el mapa, con filtros y contacto directo.<Link href={`/v3/campos?pais=${country}`}>Explorar campos <ArrowRight size={16}/></Link></div>}
 </section>
 <section className="v3-feature"><div className="v3-feature-copy"><span className="v3-kicker">EXPLORADOR RURAL</span><h2>Encontrá tu próxima oportunidad en el mapa.</h2><p>Compará ubicaciones, explorá publicaciones y contactá directamente a propietarios y prestadores.</p><Link href="/v3/campos" className="v3-primary-link">Explorar campos <ArrowRight size={18}/></Link></div><div className="v3-feature-image"><Image src="/rentocampo-hero-campo-bn-1920x1080.webp" alt="Paisaje rural de RentoCampo" fill sizes="(max-width: 800px) 100vw, 50vw"/></div></section>
 <section className="v3-benefits" id="como-funciona"><div><ShieldCheck/><h3>Sin intermediarios</h3><p>Conexión directa entre quienes ofrecen y quienes buscan.</p></div><div><MessageCircle/><h3>Contacto directo</h3><p>Conversaciones y oportunidades sin vueltas.</p></div><div><MapPinned/><h3>Todo en un mapa</h3><p>Explorá la oferta rural por ubicación.</p></div></section>
 <section className="v3-bottom-cta"><h2>Tu próxima oportunidad empieza acá.</h2><p>Publicá o explorá el campo en una sola plataforma.</p><Link href="/v3/campos">Empezar a explorar <ArrowRight size={18}/></Link></section>
 </>}
