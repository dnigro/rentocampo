import Link from "next/link";
import Image from "next/image";
import type { Campo } from "@/types";
import FavoritoBtn from "@/components/campos/FavoritoBtn";
import { regionalText } from "@/lib/i18n/regional";
import { resolveCountry } from "@/data/countries";

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

function getDisponibilidad(campo: Campo) {
  if (!campo.disponibilidad_desde) return "A convenir";
  const fecha = new Date(campo.disponibilidad_desde);
  return fecha <= new Date() ? "Disponible ahora" : "Campaña próxima";
}

export default function CampoCard({ campo, userId }: Props) {
  const country=resolveCountry(campo.country_code);
  const isDemo=campo.id.startsWith("20000000-") || /\bDEMO\b/i.test(campo.titulo ?? "");
  const tt=(es:string,pt:string)=>regionalText(country,es,pt);
  const foto = campo.fotos?.sort((a, b) => a.orden - b.orden)[0] ?? (campo.id.startsWith("20000000-") ? { url: "/rentocampo-hero-campo-bn-1920x1080.webp", orden: 0 } : undefined);
  const disponibilidad = tt(getDisponibilidad(campo),!campo.disponibilidad_desde?"A combinar":new Date(campo.disponibilidad_desde)<=new Date()?"Disponível agora":"Próxima safra");

  return (
    <div className="campo-card-pub">
      {/* Imagen */}
      <Link href={`/campos/${campo.id}`} className="campo-card-pub-img-link">
        <div className="campo-card-pub-img">
          {foto ? (
            <Image
              src={foto.url}
              alt={`${campo.titulo} en ${campo.localidad || campo.provincia}`}
              fill
              sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />
          ) : (
            <div className="campo-card-pub-placeholder">🌿</div>
          )}
          <span className="disp-badge disp-a-convenir">{disponibilidad}</span>
        </div>
      </Link>

      {/* Cuerpo */}
      <div className="campo-card-pub-body">
        <div className="campo-card-pub-top">
          {isDemo && <span className="aptitud-tag" title={tt("Publicación de ejemplo: no es una oferta real", "Anúncio de exemplo: não é uma oferta real")}>DEMO</span>}
          <span className="aptitud-tag">
            {country==="BR"?({agricola:"Agrícola",ganadera:"Pecuária",mixta:"Mista",forestal:"Florestal",otro:"Outro"} as Record<string,string>)[campo.aptitud]??campo.aptitud:APTITUD_LABEL[campo.aptitud] ?? campo.aptitud}
          </span>
          <span className="operacion-tag">
            {campo.operacion === "venta"
              ? tt("Venta", "Venda")
              : campo.operacion === "ambas"
                ? tt("Alquiler + Venta", "Arrendamento + Venda")
                : tt("Alquiler", "Arrendamento")}
          </span>
          {campo.mejoras === "Sí" && <span className="mejoras-tag">{tt("Con mejoras", "Com benfeitorias")}</span>}
        </div>

        <Link
          href={`/campos/${campo.id}`}
          className="campo-card-pub-titulo-link"
        >
          <h3 className="campo-card-pub-titulo">{campo.titulo}</h3>
        </Link>

        <p className="campo-card-pub-ubicacion">
          📍{" "}
          {[campo.localidad, campo.provincia]
            .filter(Boolean)
            .join(", ")}
        </p>

        <div className="campo-card-pub-footer">
          <span className="campo-ha">
            {Number(campo.hectareas).toLocaleString(country==="BR"?"pt-BR":"es-AR")} ha
          </span>
          {campo.precio ? (
            <span className="campo-precio">
              {campo.moneda} {Number(campo.precio).toLocaleString(country==="BR"?"pt-BR":"es-AR")}
              <span className="precio-unit"> {tt("total", "total")}</span>
            </span>
          ) : (
            <span className="campo-precio-consultar">{tt("Precio a consultar", "Preço sob consulta")}</span>
          )}
        </div>

        {/* Botón favorito en el texto */}
        {!isDemo && <FavoritoBtn campoId={campo.id} userId={userId} />}
      </div>
    </div>
  );
}
