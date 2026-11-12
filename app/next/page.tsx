import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, SlidersHorizontal, ArrowUpRight, Tractor, Sprout, House, Heart, Menu } from "lucide-react";
import "./next.css";

export const metadata = { title: "RentoCampo Next | El campo, sin vueltas", description: "Encontrá campos y servicios rurales. Conectá directamente." };

const categorias = [
  { label: "Todos", icon: House, href: "/next" },
  { label: "Campos", icon: Sprout, href: "/next/campos?pais=AR" },
  { label: "Alquiler", icon: MapPin, href: "/next/campos?pais=AR&operacion=alquiler" },
  { label: "Venta", icon: House, href: "/next/campos?pais=AR&operacion=venta" },
  { label: "Servicios rurales", icon: Tractor, href: "/next/servicios?pais=AR" },
];
const destinos = [
 { title:"Campos para alquilar", subtitle:"Encontrá tu próximo lugar para producir", image:"/rentocampo-hero-campo-bn-1920x1080.webp", href:"/next/campos?pais=AR&operacion=alquiler" },
 { title:"Campos en venta", subtitle:"Oportunidades rurales para descubrir", image:"/rentocampo-hero-campo-bn-1920x1080.webp", href:"/next/campos?pais=AR&operacion=venta" },
 { title:"Servicios para el campo", subtitle:"Personas y equipos que hacen la diferencia", image:"/demo-servicio-veterinaria.jpg", href:"/next/servicios?pais=AR" },
];
export default function NextHome(){
 return <div className="next-site">
  <header className="next-header"><Link className="next-logo" href="/next" aria-label="RentoCampo Next inicio"><span className="next-logo-mark">R</span><span>RentoCampo</span></Link>
   <nav className="next-nav" aria-label="Principal"><Link href="/next/campos?pais=AR">Explorar campos</Link><Link href="/next/servicios?pais=AR">Servicios</Link></nav>
   <div className="next-actions"><Link className="next-publish" href="/login">Publicá gratis</Link><Link className="next-account" href="/next/cuenta" aria-label="Ingresar a mi cuenta"><Menu size={19}/><span className="next-avatar">●</span></Link></div>
  </header>
  <main>
   <section className="next-intro"><p className="next-eyebrow">CONECTAMOS EL CAMPO</p><h1>El campo, sin vueltas.</h1><p>Encontrá tierras, productores y servicios rurales. Todo en un lugar.</p></section>
   <form className="next-search" action="/next/campos" method="get"><input type="hidden" name="pais" value="AR"/><label><span>¿Qué buscás?</span><select name="operacion" defaultValue=""><option value="">Todos los campos</option><option value="alquiler">Alquiler</option><option value="venta">Venta</option></select></label><label><span>¿Dónde?</span><input name="provincia" placeholder="Cualquier provincia"/></label><label className="next-search-last"><span>Superficie mínima</span><input name="hectareas_min" type="number" min="0" placeholder="Hectáreas"/></label><button type="submit" aria-label="Buscar campos"><Search size={22}/><span>Buscar</span></button></form>
   <section className="next-categories" aria-label="Categorías">{categorias.map(({label,icon:Icon,href})=><Link href={href} key={label} className={label==="Todos"?"selected":""}><Icon size={22} strokeWidth={1.7}/><span>{label}</span></Link>)}</section>
   <section className="next-discover"><div className="next-section-head"><div><p className="next-eyebrow">EXPLORÁ A TU MANERA</p><h2>Un mundo de oportunidades rurales</h2></div><Link href="/next/campos?pais=AR">Ver todos <ArrowUpRight size={17}/></Link></div><div className="next-cards">{destinos.map((item,i)=><Link className="next-card" href={item.href} key={item.title}><div className="next-card-image"><Image src={item.image} alt={item.title} fill sizes="(max-width: 680px) 100vw, (max-width: 1050px) 50vw, 33vw" priority={i===0}/><span className="next-card-heart"><Heart size={19}/></span></div><div className="next-card-copy"><h3>{item.title}</h3><p>{item.subtitle}</p></div></Link>)}</div></section>
   <section className="next-banner"><div><p className="next-eyebrow">SIN INTERMEDIARIOS</p><h2>Tu próximo contacto empieza acá.</h2><p>Publicá gratis. Mostrá lo que ofrecés y conectá directamente con quienes lo necesitan.</p></div><Link href="/login">Empezar a publicar <ArrowUpRight size={18}/></Link></section>
  </main>
  <footer className="next-footer"><strong>RentoCampo</strong><span>El campo. Sin vueltas.</span><div><Link href="/next/campos?pais=AR">Campos</Link><Link href="/next/servicios?pais=AR">Servicios</Link><Link href="/login">Ingresar</Link></div></footer>
 </div>;
}
