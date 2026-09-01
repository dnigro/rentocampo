import Link from "next/link";
import type { Campo } from "@/types";
import FavoritoBtn from "@/components/campos/FavoritoBtn";

interface Props {
  campo: Campo & { fotos: { url: string; orden: number }[] };
  userId?: string;
}

const APTITUD_LABEL: Record<string, string> = {
  agricola: "Agrícola",
  ganadera: "Ganadera",
  mixta: "Mixta",
  forestal: "Forestal",
  otro: "Otro",
};

const DISPONIBILIDAD_LABEL: Record<string, string> = {
  inmediata: "Disponible ahora",
  campaña_próxima: "Campaña próxima",
  a_convenir: "A convenir",
};

export default function CampoCard({ campo, userId }: Props) {
  const foto = campo.fotos?.sort((a, b) => a.orden - b.orden)[0];

  return (
    <div className="campo-card-pub">
      {/* Imagen */}
      <Link href={`/campos/${campo.id}`} className="campo-card-pub-img-link">
        <div className="campo-card-pub-img">
          {foto ? (
            <img src={foto.url} alt={campo.titulo} />
          ) : (
            <div className="campo-card-pub-placeholder">🌿</div>
          )}
          <span
            className={`disp-badge disp-${campo.disponibilidad === "inmediata" ? "inmediata" : campo.disponibilidad === "campaña_próxima" ? "campana-proxima" : "a-convenir"}`}
          >
            {DISPONIBILIDAD_LABEL[campo.disponibilidad]}
          </span>
        </div>
      </Link>

      {/* Cuerpo */}
      <div className="campo-card-pub-body">
        <div className="campo-card-pub-top">
          <span className="aptitud-tag">
            {APTITUD_LABEL[campo.aptitud] ?? campo.aptitud}
          </span>
          {campo.mejoras && <span className="mejoras-tag">Con mejoras</span>}
        </div>

        <Link
          href={`/campos/${campo.id}`}
          className="campo-card-pub-titulo-link"
        >
          <h3 className="campo-card-pub-titulo">{campo.titulo}</h3>
        </Link>

        <p className="campo-card-pub-ubicacion">
          📍{" "}
          {[campo.localidad, campo.departamento, campo.provincia]
            .filter(Boolean)
            .join(", ")}
        </p>

        <div className="campo-card-pub-footer">
          <span className="campo-ha">
            {campo.hectareas.toLocaleString("es-AR")} ha
          </span>
          {campo.precio_ha ? (
            <span className="campo-precio">
              {campo.moneda} {campo.precio_ha.toLocaleString("es-AR")}
              <span className="precio-unit">/ha</span>
            </span>
          ) : (
            <span className="campo-precio-consultar">Precio a consultar</span>
          )}
        </div>

        {/* Botón favorito en el texto */}
        <FavoritoBtn campoId={campo.id} userId={userId} />
      </div>
    </div>
  );
}
