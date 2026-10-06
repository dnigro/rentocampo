"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileText, Images, MapPinned } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import { PROVINCIAS_ARG, type Profile, type RolPerfil, type ServicioRural } from "@/types";
import GeocoderInput, { type LugarSeleccionado } from "@/components/campos/GeocoderInput";

interface ServicioInicial {
  id: string;
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
}

export default function ServicioRuralForm({ profile, publicacion }: Props) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [servicios, setServicios] = useState<ServicioRural[]>(
    publicacion?.servicios_rurales ?? profile?.servicios_rurales ?? [],
  );
  const [zona, setZona] = useState(publicacion?.zona ?? profile?.zona_servicio ?? "");
  const [provincia, setProvincia] = useState(publicacion?.provincia ?? profile?.provincia_servicio ?? "");
  const [localidad, setLocalidad] = useState(publicacion?.localidad ?? profile?.localidad_servicio ?? "");
  const [ubicacion, setUbicacion] = useState("");
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
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!servicios.length) {
      setError("Elegí al menos un servicio rural.");
      return;
    }

    if (!photoPreview && !photoFile) {
      setError("Subí una foto clara y real del servicio que ofrecés.");
      return;
    }

    if (!provincia || !ubicacion || typeof latitud !== "number" || typeof longitud !== "number") {
      setError("Seleccioná la zona de servicio usando el buscador del mapa.");
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
          throw new Error(result.error ?? "No se pudo subir la foto del servicio");
        }

        // Persistimos la URL pública devuelta por Storage, no el blob: local
        // usado solamente para el preview del navegador.
        resolvedPhotoUrl = result.url;
        setPhotoPreview(result.url);
        setPhotoFile(null);
      }

      if (!resolvedPhotoUrl) throw new Error("La foto del servicio es obligatoria.");

      const payload = {
        propietario_id: profile?.id,
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
        ? await supabase.from("servicios_publicaciones").update(payload).eq("id", publicacion.id)
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
        throw new Error(roleResult.error ?? "No se pudo activar el perfil de servicios");
      }

      router.push("/mis-servicios-rurales");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el servicio.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="campo-form servicio-publicacion-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">01</span><span className="form-section-icon" aria-hidden="true"><FileText size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>Información</span> <em>del servicio</em></span></h2>
      <div className="form-field">
        <label className="form-label">
          ¿Qué servicios ofrecés? <span className="required">*</span>
        </label>
        <p className="form-hint">
          Elegí uno o varios rubros. Estos son los que verán los usuarios en tu publicación.
        </p>
        <div className="servicios-options">
          {SERVICIOS_RURALES.map((servicio) => (
            <label className="servicio-option" key={servicio.value}>
              <input
                type="checkbox"
                checked={servicios.includes(servicio.value)}
                onChange={() => toggleServicio(servicio.value)}
              />
              <span>{servicio.label}</span>
            </label>
          ))}
        </div>
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">02</span><span className="form-section-icon" aria-hidden="true"><Images size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>Foto</span> <em>del servicio</em></span></h2>
      <div className="form-field">
        <label className="form-label">Foto de tu servicio <span className="required">*</span></label>
        <p className="form-hint">Subí una foto clara y real de tu trabajo. Una buena imagen ayuda a que los productores entiendan rápidamente qué servicio ofrecés.</p>
        <div className="servicio-foto-editor">
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Foto de tu servicio rural"
              width={900}
              height={580}
              className="servicio-foto-preview"
            />
          ) : (
            <div className="servicio-foto-placeholder">
              📷 Subí una foto real que represente tu trabajo
            </div>
          )}
          <button
            type="button"
            className="btn-secondary-lg"
            onClick={() => photoInputRef.current?.click()}
          >
            {photoPreview ? "Cambiar foto" : "Subir foto"}
          </button>
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
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">03</span><span className="form-section-icon" aria-hidden="true"><MapPinned size={24} strokeWidth={1.8} /></span><span className="form-section-copy"><span>Zona</span> <em>de cobertura</em></span></h2>
      <div className="form-field">
        <label className="form-label">Buscar zona de servicio en el mapa <span className="required">*</span></label>
        <GeocoderInput
          countryCode="AR"
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
          <span className="geocoder-coords">✓ Ubicación seleccionada: {latitud.toFixed(4)}, {longitud.toFixed(4)}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">
            Provincia principal <span className="required">*</span>
          </label>
          <select
            className="form-input"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            required
          >
            <option value="">Elegí una provincia</option>
            {PROVINCIAS_ARG.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Localidad de referencia</label>
          <input
            className="form-input"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            placeholder="Ej: Rafaela"
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Zona donde trabajás</label>
        <input
          className="form-input"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          placeholder="Ej: Rafaela y cuenca lechera"
        />
      </div>

      </div>

      <div className="form-section">
        <h2 className="form-section-title form-section-title-editorial"><span className="form-section-number">04</span><span className="form-section-copy"><span>Detalles</span> <em>del servicio</em></span></h2>
      <div className="form-field">
        <label className="form-label">Detalles del servicio</label>
        <textarea className="form-input form-textarea" rows={5} value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder="Contá qué incluye el servicio, equipamiento, experiencia, disponibilidad u otra información útil para el productor." />
      </div>

      </div>

      {error && <div className="form-error servicio-form-error" role="alert">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary-lg" disabled={saving}>
          {saving ? "Guardando..." : publicacion ? "Guardar cambios" : "Publicar servicio"}
        </button>
      </div>
    </form>
  );
}
