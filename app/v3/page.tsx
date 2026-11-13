import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry, COUNTRIES, COUNTRY_CODES_ALPHABETICAL, displayCountryName } from "@/data/countries";
import V3CardPhotos from "./components/V3CardPhotos";
import { ArrowRight, MapPin, Search, Sprout, Tractor, Wheat, Beef, MapPinned, SlidersHorizontal, MessageCircle } from "lucide-react";
import "./home.css";

type Featured = { id: string; titulo: string; localidad: string | null; provincia: string | null; hectareas: number | null; precio: number | null; moneda: string | null; fotos: Array<{ url: string; orden: number | null }> };

export default async function HomeV3({ searchParams }: { searchParams?: Promise<{ pais?: string }> } = {}) {
  const params = await searchParams;
  const country = resolveCountry(params?.pais, (await cookies()).get("rentocampo_country")?.value);
  const t = (es: string, pt: string, en: string) => country === "BR" ? pt : country === "US" ? en : es;
  const locale = COUNTRIES[country].locale;
  const href = (path: string, query = "") => `${path}?pais=${country}${query ? `&${query}` : ""}`;
  let featured: Featured[] = [];
  let unavailable = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("campos")
      .select("id,titulo,localidad,provincia,hectareas,precio,moneda,fotos:campos_fotos(url,orden)")
      .eq("status", "activo").eq("country_code", country)
      .order("created_at", { ascending: false }).limit(12);
    unavailable = Boolean(error);
    featured = (data || []).filter(item => !item.id.startsWith("20000000-") && !/DEMO/i.test(item.titulo || "")).slice(0, 8);
  } catch { unavailable = true; }
  const categories = [
    { label: t("En alquiler", "Para arrendar", "For lease"), query: "operacion=alquiler", Icon: MapPin },
    { label: t("En venta", "À venda", "For sale"), query: "operacion=venta", Icon: Sprout },
    { label: t("Agrícolas", "Agrícolas", "Agricultural"), query: "aptitud=agricola", Icon: Wheat },
    { label: t("Ganaderos", "Pecuária", "Livestock"), query: "aptitud=ganadera", Icon: Beef },
    { label: t("Mixtos", "Mistos", "Mixed use"), query: "aptitud=mixta", Icon: SlidersHorizontal },
  ];
  return <div className="v3-home">
    <section className="v3-home-hero" aria-labelledby="v3-home-title">
      <Image className="v3-home-hero-photo" src="/rentocampo-hero-campo-bn-1920x1080.webp" alt="" fill priority sizes="100vw"/>
      <div className="v3-home-hero-shade"/>
      <div className="v3-home-hero-inner">
        <span className="v3-home-eyebrow">{t("TIERRA. PERSONAS. OPORTUNIDADES.", "TERRA. PESSOAS. OPORTUNIDADES.", "LAND. PEOPLE. OPPORTUNITIES.")}</span>
        <h1 id="v3-home-title">{t("Todo el campo.", "Todo o campo.", "All the countryside.")}<br/>{t("En un lugar.", "Em um só lugar.", "In one place.")}</h1>
        <p>{t("Encontrá campos y servicios rurales. Elegí tu zona y descubrí lo que está cerca de tu próxima oportunidad.", "Encontre terras e serviços rurais. Escolha sua região e descubra sua próxima oportunidade.", "Find farmland and rural services. Choose an area and discover your next opportunity.")}</p>
        <Form action="/v3/campos" className="v3-home-search" aria-label={t("Buscar campos", "Buscar terras", "Find farmland")}>
          <label><span>{t("País", "País", "Country")}</span><select name="pais" defaultValue={country}>{COUNTRY_CODES_ALPHABETICAL.map(code => <option key={code} value={code}>{COUNTRIES[code].flag} {displayCountryName(code, country)}</option>)}</select></label>
          <label><span>{t("¿Qué buscás?", "O que você procura?", "Looking for")}</span><select name="operacion" defaultValue=""><option value="">{t("Todos", "Todas", "All")}</option><option value="alquiler">{t("Alquiler", "Arrendamento", "Lease")}</option><option value="venta">{t("Venta", "Venda", "Sale")}</option></select></label>
          <label><span>{t("Ubicación", "Localização", "Location")}</span><input name="provincia" placeholder={t("Provincia o estado", "Estado", "State or province")}/></label>
          <label><span>{t("Aptitud", "Aptidão", "Land use")}</span><select name="aptitud" defaultValue=""><option value="">{t("Todas", "Todas", "All uses")}</option><option value="agricola">{t("Agrícola", "Agrícola", "Agricultural")}</option><option value="ganadera">{t("Ganadera", "Pecuária", "Livestock")}</option><option value="mixta">{t("Mixta", "Mista", "Mixed")}</option><option value="forestal">{t("Forestal", "Florestal", "Forestry")}</option></select></label>
          <button type="submit"><Search size={21}/><span>{t("Buscar", "Buscar", "Search")}</span></button>
        </Form>
        <div className="v3-home-hero-links"><Link href={href("/v3/campos")}><MapPinned size={17}/>{t("Explorar en el mapa", "Explorar no mapa", "Explore the map")}</Link><Link href={href("/v3/servicios")}><Tractor size={18}/>{t("Buscar servicios rurales", "Buscar serviços rurais", "Find rural services")}</Link></div>
      </div>
    </section>

    <nav className="v3-home-categories" aria-label={t("Explorar por tipo de campo", "Explorar por tipo de terra", "Explore by land type")}>
      <span>{t("Tu búsqueda empieza acá", "Sua busca começa aqui", "Start exploring")}</span>
      <div>{categories.map(({ label, query, Icon }) => <Link key={query} href={href("/v3/campos", query)}><Icon size={20}/>{label}</Link>)}</div>
    </nav>

    <section className="v3-home-featured" aria-labelledby="v3-featured-title">
      <div className="v3-section-heading"><div><span className="v3-kicker">{t("EXPLORÁ EL TERRITORIO", "EXPLORE O TERRITÓRIO", "EXPLORE THE AREA")}</span><h2 id="v3-featured-title">{t("Tu próximo campo puede estar acá.", "Sua próxima terra pode estar aqui.", "Your next property could be here.")}</h2><p>{t("Publicaciones en", "Anúncios em", "Listings in")} {displayCountryName(country, country)}</p></div><Link href={href("/v3/campos")}>{t("Ver todos", "Ver todos", "View all")} <ArrowRight size={18}/></Link></div>
      {featured.length ? <div className="v3-home-featured-grid">{featured.map(item => {
        const photos = [...(item.fotos || [])].filter(photo => photo.url).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).slice(0, 8).map(photo => photo.url);
        const detail = href(`/v3/campos/${item.id}`);
        return <article className="v3-listing-card" key={item.id}><div className="v3-listing-media"><V3CardPhotos photos={photos} title={item.titulo} href={detail}/></div><Link href={detail} className="v3-listing-info"><strong>{item.titulo}</strong><span>{[item.localidad, item.provincia].filter(Boolean).join(", ") || displayCountryName(country, country)}</span>{item.hectareas != null && <span>{Number(item.hectareas).toLocaleString(locale)} ha</span>}<b>{item.precio != null ? `${item.moneda || ""} ${Number(item.precio).toLocaleString(locale)}` : t("Precio a consultar", "Preço sob consulta", "Price on request")}</b></Link></article>;
      })}</div> : <div className="v3-home-empty"><MapPinned size={30}/><div><h3>{unavailable ? t("No pudimos cargar las publicaciones", "Não foi possível carregar os anúncios", "We couldn't load listings") : t("Explorá nuevas zonas", "Explore novas regiões", "Explore new areas")}</h3><p>{unavailable ? t("Podés volver a intentarlo desde el catálogo.", "Tente novamente no catálogo.", "Try again in the catalog.") : t("Probá otro país o descubrí los servicios rurales disponibles.", "Tente outro país ou descubra os serviços rurais disponíveis.", "Try another country or explore available rural services.")}</p></div><Link href={href("/v3/campos")}>{t("Abrir catálogo", "Abrir catálogo", "Open catalog")} <ArrowRight size={17}/></Link></div>}
    </section>

    <section className="v3-home-paths" aria-label={t("Más formas de explorar", "Mais formas de explorar", "More ways to explore")}>
      <Link href={href("/v3/campos")} className="v3-home-map-path"><MapPinned size={32}/><span>{t("EL LUGAR IMPORTA", "O LUGAR IMPORTA", "LOCATION MATTERS")}</span><h2>{t("Mirá el mapa. Encontrá tu lugar.", "Explore o mapa. Encontre seu lugar.", "Explore the map. Find your place.")}</h2><p>{t("Movete por la zona, compará fichas y encontrá campos donde querés estar.", "Explore a região, compare anúncios e encontre terras onde você quer estar.", "Move around the area, compare listings and find land where you want to be.")}</p><b>{t("Explorar campos", "Explorar terras", "Explore farmland")} <ArrowRight size={18}/></b></Link>
      <Link href={href("/v3/servicios")}><Tractor size={32}/><span>{t("EL TRABAJO CONTINÚA", "O TRABALHO CONTINUA", "KEEP THINGS MOVING")}</span><h2>{t("El servicio que tu campo necesita.", "O serviço que sua terra precisa.", "The service your land needs.")}</h2><p>{t("Encontrá prestadores rurales por especialidad y ubicación, en un mismo catálogo.", "Encontre prestadores rurais por especialidade e localização, em um só catálogo.", "Find rural providers by specialty and location in one catalog.")}</p><b>{t("Explorar servicios", "Explorar serviços", "Explore services")} <ArrowRight size={18}/></b></Link>
    </section>

    <section className="v3-home-how" id="como-funciona"><div><span className="v3-kicker">{t("EL CAMPO. SIN VUELTAS.", "O CAMPO. SEM COMPLICAÇÕES.", "THE COUNTRYSIDE. NO HASSLE.")}</span><h2>{t("De la búsqueda a tu próxima oportunidad.", "Da busca à sua próxima oportunidade.", "From search to your next opportunity.")}</h2></div><ol>{[
      { Icon: Search, title: t("Buscá tu zona", "Busque sua região", "Find your area"), text: t("Elegí el país, la ubicación y el tipo de campo o servicio.", "Escolha o país, a localização e o tipo de terra ou serviço.", "Choose a country, location and type of land or service.") },
      { Icon: SlidersHorizontal, title: t("Compará opciones", "Compare opções", "Compare options"), text: t("Recorré las fotos, los datos y la ubicación de cada publicación.", "Confira fotos, informações e localização de cada anúncio.", "Browse photos, details and locations for each listing.") },
      { Icon: MessageCircle, title: t("Conectá directo", "Conecte-se diretamente", "Connect directly"), text: t("Conocé la propuesta del anunciante, sin intermediarios ni comisiones.", "Conheça a proposta do anunciante, sem intermediários nem comissões.", "Discover the advertiser's offer, without intermediaries or commissions.") },
    ].map(({ Icon, title, text }, index) => <li key={title}><div><Icon size={22}/><span>0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
  </div>;
}
