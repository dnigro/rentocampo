"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import { PROVINCIAS_ARG, type Profile, type RolPerfil, type ServicioRural } from "@/types";

interface Props {
  profile: Partial<Profile> | null;
}

export default function ServicioRuralForm({ profile }: Props) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [servicios, setServicios] = useState<ServicioRural[]>(
    profile?.servicios_rurales ?? [],
  );
  const [zona, setZona] = useState(profile?.zona_servicio ?? "");
  const [provincia, setProvincia] = useState(profile?.provincia_servicio ?? "");
  const [localidad, setLocalidad] = useState(profile?.localidad_servicio ?? "");
  const [photoPreview, setPhotoPreview] = useState(profile?.service_photo_url ?? "");
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

    if (!provincia) {
      setError("Elegí una provincia principal.");
      return;
    }

    setSaving(true);

    try {
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
        setPhotoPreview(result.url);
        // La URL subida se usa inmediatamente al crear la publicación.
        const uploadedUrl = result.url;
        setPhotoFile(null);
        photoInputRef.current?.setAttribute("data-uploaded-url", uploadedUrl);
      }

      const fotoUrl = photoFile ? undefined : photoPreview;
      const resolvedPhotoUrl = photoFile ? photoPreview : fotoUrl;
      if (!resolvedPhotoUrl) throw new Error("La foto del servicio es obligatoria.");

      const { error: insertError } = await supabase.from("servicios_publicaciones").insert({
        propietario_id: profile?.id,
        servicios_rurales: servicios,
        foto_url: resolvedPhotoUrl,
        zona: zona || null,
        provincia,
        localidad: localidad || null,
      });
      if (insertError) throw insertError;

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
    <form className="perfil-section servicio-publicacion-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

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

      <div className="form-actions">
        <button type="submit" className="btn-primary-lg" disabled={saving}>
          {saving ? "Guardando..." : "Publicar servicio"}
        </button>
      </div>
    </form>
  );
}
