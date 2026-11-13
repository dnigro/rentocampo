import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { parseMapBounds } from "@/lib/campos/map-search";
import { loadHomeListings } from "@/lib/v3/load-home-listings";
import type { HomeFilters } from "@/lib/v3/types";
import V3UnifiedExplorer from "./components/V3UnifiedExplorer";
import V3HomeHero from "./components/V3HomeHero";
import V3HomeActions from "./components/V3HomeActions";
import "leaflet/dist/leaflet.css";
import "./home.css";
export default async function HomeV3({ searchParams, }: {
    searchParams?: Promise<HomeFilters>;
} = {}) {
    const params = (await searchParams) || {};
    const country = resolveCountry(params.pais, (await cookies()).get("rentocampo_country")?.value);
    const { listings, errors, capped } = await loadHomeListings(country);
    return (<div className="v3-home rural-white-home">
      <V3HomeHero country={country}/>
      <V3UnifiedExplorer key={JSON.stringify(params)} listings={listings} country={country} filter={params} errors={errors} capped={capped} initialBounds={parseMapBounds(params)}/>
      <V3HomeActions country={country} help={params.ayuda}/>
    </div>);
}
