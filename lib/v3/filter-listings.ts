import type { RuralListing } from "./types.ts";
type AppliedFilters = {
    location: string;
    operation: string;
    aptitude: string;
    service: string;
};
function normalizeArea(value: string) {
    return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
/** Specific filters apply only to their selected catalog, never to the combined view. */
export function filterRuralListings(listings: readonly RuralListing[], kind: string, filters: AppliedFilters): RuralListing[] {
    const query = normalizeArea(filters.location);
    return listings.filter((item) => {
        if (kind !== "todo" && item.kind !== kind)
            return false;
        if (query) {
            const area = normalizeArea([item.localidad, item.provincia, item.coverage].filter(Boolean).join(" "));
            if (!area.includes(query))
                return false;
        }
        if (kind === "campo") {
            if (filters.operation && item.operacion !== filters.operation && item.operacion !== "ambas")
                return false;
            if (filters.aptitude && item.aptitud !== filters.aptitude)
                return false;
        }
        if (kind === "servicio" && filters.service && !item.services.some((service) => service === filters.service))
            return false;
        return true;
    });
}
