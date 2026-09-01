import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ConsultaButton from "@/components/campos/ConsultaButton";
import GaleriaCarrusel from "@/components/campos/GaleriaCarrusel";
import "@/styles/carrusel.css";
import "@/styles/campos.css";
import "@/styles/ficha.css";
import "@/styles/favoritos.css";
import VolverButton from "@/components/campos/VolverButton";
import "@/styles/favoritos.css";
import FavoritoBtn from "@/components/campos/FavoritoBtn";

export default async function CampoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campo } = await supabase
    .from("campos")
    .select(
      "*, propietario:profiles(id, nombre, provincia, verificado, avatar_url)",
    )
    .eq("id", id)
    .eq("estado", "activo")
    .single();

  if (!campo) notFound();

  const { data: fotos } = await supabase
    .from("campos_fotos")
    .select("url, orden")
    .eq("campo_id", id)
    .order("orden");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fotosOrdenadas = fotos?.sort((a, b) => a.orden - b.orden) ?? [];

  const APTITUD_LABEL: Record<string, string> = {
    agricola: "Agrícola",
    ganadera: "Ganadera",
    mixta: "Mixta",
    forestal: "Forestal",
    otro: "Otro",
  };

  const DISP_LABEL: Record<string, string> = {
    inmediata: "Disponible ahora",
    campaña_próxima: "Campaña próxima",
    a_convenir: "A convenir",
  };

  return (
    <div className="ficha-container">
      <VolverButton />
      {/* Galería de fotos */}
      <GaleriaCarrusel fotos={fotosOrdenadas} titulo={campo.titulo} />

      <div className="ficha-body">
        {/* Columna principal */}
        <div className="ficha-main">
          <div className="ficha-tags">
            <span className="aptitud-tag">
              {APTITUD_LABEL[campo.aptitud] ?? campo.aptitud}
            </span>
            {campo.mejoras && <span className="mejoras-tag">Con mejoras</span>}
            <span
              className={`disp-badge disp-${campo.disponibilidad.replace("_", "-").replace("ó", "o")}`}
            >
              {DISP_LABEL[campo.disponibilidad]}
            </span>
          </div>

          <h1 className="ficha-titulo">{campo.titulo}</h1>

          <p className="ficha-ubicacion">
            📍{" "}
            {[campo.localidad, campo.departamento, campo.provincia]
              .filter(Boolean)
              .join(", ")}
          </p>

          {/* Datos clave */}
          <div className="ficha-datos">
            <div className="dato-item">
              <span className="dato-valor">
                {campo.hectareas.toLocaleString("es-AR")}
              </span>
              <span className="dato-label">Hectáreas</span>
            </div>
            <div className="dato-sep" />
            <div className="dato-item">
              <span className="dato-valor">{APTITUD_LABEL[campo.aptitud]}</span>
              <span className="dato-label">Aptitud</span>
            </div>
            {campo.rendimiento_est && (
              <>
                <div className="dato-sep" />
                <div className="dato-item">
                  <span className="dato-valor">
                    {campo.rendimiento_est} qq/ha
                  </span>
                  <span className="dato-label">Rend. estimado</span>
                </div>
              </>
            )}
            <div className="dato-sep" />
            <div className="dato-item">
              <span className="dato-valor">{campo.mejoras ? "Sí" : "No"}</span>
              <span className="dato-label">Mejoras</span>
            </div>
          </div>

          {/* Descripción */}
          {campo.descripcion && (
            <div className="ficha-seccion">
              <h2 className="ficha-seccion-titulo">Descripción</h2>
              <p className="ficha-descripcion">{campo.descripcion}</p>
            </div>
          )}

          {/* Ambiente */}
          {campo.ambiente && (
            <div className="ficha-seccion">
              <h2 className="ficha-seccion-titulo">Ambiente y suelo</h2>
              <p className="ficha-descripcion">{campo.ambiente}</p>
            </div>
          )}
        </div>

        {/* Sidebar de contacto */}
        <aside className="ficha-sidebar">
          <div className="ficha-precio-card">
            {campo.precio_ha ? (
              <div className="ficha-precio">
                <span className="precio-valor">
                  {campo.moneda} {campo.precio_ha.toLocaleString("es-AR")}
                </span>
                <span className="precio-unit">por hectárea</span>
                <span className="precio-total">
                  Total aprox: {campo.moneda}{" "}
                  {(campo.precio_ha * campo.hectareas).toLocaleString("es-AR")}
                </span>
              </div>
            ) : (
              <p className="precio-consultar">Precio a consultar</p>
            )}

            <ConsultaButton
              campoId={campo.id}
              propietarioId={campo.propietario?.id}
              userId={user?.id}
            />
            <FavoritoBtn campoId={campo.id} userId={user?.id} />
          </div>

          {/* Info propietario */}
          {campo.propietario && (
            <div className="ficha-propietario">
              <div className="propietario-avatar">
                {campo.propietario.avatar_url ? (
                  <img
                    src={campo.propietario.avatar_url}
                    alt={campo.propietario.nombre}
                  />
                ) : (
                  <span>{campo.propietario.nombre?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="propietario-info">
                <span className="propietario-nombre">
                  {campo.propietario.nombre}
                </span>
                <span className="propietario-provincia">
                  {campo.propietario.provincia}
                </span>
                {campo.propietario.verificado && (
                  <span className="propietario-verificado">✓ Verificado</span>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
