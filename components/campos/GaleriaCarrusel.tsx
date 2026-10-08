"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Foto {
  url: string;
  orden: number;
}

interface Props {
  fotos: Foto[];
  titulo: string;
}

export default function GaleriaCarrusel({ fotos, titulo }: Props) {
  const [indicePrincipal, setIndicePrincipal] = useState(0);
  const [indiceModal, setIndiceModal] = useState<number | null>(null);
  const [touchInicioX, setTouchInicioX] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pinchInicio, setPinchInicio] = useState<number | null>(null);
  const [zoomInicio, setZoomInicio] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panInicio, setPanInicio] = useState<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  const abierto = indiceModal !== null;

  const anteriorPrincipal = useCallback(() => {
    setIndicePrincipal((i) => (i === 0 ? fotos.length - 1 : i - 1));
  }, [fotos.length]);

  const siguientePrincipal = useCallback(() => {
    setIndicePrincipal((i) => (i === fotos.length - 1 ? 0 : i + 1));
  }, [fotos.length]);

  const anterior = useCallback(() => {
    setIndiceModal((i) =>
      i === null ? null : i === 0 ? fotos.length - 1 : i - 1,
    );
  }, [fotos.length]);

  const siguiente = useCallback(() => {
    setIndiceModal((i) =>
      i === null ? null : i === fotos.length - 1 ? 0 : i + 1,
    );
  }, [fotos.length]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPinchInicio(null);
    setZoomInicio(1);
    setOffset({ x: 0, y: 0 });
    setPanInicio(null);
  }, []);

  const cerrar = useCallback(() => {
    setIndiceModal(null);
    resetZoom();
  }, [resetZoom]);

  const distanciaTouches = (touches: { length: number; [index: number]: { clientX: number; clientY: number } }) => {
    if (touches.length < 2) return 0;
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  const abrirFoto = (indice: number) => {
    resetZoom();
    setIndiceModal(indice);
  };

  const actualizarZoom = (nuevoZoom: number) => {
    setZoom(nuevoZoom);
    if (nuevoZoom <= 1) {
      setOffset({ x: 0, y: 0 });
      setPanInicio(null);
    }
  };

  // Teclado
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [abierto, anterior, siguiente, cerrar]);

  // Scroll lock
  useEffect(() => {
    if (abierto) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [abierto]);

  if (!fotos.length) {
    return <div className="galeria-empty">🌿 Sin fotos disponibles</div>;
  }

  return (
    <>
      {/* Galería estática */}
      <div className="ficha-galeria">
        <div
          className="galeria-principal"
          onClick={() => abrirFoto(indicePrincipal)}
          onTouchStart={(e) => setTouchInicioX(e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchInicioX === null || fotos.length < 2) return;
            const finX = e.changedTouches[0]?.clientX ?? touchInicioX;
            const delta = finX - touchInicioX;
            if (Math.abs(delta) > 40) {
              if (delta < 0) siguientePrincipal();
              else anteriorPrincipal();
            }
            setTouchInicioX(null);
          }}
        >
          <Image
            key={fotos[indicePrincipal].url}
            src={fotos[indicePrincipal].url}
            alt={`${titulo}, foto ${indicePrincipal + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            priority={indicePrincipal === 0}
          />
          {fotos.length > 1 && (
            <>
              <button
                type="button"
                className="galeria-nav galeria-nav-prev"
                aria-label="Foto anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  anteriorPrincipal();
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="galeria-nav galeria-nav-next"
                aria-label="Foto siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  siguientePrincipal();
                }}
              >
                ›
              </button>
              <span className="galeria-contador">
                {indicePrincipal + 1} / {fotos.length}
              </span>
            </>
          )}
          <div className="galeria-overlay">
            <span className="galeria-ver-todas">🔍 Ver fotos</span>
          </div>
        </div>
        {fotos.length > 1 && (
          <div className="galeria-thumbs">
            {fotos.slice(1, 3).map((f, i) => (
              <div
                key={i}
                className="galeria-thumb"
                onClick={() => abrirFoto(i + 1)}
              >
                <Image src={f.url} alt={`${titulo}, foto ${i + 2}`} fill sizes="30vw" />
                {i === 1 && fotos.length > 3 && (
                  <div
                    className="galeria-mas"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirFoto(3);
                    }}
                  >
                    +{fotos.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {abierto && (
        <div className="carrusel-modal" onClick={cerrar}>
          <div
            className="carrusel-modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="carrusel-header">
              <span className="carrusel-contador">
                {indiceModal! + 1} / {fotos.length}
              </span>
              <button className="carrusel-cerrar" onClick={cerrar}>
                ✕
              </button>
            </div>

            {/* Imagen */}
            <div className="carrusel-imagen-wrap">
              {fotos.length > 1 && (
                <button
                  className="carrusel-nav carrusel-prev"
                  onClick={() => { resetZoom(); anterior(); }}
                >
                  ‹
                </button>
              )}
              <div
                className={`carrusel-imagen ${zoom > 1 ? "zoom-activo" : ""}`}
                onDoubleClick={() => actualizarZoom(zoom > 1 ? 1 : 2)}
                onMouseDown={(e) => {
                  if (zoom <= 1 || e.button !== 0) return;
                  e.preventDefault();
                  setPanInicio({ x: e.clientX, y: e.clientY, offsetX: offset.x, offsetY: offset.y });
                }}
                onMouseMove={(e) => {
                  if (zoom <= 1 || !panInicio || (e.buttons & 1) === 0) return;
                  e.preventDefault();
                  setOffset({
                    x: panInicio.offsetX + e.clientX - panInicio.x,
                    y: panInicio.offsetY + e.clientY - panInicio.y,
                  });
                }}
                onMouseUp={() => setPanInicio(null)}
                onMouseLeave={() => setPanInicio(null)}
                onTouchStart={(e) => {
                  if (e.touches.length === 2) {
                    const distancia = distanciaTouches(e.touches);
                    setPinchInicio(distancia);
                    setZoomInicio(zoom);
                    setPanInicio(null);
                  } else if (e.touches.length === 1 && zoom > 1) {
                    const t = e.touches[0];
                    setPanInicio({
                      x: t.clientX,
                      y: t.clientY,
                      offsetX: offset.x,
                      offsetY: offset.y,
                    });
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 2 && pinchInicio) {
                    e.preventDefault();
                    const distancia = distanciaTouches(e.touches);
                    const nuevoZoom = Math.min(4, Math.max(1, zoomInicio * (distancia / pinchInicio)));
                    actualizarZoom(nuevoZoom);
                  } else if (e.touches.length === 1 && zoom > 1 && panInicio) {
                    e.preventDefault();
                    const t = e.touches[0];
                    setOffset({
                      x: panInicio.offsetX + (t.clientX - panInicio.x),
                      y: panInicio.offsetY + (t.clientY - panInicio.y),
                    });
                  }
                }}
                onTouchEnd={(e) => {
                  if (e.touches.length < 2) setPinchInicio(null);
                  if (e.touches.length === 0) setPanInicio(null);
                }}
              >
                <div className="carrusel-imagen-zoom" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
                  <Image
                    key={indiceModal!}
                    src={fotos[indiceModal!].url}
                    alt={titulo}
                    fill
                    sizes="100vw"
                    priority
                    draggable={false}
                  />
                </div>
                <div className="carrusel-zoom-controles" aria-label="Controles de zoom" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    aria-label="Alejar"
                    onClick={() => actualizarZoom(Math.max(1, +(zoom - 0.5).toFixed(1)))}
                    disabled={zoom <= 1}
                  >
                    −
                  </button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    aria-label="Acercar"
                    onClick={() => setZoom((z) => Math.min(4, +(z + 0.5).toFixed(1)))}
                    disabled={zoom >= 4}
                  >
                    +
                  </button>
                </div>
              </div>
              {fotos.length > 1 && (
                <button
                  className="carrusel-nav carrusel-next"
                  onClick={() => { resetZoom(); siguiente(); }}
                >
                  ›
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div className="carrusel-thumbs">
                {fotos.map((f, i) => (
                  <button
                    key={i}
                    className={`carrusel-thumb ${i === indiceModal ? "activo" : ""}`}
                    onClick={() => { resetZoom(); setIndiceModal(i); }}
                  >
                    <Image src={f.url} alt={`${titulo}, foto ${i + 1}`} fill sizes="96px" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
