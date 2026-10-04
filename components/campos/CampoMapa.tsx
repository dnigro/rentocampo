"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import Link from "next/link";
import Image from "next/image";
import { DEMANDA_ZONAS, type DemandaZona } from "@/data/demanda-zonas";
import {
  CENTROS_PROVINCIA,
  SERVICIO_LABEL,
} from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import { COUNTRIES, type CountryCode } from "@/data/countries";
import { createClient } from "@/lib/supabase/client";

interface CampoPin {
  id: string;
  titulo: string;
  country_code?: CountryCode;
  provincia: string;
  localidad?: string;
  latitud: number;
  longitud: number;
  hectareas: number;
  aptitud: string;
  precio?: number;
  moneda?: string;
}

interface Props {
  campos: CampoPin[];
  prestadores: ServicioPin[];
  currentUserId?: string;
  initialVista?: "tierra" | "servicios";
  initialServicio?: ServicioRural;
  initialCountry?: CountryCode;
}

interface ServicioPin {
  id: string;
  nombre: string;
  country_code?: CountryCode;
  bio?: string;
  avatar_url?: string;
  service_photo_url?: string;
  servicios_rurales: ServicioRural[];
  zona_servicio?: string;
  provincia_servicio: string;
  localidad_servicio?: string;
  latitud?: number;
  longitud?: number;
  is_demo?: boolean;
}

