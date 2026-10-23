"use client";

import Image from "next/image";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, getCountrySubdivisions, resolveCountry, type CountryCode } from "@/data/countries";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileText, Images, MapPinned } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SERVICIOS_RURALES, servicioLabel } from "@/data/servicios-rurales";
import { regionalText } from "@/lib/i18n/regional";
import { type Profile, type RolPerfil, type ServicioRural } from "@/types";
import GeocoderInput, { type LugarSeleccionado } from "@/components/campos/GeocoderInput";

interface ServicioInicial {
  id: string;
  country_code?: CountryCode;
  servicios_rurales: ServicioRural[];
  foto_url: string;
  provincia: string;
  localidad?: string | null;
  zona?: string | null;
  detalle?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

interface Props {
  profile: Partial<Profile> | null;
  publicacion?: ServicioInicial | null;
  initialCountry?: CountryCode;
  initialZona?: string;
}

export default function ServicioRuralForm({ profile, publicacion, initialCountry, initialZona }: Props) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [servicios, setServicios] = useState<ServicioRural[]>(
    publicacion?.servicios_rurales ?? profile?.servicios_rurales ?? [],
  );
  const [country, setCountry] = useState<CountryCode>(resolveCountry(publicacion?.country_code ?? initialCountry, profile?.country_code));
  const subdivisions = getCountrySubdivisions(country);
  const tt=(es:string,pt:string)=>regionalText(country,es,pt);
  const [zona, setZona] = useState(publicacion?.zona ?? initialZona ?? profile?.zona_servicio ?? "");
  const [provincia, setProvincia] = useState(publicacion?.provincia ?? profile?.provincia_servicio ?? "");
  const [localidad, setLocalidad] = useState(publicacion?.localidad ?? profile?.localidad_servicio ?? "");
  const [ubicacion, setUbicacion] = useState([publicacion?.localidad, publicacion?.provincia].filter(Boolean).join(", "));
  const [latitud, setLatitud] = useState<number | undefined>(publicacion?.latitud ?? undefined);
  const [longitud, setLongitud] = useState<number | undefined>(publicacion?.longitud ?? undefined);
  const [detalle, setDetalle] = useState(publicacion?.detalle ?? "");
  const [photoPreview, setPhotoPreview] = useState(publicacion?.foto_url ?? profile?.service_photo_url ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleServicio(servicio: ServicioRural) {
    setServicios((actuales) =>
      actuales.includes(servicio)
        ? actuales.filter((item) => item !== servicio)
        : [...actuales, servicio],
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview((previous) => { if (previous.startsWith("blob:")) URL.revokeObjectURL(previous); return URL.createObjectURL(file); });
    e.target.value = "";
  }

  function removePhoto() {
    setPhotoPreview((previous) => {
      if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
      return "";
    });
    setPhotoFile(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!servicios.length) {
      setError(tt("Elegí al menos un servicio rural.","Selecione pelo menos um serviço rural."));
      return;
    }

    if (!photoPreview && !photoFile) {
      setError(tt("Subí una foto clara y real del servicio que ofrecés.","Envie uma foto real e nítida do serviço que oferece."));
      return;
    }

    if (!provincia || !ubicacion || typeof latitud !== "number" || typeof longitud !== "number") {
      setError(tt("Seleccioná la zona de servicio usando el buscador del mapa.","Selecione a área de atendimento usando o buscador do mapa."));
      return;
    }

    setSaving(true);

    try {
      let resolvedPhotoUrl = photoPreview;

      if (photoFile) {
        const body = new FormData();
        body.set("file", photoFile);
        const response = await fetch("/api/profile/service-photo", {
          method: "POST",
          body,
        });
        const result = await response.json();
        if (!response.ok || !result.url) {
          throw new Error(result.error ?? tt("No se pudo subir la foto del servicio","Não foi possível enviar a foto do serviço"));
        }

        // Persistimos la URL pública devuelta por Storage, no el blob: local
        // usado solamente para el preview del navegador.
        resolvedPhotoUrl = result.url;
        setPhotoPreview(result.url);
        setPhotoFile(null);
      }

      if (!resolvedPhotoUrl) throw new Error(tt("La foto del servicio es obligatoria.","A foto do serviço é obrigatória."));

      const payload = {
        propietario_id: profile?.id,
        country_code: country,
        servicios_rurales: servicios,
        foto_url: resolvedPhotoUrl,
        zona: zona || null,
        provincia,
        localidad: localidad || null,
        latitud,
        longitud,
        detalle: detalle || null,
      };
      const { error: saveError } = publicacion
        ? await supabase.from("servicios_publicaciones").update(payload).eq("id", publicacion.id).eq("propietario_id", profile?.id)
        : await supabase.from("servicios_publicaciones").insert(payload);
      if (saveError) throw saveError;

      const roles = (profile?.roles ?? ["productor"]) as RolPerfil[];
      const rolesActualizados = roles.includes("prestador")
        ? roles
        : [...roles, "prestador"];

      const roleResponse = await fetch("/api/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: rolesActualizados }),
      });
      const roleResult = await roleResponse.json();
      if (!roleResponse.ok) {
        throw new Error(roleResult.error ?? tt("No se pudo activar el perfil de servicios","Não foi possível ativar o perfil de serviços"));
      }

      router.push("/mis-servicios-rurales");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : tt("No se pudo guardar el servicio.","Não foi possível salvar o serviço."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="campo-form servicio-publicacion-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">01</span><span className="form-section-icon" aria-hidden="true"><FileText size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>{tt("Información","Informações")}</span> <em>{tt("del servicio","do serviço")}</em></span></h2>
      <div className="form-field">
        <label className="form-label">
          {tt("¿Qué servicios ofrecés?","Quais serviços você oferece?")} <span className="required">*</span>
        </label>
        <p className="form-hint">
          {tt("Elegí uno o varios rubros. Estos son los que verán los usuarios en tu publicación.","Escolha uma ou mais categorias. Elas aparecerão no seu anúncio.")}
        </p>
        <div className="servicios-options">
          {SERVICIOS_RURALES.map((servicio) => (
            <label className="servicio-option" key={servicio.value}>
              <input
                type="checkbox"
                checked={servicios.includes(servicio.value)}
                onChange={() => toggleServicio(servicio.value)}
              />
              <span>{servicioLabel(servicio.value,country)}</span>
            </label>
          ))}
        </div>
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">02</span><span className="form-section-icon" aria-hidden="true"><Images size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>{tt("Foto","Foto")}</span> <em>{tt("del servicio","do serviço")}</em></span></h2>
      <div className="form-field">
        <label className="form-label">{tt("Foto de tu servicio","Foto do seu serviço")} <span className="required">*</span></label>
        <p className="form-hint">{tt("Subí una foto clara y real de tu trabajo. Una buena imagen ayuda a que los productores entiendan rápidamente qué servicio ofrecés.","Envie uma foto nítida e real do seu trabalho. Uma boa imagem ajuda os produtores a entender seu serviço.")}</p>
        <div className="servicio-foto-editor">
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt={tt("Foto de tu servicio rural","Foto do seu serviço rural")}
              width={900}
              height={580}
              className="servicio-foto-preview"
            />
          ) : (
            <div className="servicio-foto-placeholder">
              📷 {tt("Subí una foto real que represente tu trabajo","Envie uma foto real que represente seu trabalho")}
            </div>
          )}
          <button
            type="button"
            className="btn-secondary-lg"
            onClick={() => photoInputRef.current?.click()}
          >
            {photoPreview ? tt("Cambiar foto","Trocar foto") : tt("Subir foto","Enviar foto")}
          </button>
          {photoPreview && (
            <button type="button" className="btn-secondary-lg" onClick={removePhoto}>
              {tt("Eliminar foto","Excluir foto")}
            </button>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">03</span><span className="form-section-icon" aria-hidden="true"><MapPinned size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>{tt("Zona","Área")}</span> <em>{tt("de cobertura","de atendimento")}</em></span></h2>
      <div className="form-field">
        <label className="form-label" htmlFor="servicio-pais">{tt("País","País")}</label>
        <select id="servicio-pais" className="form-input" value={country} onChange={(e) => {
          setCountry(e.target.value as CountryCode);
          setProvincia(""); setLocalidad(""); setUbicacion(""); setZona("");
          setLatitud(undefined); setLongitud(undefined);
        }}>
          {COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">{tt("Buscar zona de servicio en el mapa","Buscar área de atendimento no mapa")} <span className="required">*</span></label>
        <GeocoderInput
          key={country}
          countryCode={country}
          valorInicial={ubicacion}
          onChange={setUbicacion}
          onSelect={(lugar: LugarSeleccionado) => {
            setUbicacion(lugar.lugar);
            setLatitud(lugar.lat);
            setLongitud(lugar.lng);
            if (lugar.provincia) setProvincia(lugar.provincia);
            if (lugar.localidad) setLocalidad(lugar.localidad);
          }}
        />
        {typeof latitud === "number" && typeof longitud === "number" && (
          <span className="geocoder-coords">✓ {tt("Ubicación seleccionada:","Localização selecionada:")} {latitud.toFixed(4)}, {longitud.toFixed(4)}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">
            {COUNTRIES[country].subdivisionLabel} {tt("principal","principal")} <span className="required">*</span>
          </label>
          <select
            className="form-input"
            value={provincia}
            onChange={(e) => { setProvincia(e.target.value); setUbicacion(""); setLatitud(undefined); setLongitud(undefined); }}
            required
          >
            <option value="">{tt(`Elegí ${COUNTRIES[country].subdivisionLabel.toLowerCase()}`,`Selecione ${COUNTRIES[country].subdivisionLabel.toLowerCase()}`)}</option>
            {subdivisions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Localidad de referencia","Cidade de referência")}</label>
          <input
            className="form-input"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            placeholder={tt("Ej: Rafaela","Ex.: Campinas")}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">{tt("Zona donde trabajás","Área onde você atende")}</label>
        <input
          className="form-input"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          placeholder={tt("Ej: Rafaela y cuenca lechera","Ex.: Campinas e região")}
        />
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">04</span><span className="form-section-copy"><span>{tt("Detalles","Detalhes")}</span> <em>{tt("del servicio","do serviço")}</em></span></h2>
      <div className="form-field">
        <label className="form-label">{tt("Detalles del servicio","Detalhes do serviço")}</label>
        <textarea className="form-input form-textarea" rows={5} value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder={tt("Contá qué incluye el servicio, equipamiento, experiencia, disponibilidad u otra información útil para el productor.","Descreva o serviço, equipamentos, experiência, disponibilidade e outras informações úteis para o produtor.")} />
      </div>

      </div>

      {error && <div className="form-error servicio-form-error" role="alert">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary-lg" disabled={saving}>
          {saving ? tt("Guardando...","Salvando...") : publicacion ? tt("Guardar cambios","Salvar alterações") : tt("Publicar servicio","Anunciar serviço")}
        </button>
      </div>
    </form>
  );
}
