import type { ServicioRural } from "@/types";
/** Serializable, public-only data shared by the server loader and explorer UI. */
export type RuralListing = {
    id: string;
    sourceId: string;
    demo?: boolean;
    kind: "campo" | "servicio";
    titulo: string;
    localidad: string | null;
    provincia: string | null;
    hectareas: number | null;
    aptitud: string | null;
    operacion: string | null;
    precio: number | null;
    moneda: string | null;
    foto: string | null;
    fotos: string[];
    lat: number | null;
    lng: number | null;
    services: ServicioRural[];
    coverage: string | null;
};
export type HomeFilters = {
    pais?: string;
    tipo?: string;
    vista?: string;
    ayuda?: string;
    provincia?: string;
    operacion?: string;
    aptitud?: string;
    servicio?: string;
    north?: string;
    south?: string;
    east?: string;
    west?: string;
};