export default function CampoMapa({
  campos,
  prestadores,
  currentUserId,
  initialVista = "tierra",
  initialCountry = "AR",
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const camposLayer = useRef<LayerGroup | null>(null);
  const demandaLayer = useRef<LayerGroup | null>(null);
  const serviciosLayer = useRef<LayerGroup | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CampoPin | null>(null);
  const [selectedDemanda, setSelectedDemanda] = useState<DemandaZona | null>(
    null,
  );
  const [selectedServicio, setSelectedServicio] = useState<ServicioPin | null>(
    null,
  );
  const [vista, setVista] = useState<"tierra" | "servicios">(initialVista);
  const [countryCode, setCountryCode] = useState<CountryCode>(initialCountry);
  const [mostrarCampos, setMostrarCampos] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [supabase] = useState(createClient);
  const [fetchedUserId, setFetchedUserId] = useState<
    string | null | undefined
  >();
  const resolvedUserId = currentUserId ?? fetchedUserId;

  useEffect(() => {
    if (currentUserId !== undefined) return;

    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setFetchedUserId(data.user?.id ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, supabase]);

  function cambiarVista(nuevaVista: "tierra" | "servicios") {
    setVista(nuevaVista);
    setSelectedCampo(null);
    setSelectedDemanda(null);
    setSelectedServicio(null);
  }

  const prestadoresFiltrados = useMemo(
    () =>
      prestadores.filter(
        (prestador) =>
          (prestador.country_code ?? "AR") === countryCode,
      ),
    [countryCode, prestadores],
  );

  const camposConCoordenadas = useMemo(
    () =>
      campos.filter(
        (campo) =>
          (campo.country_code ?? "AR") === countryCode &&
          Number.isFinite(campo.latitud) &&
          Number.isFinite(campo.longitud) &&
          campo.latitud >= -90 &&
          campo.latitud <= 90 &&
          campo.longitud >= -180 &&
          campo.longitud <= 180,
      ),
    [campos, countryCode],
  );

  useEffect(() => {
    let cancelled = false;

    void import("leaflet")
      .then((L) => {
        if (cancelled || map.current || !mapContainer.current) return;

        const country = COUNTRIES[countryCode];
        const leafletMap = L.map(mapContainer.current).setView(
          country.mapCenter,
          country.mapZoom,
        );
        map.current = leafletMap;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(leafletMap);
        L.control.zoom({ position: "topright" }).addTo(leafletMap);

        const camposGroup = L.layerGroup().addTo(leafletMap);
        const demandaGroup = L.layerGroup().addTo(leafletMap);
        const serviciosGroup = L.layerGroup();
        camposLayer.current = camposGroup;
        demandaLayer.current = demandaGroup;
        serviciosLayer.current = serviciosGroup;

        const coordinates: [number, number][] = [];

        camposConCoordenadas.forEach((campo) => {
          const position: [number, number] = [campo.latitud, campo.longitud];
          const esDemo = campo.id.startsWith("20000000-");
          coordinates.push(position);
          L.circleMarker(position, {
            radius: 9,
            color: "#ffffff",
            weight: 2,
            fillColor: "#2d6a2d",
            fillOpacity: 1,
          })
            .addTo(camposGroup)
            .bindTooltip(esDemo ? "Campo de demostración" : "Campo disponible")
            .on("click", () => {
              setSelectedDemanda(null);
              setSelectedCampo(campo);
            });
        });

        if (false) DEMANDA_ZONAS.forEach((demanda) => {
          const position: [number, number] = [
            demanda.latitud,
            demanda.longitud,
          ];
          coordinates.push(position);
          L.circleMarker(position, {
            radius: 11,
            color: "#1a3a1a",
            weight: 2,
            dashArray: "4 3",
            fillColor: "#f4c542",
            fillOpacity: 0.82,
          })
            .addTo(demandaGroup)
            .bindTooltip(`Demanda en ${demanda.zona}`)
            .on("click", () => {
              setSelectedCampo(null);
              setSelectedDemanda(demanda);
            });
        });

        prestadoresFiltrados.forEach((prestador, index) => {
          const tieneCoordenadas =
            Number.isFinite(prestador.latitud) && Number.isFinite(prestador.longitud);
          const centro = CENTROS_PROVINCIA[prestador.provincia_servicio];
          if (!tieneCoordenadas && !centro) return;
          const offset = ((index % 5) - 2) * 0.16;
          const position: [number, number] = tieneCoordenadas
            ? [prestador.latitud as number, prestador.longitud as number]
            : [centro![0] + offset, centro![1] - offset];
          if (vista === "servicios") coordinates.push(position);
          L.circleMarker(position, {
            radius: 10,
            color: "#7a3158",
            weight: 2,
            fillColor: "#e58ac0",
            fillOpacity: 1,
          })
            .addTo(serviciosGroup)
            .bindTooltip(
              `${prestador.nombre} · Servicios rurales${prestador.is_demo ? " · DEMO" : ""}`,
            )
            .on("click", () => {
              setSelectedCampo(null);
              setSelectedDemanda(null);
              setSelectedServicio(prestador);
            });
        });

        if (vista === "servicios") {
          leafletMap.removeLayer(camposGroup);
          leafletMap.removeLayer(demandaGroup);
          serviciosGroup.addTo(leafletMap);
        }

        if (coordinates.length > 0) {
          leafletMap.fitBounds(L.latLngBounds(coordinates), {
            padding: [48, 48],
            maxZoom: 7,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setMapError(true);
      });

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      camposLayer.current = null;
      demandaLayer.current = null;
      serviciosLayer.current = null;
    };
  }, [camposConCoordenadas, countryCode, prestadoresFiltrados, vista]);

  useEffect(() => {
    const leafletMap = map.current;
    if (!leafletMap) return;
    const tierraVisible = vista === "tierra";
    [camposLayer.current, demandaLayer.current].forEach((layer) => {
      if (!layer) return;
      if (tierraVisible && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
      if (!tierraVisible && leafletMap.hasLayer(layer))
        leafletMap.removeLayer(layer);
    });
    const serviceLayer = serviciosLayer.current;
    if (serviceLayer) {
      if (!tierraVisible && !leafletMap.hasLayer(serviceLayer))
        serviceLayer.addTo(leafletMap);
      if (tierraVisible && leafletMap.hasLayer(serviceLayer))
        leafletMap.removeLayer(serviceLayer);
    }
  }, [vista, prestadoresFiltrados]);

  useEffect(() => {
    const leafletMap = map.current;
    const layer = camposLayer.current;
    if (!leafletMap || !layer) return;

    if (mostrarCampos && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
    if (!mostrarCampos && leafletMap.hasLayer(layer))
      leafletMap.removeLayer(layer);
  }, [mostrarCampos]);

  const APTITUD_LABEL: Record<string, string> = {
    agricola: "Agrícola",
    ganadera: "Ganadera",
    mixta: "Mixta",
    forestal: "Forestal",
    otro: "Otro",
  };

  return (
    <div className="mapa-wrapper">
      <div
        ref={mapContainer}
        className={`mapa-canvas ${mapError ? "mapa-canvas-oculto" : ""}`}
      />

      {mapError && (
        <div className="mapa-fallback">
          <iframe
            className="mapa-fallback-frame"
            title={`Mapa cartográfico de ${COUNTRIES[countryCode].name}`}
            src={
              countryCode === "UY"
                ? "https://www.openstreetmap.org/export/embed.html?bbox=-58.7%2C-35.2%2C-53.0%2C-30.0&layer=mapnik"
                : "https://www.openstreetmap.org/export/embed.html?bbox=-73.8%2C-55.3%2C-53.4%2C-21.4&layer=mapnik"
            }
            loading="lazy"
          />
          <div className="mapa-fallback-aviso">
            <strong>Mapa de oportunidades rurales</strong>
            <span>No se pudo cargar el mapa interactivo.</span>
            <Link href="/campos">Ver campos disponibles →</Link>
          </div>
        </div>
      )}

      {!mapError && (
        <div className="mapa-filtros" aria-label="Capas visibles del mapa">
          <div className="mapa-paises" role="group" aria-label="País del mapa">
            <button
              type="button"
              className={countryCode === "AR" ? "activo" : ""}
              onClick={() => {
                setCountryCode("AR");
                setSelectedCampo(null);
                setSelectedDemanda(null);
                setSelectedServicio(null);
              }}
            >
              🇦🇷 Argentina
            </button>
          </div>

          <div
            className="mapa-modos"
            role="group"
            aria-label="Qué querés encontrar"
          >
            <button
              type="button"
              className={vista === "tierra" ? "activo" : ""}
              onClick={() => cambiarVista("tierra")}
            >
              Tierra productiva
            </button>
            <button
              type="button"
              className={
                vista === "servicios" ? "activo activo-servicios" : ""
              }
              onClick={() => cambiarVista("servicios")}
            >
              Servicios rurales
            </button>
          </div>
          {vista === "tierra" ? (
            <>
              <p className="mapa-filtros-titulo">Mostrar en el mapa</p>
              <button
                type="button"
                className={`mapa-filtro ${mostrarCampos ? "activo" : ""}`}
                aria-pressed={mostrarCampos}
                onClick={() => {
                  setMostrarCampos((actual) => !actual);
                  setSelectedCampo(null);
                }}
              >
                <span className="mapa-filtro-punto mapa-filtro-punto-campo" />
                Campos disponibles
              </button>
            </>
          ) : (
            <div
              className="mapa-filtro mapa-filtro-fijo mapa-filtro-servicios"
              aria-label="Servicios ofrecidos siempre visibles"
            >
              <span className="mapa-filtro-punto mapa-filtro-punto-servicio" />
              Servicios ofrecidos
            </div>
          )}

          <div className="mapa-contador">
            {vista === "tierra" ? (
              <>
                <strong>{camposConCoordenadas.length}</strong> campos en{" "}
                {COUNTRIES[countryCode].name}
              </>
            ) : (
              <>
                <strong>{prestadoresFiltrados.length}</strong> servicios en mapa
              </>
            )}
          </div>

          <div
            className="mapa-publicar-acciones"
            aria-label="Publicar en RentoCampo"
          >
            {vista === "tierra" ? (
              <Link
                href="/register?tipo=propietario"
                className="mapa-publicar-btn mapa-publicar-btn-principal"
              >
                Publicar un campo →
              </Link>
            ) : (
              <Link
                href={resolvedUserId ? "/mis-servicios-rurales/nuevo" : "/register?tipo=prestador"}
                className="mapa-publicar-btn mapa-publicar-btn-principal mapa-publicar-btn-principal-servicio"
              >
                Publicar mis servicios →
              </Link>
            )}
          </div>
        </div>
      )}

      {selectedCampo && (
        <div className="mapa-panel">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedCampo(null)}
            aria-label="Cerrar detalle del campo"
          >
            ×
          </button>
          <p className="mapa-panel-aptitud">
            {selectedCampo.id.startsWith("20000000-") ? "PUBLICACIÓN DEMO · " : ""}
            {APTITUD_LABEL[selectedCampo.aptitud] ?? selectedCampo.aptitud}
          </p>
          <h3 className="mapa-panel-titulo">{selectedCampo.titulo}</h3>
          <p className="mapa-panel-ubicacion">
            {[selectedCampo.localidad, selectedCampo.provincia]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mapa-panel-datos">
            <span>{selectedCampo.hectareas.toLocaleString(COUNTRIES[selectedCampo.country_code ?? "AR"].locale)} ha</span>
            {selectedCampo.precio && (
              <span>
                {selectedCampo.moneda}{" "}
                {selectedCampo.precio.toLocaleString(COUNTRIES[selectedCampo.country_code ?? "AR"].locale)} total
              </span>
            )}
          </div>
          <Link href={`/campos/${selectedCampo.id}`} className="mapa-panel-btn">
            Ver campo →
          </Link>
        </div>
      )}

      {selectedDemanda && (
        <div className="mapa-panel mapa-panel-demanda">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedDemanda(null)}
            aria-label="Cerrar detalle de la demanda"
          >
            ×
          </button>
          <p className="mapa-panel-aptitud mapa-panel-aptitud-demanda">
            Demanda por zona
          </p>
          <h3 className="mapa-panel-titulo">
            Productores buscan campos en {selectedDemanda.zona}
          </h3>
          <p className="mapa-panel-ubicacion">{selectedDemanda.provincia}</p>
          <p className="mapa-panel-descripcion">
            {selectedDemanda.descripcion}
          </p>
          <p className="mapa-panel-aclaracion">
            Marcador institucional de RentoCampo. No representa un campo
            publicado.
          </p>
          <Link
            href={`/register?tipo=propietario&zona=${encodeURIComponent(selectedDemanda.zona)}`}
            className="mapa-panel-btn mapa-panel-btn-demanda"
          >
            Publicar campo en esta zona
          </Link>
        </div>
      )}

      {selectedServicio && (
        <div className="mapa-panel mapa-panel-servicio">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedServicio(null)}
            aria-label="Cerrar detalle del servicio"
          >
            ×
          </button>
          {selectedServicio.service_photo_url && (
            <div className="mapa-servicio-foto">
              <Image
                src={selectedServicio.service_photo_url}
                alt={`${selectedServicio.nombre} · servicio rural`}
                width={640}
                height={360}
              />
            </div>
          )}
          <p className="mapa-panel-aptitud mapa-panel-aptitud-servicio">
            {selectedServicio.is_demo ? "SERVICIO DEMO" : "Servicios rurales"}
          </p>
          <h3 className="mapa-panel-titulo">{selectedServicio.nombre}</h3>
          <p className="mapa-panel-ubicacion">
            {[
              selectedServicio.localidad_servicio,
              selectedServicio.provincia_servicio,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mapa-servicio-tags">
            {selectedServicio.servicios_rurales.map((servicio) => (
              <span key={servicio}>{SERVICIO_LABEL[servicio] ?? servicio}</span>
            ))}
          </div>
          {selectedServicio.zona_servicio && (
            <p className="mapa-panel-descripcion">
              <strong>Zona de cobertura:</strong>{" "}
              {selectedServicio.zona_servicio}
            </p>
          )}
          {selectedServicio.bio && (
            <p className="mapa-panel-descripcion">{selectedServicio.bio}</p>
          )}
          {resolvedUserId === undefined ? (
            <div
              className="mapa-panel-btn mapa-panel-btn-propio"
              aria-disabled="true"
            >
              Verificando sesión…
            </div>
          ) : !resolvedUserId ? (
            <Link
              href="/login?next=/campos/mapa?vista=servicios"
              className="mapa-panel-btn mapa-panel-btn-servicio"
            >
              Ingresá para consultar →
            </Link>
          ) : !selectedServicio.is_demo && selectedServicio.id === resolvedUserId ? (
            <div
              className="mapa-panel-btn mapa-panel-btn-propio"
              aria-disabled="true"
            >
              Este servicio es tuyo
            </div>
          ) : selectedServicio.is_demo ? (
            <div
              className="mapa-panel-btn mapa-panel-btn-propio"
              aria-disabled="true"
            >
              Servicio demo
            </div>
          ) : (
            <Link
              href={`/mensajes/direct/${selectedServicio.id}`}
              className="mapa-panel-btn"
            >
              Consultar servicio →
            </Link>
          )}
        </div>
      )}

    </div>
  );
}
