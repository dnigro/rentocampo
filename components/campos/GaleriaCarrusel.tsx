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
  const [indiceModal, setIndiceModal] = useState<number | null>(null);

  const abierto = indiceModal !== null;

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

  const cerrar = useCallback(() => setIndiceModal(null), []);

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
        <div className="galeria-principal" onClick={() => setIndiceModal(0)}>
          <Image src={fotos[0].url} alt={titulo} fill sizes="(max-width: 768px) 100vw, 70vw" priority />
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
                onClick={() => setIndiceModal(i + 1)}
              >
                <Image src={f.url} alt={`${titulo}, foto ${i + 2}`} fill sizes="30vw" />
                {i === 1 && fotos.length > 3 && (
                  <div
                    className="galeria-mas"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndiceModal(3);
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
                  onClick={anterior}
                >
                  ‹
                </button>
              )}
              <div className="carrusel-imagen">
                <Image
                  key={indiceModal!}
                  src={fotos[indiceModal!].url}
                  alt={titulo}
                  fill
                  sizes="100vw"
                />
              </div>
              {fotos.length > 1 && (
                <button
                  className="carrusel-nav carrusel-next"
                  onClick={siguiente}
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
                    onClick={() => setIndiceModal(i)}
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
