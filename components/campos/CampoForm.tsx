"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PROVINCIAS_ARG } from "@/types";
import type { CampoFormData } from "@/types";
import GeocoderInput, {
  type LugarSeleccionado,
} from "@/components/campos/GeocoderInput";

interface Props {
  campoId?: string;
  initialData?: Partial<CampoFormData>;
  fotosIniciales?: { id: string; url: string; orden: number }[];
}

const APTITUDES = [
  { value: "agricola", label: "Agrícola" },
  { value: "ganadera", label: "Ganadera" },
  { value: "mixta", label: "Mixta" },
  { value: "forestal", label: "Forestal" },
  { value: "otro", label: "Otro" },
];

const DISPONIBILIDADES = [
  { value: "inmediata", label: "Inmediata" },
  { value: "campaña_próxima", label: "Campaña próxima" },
  { value: "a_convenir", label: "A convenir" },
];

export default function CampoForm({
  campoId,
  initialData,
  fotosIniciales = [],
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CampoFormData>({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    provincia: "",
    departamento: "",
    localidad: "",
    hectareas: 0,
    aptitud: "agricola",
    ambiente: "",
    precio: undefined,
    moneda: "USD",
    disponibilidad: "a_convenir",
    rendimiento_estimado: "",
    mejoras: "No",
    ...initialData,
  });

  const [lugarGeocodificado, setLugarGeocodificado] = useState(
    initialData?.localidad ?? "",
  );

  const [fotos, setFotos] = useState<
    { id?: string; url: string; file?: File; orden: number }[]
  >(fotosIniciales.map((f) => ({ id: f.id, url: f.url, orden: f.orden })));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
    }));
  }

  async function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (fotos.length + files.length > 8) {
      setError("Máximo 8 fotos por campo.");
      return;
    }
    setUploading(true);
    setError("");
    const nuevas = files.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      orden: fotos.length + i,
    }));
    setFotos((prev) => [...prev, ...nuevas]);
    setUploading(false);
  }

  function removeFoto(index: number) {
    setFotos((prev) =>
      prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, orden: i })),
    );
  }

  async function uploadFotos(id: string) {
    const subidas: { url: string; orden: number }[] = [];
    for (const foto of fotos) {
      if (foto.id) {
        subidas.push({ url: foto.url, orden: foto.orden });
        continue;
      }
      if (!foto.file) continue;
      const ext = foto.file.name.split(".").pop();
      const path = `${id}/${Date.now()}-${foto.orden}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("campos-fotos")
        .upload(path, foto.file, { upsert: true });
      if (uploadError) {
        console.error("Error subiendo foto:", uploadError);
        continue;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("campos-fotos").getPublicUrl(path);
      subidas.push({ url: publicUrl, orden: foto.orden });
    }
    return subidas;
  }

  async function handleSubmit(
    e: React.FormEvent,
    estado: "borrador" | "activo",
  ) {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!form.titulo || !form.ubicacion || !form.provincia || !form.hectareas || !form.aptitud) {
      setError(
        "Completá los campos obligatorios: título, ubicación, provincia, hectáreas y aptitud.",
      );
      setSaving(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      let id = campoId;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      if (!profile?.roles?.includes("propietario")) {
        throw new Error(
          "Solo los propietarios pueden publicar o administrar campos. Activá el rol Propietario desde tu perfil.",
        );
      }

      if (campoId) {
        const { error } = await supabase
          .from("campos")
          .update({ ...form, status: estado })
          .eq("id", campoId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("campos")
          .insert({ ...form, propietario_id: user.id, status: estado })
          .select("id")
          .single();
        if (error) throw error;
        id = data.id;
      }

      if (id) {
        const subidas = await uploadFotos(id);
        const { error: deleteFotosError } = await supabase
          .from("campos_fotos")
          .delete()
          .eq("campo_id", id);
        if (deleteFotosError) throw deleteFotosError;
        if (subidas.length) {
          const { error: insertFotosError } = await supabase
            .from("campos_fotos")
            .insert(
              subidas.map((f) => ({
                campo_id: id,
                url: f.url,
                orden: f.orden,
              })),
            );
          if (insertFotosError) throw insertFotosError;
        }
      }

      router.push("/mis-campos");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err &&
              typeof err.message === "string"
            ? err.message
            : "Ocurrió un error al guardar el campo.";
      setError(message);
      setSaving(false);
    }
  }

  return (
    <form className="campo-form" onSubmit={(e) => e.preventDefault()}>
      {error && <div className="form-error">{error}</div>}

      {/* Información básica */}
      <div className="form-section">
        <h2 className="form-section-title">Información básica</h2>

        <div className="form-field">
          <label className="form-label">
            Título del campo <span className="required">*</span>
          </label>
          <input
            name="titulo"
            type="text"
            className="form-input"
            placeholder="Ej: Campo agrícola en Marcos Juárez"
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">Descripción</label>
          <textarea
            name="descripcion"
            className="form-input form-textarea"
            placeholder="Describí las características principales del campo, accesos, infraestructura..."
            value={form.descripcion ?? ""}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </div>

      {/* Ubicación */}
      <div className="form-section">
        <h2 className="form-section-title">Ubicación</h2>

        <div className="form-field">
          <label className="form-label">Buscar ubicación en el mapa</label>
          <GeocoderInput
            valorInicial={lugarGeocodificado}
            onChange={(ubicacion) =>
              setForm((prev) => ({ ...prev, ubicacion }))
            }
            onSelect={(lugar: LugarSeleccionado) => {
              setForm((prev) => ({
                ...prev,
                ubicacion: lugar.lugar,
                latitud: lugar.lugar ? lugar.lat : undefined,
                longitud: lugar.lugar ? lugar.lng : undefined,
                ...(lugar.localidad && { localidad: lugar.localidad }),
                ...(lugar.departamento && { departamento: lugar.departamento }),
                ...(lugar.provincia && { provincia: lugar.provincia }),
              }));
              setLugarGeocodificado(lugar.lugar);
            }}
          />
          {form.latitud !== undefined && form.longitud !== undefined ? (
            <span className="geocoder-coords">
              ✓ Ubicación seleccionada: {form.latitud.toFixed(4)},{" "}
              {form.longitud.toFixed(4)}
            </span>
          ) : (
            <span className="geocoder-hint">
              Buscá la localidad o dirección más cercana al campo para que
              aparezca en el mapa.
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Provincia <span className="required">*</span>
            </label>
            <select
              name="provincia"
              className="form-input form-select"
              value={form.provincia}
              onChange={handleChange}
              required
            >
              <option value="">Seleccioná...</option>
              {PROVINCIAS_ARG.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Departamento / Partido</label>
            <input
              name="departamento"
              type="text"
              className="form-input"
              placeholder="Ej: Marcos Juárez"
              value={form.departamento ?? ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Localidad más cercana</label>
          <input
            name="localidad"
            type="text"
            className="form-input"
            placeholder="Ej: Corral de Bustos"
            value={form.localidad ?? ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Características */}
      <div className="form-section">
        <h2 className="form-section-title">Características</h2>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">
              Hectáreas <span className="required">*</span>
            </label>
            <input
              name="hectareas"
              type="number"
              className="form-input"
              placeholder="Ej: 240"
              value={form.hectareas || ""}
              onChange={handleChange}
              min={1}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">
              Aptitud <span className="required">*</span>
            </label>
            <select
              name="aptitud"
              className="form-input form-select"
              value={form.aptitud}
              onChange={handleChange}
            >
              {APTITUDES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Ambiente / Suelo</label>
            <input
              name="ambiente"
              type="text"
              className="form-input"
              placeholder="Ej: Agrícola típico, suelos profundos"
              value={form.ambiente ?? ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Rendimiento estimado (qq/ha)</label>
            <input
              name="rendimiento_estimado"
              type="text"
              className="form-input"
              placeholder="Ej: 35"
              value={form.rendimiento_estimado ?? ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field form-check">
          <input
            type="checkbox"
            id="mejoras"
            name="mejoras"
            checked={form.mejoras === "Sí"}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, mejoras: e.target.checked ? "Sí" : "No" }))
            }
          />
          <label htmlFor="mejoras" className="form-check-label">
            El campo tiene mejoras (galpones, corrales, silos, perforaciones,
            etc.)
          </label>
        </div>
      </div>

      {/* Precio y disponibilidad */}
      <div className="form-section">
        <h2 className="form-section-title">Precio y disponibilidad</h2>

        <div className="form-row">
          <div className="form-field form-field-price">
            <label className="form-label">Precio total estimado</label>
            <div className="input-with-prefix">
              <select
                name="moneda"
                className="input-prefix"
                value={form.moneda}
                onChange={handleChange}
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
              <input
                name="precio"
                type="number"
                className="form-input input-after-prefix"
                placeholder="Ej: 320"
                value={form.precio ?? ""}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Disponibilidad</label>
            <select
              name="disponibilidad"
              className="form-input form-select"
              value={form.disponibilidad}
              onChange={handleChange}
            >
              {DISPONIBILIDADES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fotos */}
      <div className="form-section">
        <h2 className="form-section-title">
          Fotos <span className="form-section-hint">(máx. 8)</span>
        </h2>

        <div className="fotos-grid">
          {fotos.map((foto, i) => (
            <div key={i} className="foto-thumb">
              <img src={foto.url} alt={"Foto " + (i + 1)} />
              <button
                type="button"
                className="foto-remove"
                onClick={() => removeFoto(i)}
                title="Eliminar foto"
              >
                ×
              </button>
              {i === 0 && <span className="foto-principal">Principal</span>}
            </div>
          ))}
          {fotos.length < 8 && (
            <button
              type="button"
              className="foto-add"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <span className="foto-add-icon">+</span>
              <span className="foto-add-label">
                {uploading ? "Subiendo..." : "Agregar foto"}
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFotos}
        />
      </div>

      {/* Acciones */}
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary-lg"
          onClick={(e) => handleSubmit(e, "borrador")}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar borrador"}
        </button>
        <button
          type="button"
          className="btn-primary-lg"
          onClick={(e) => handleSubmit(e, "activo")}
          disabled={saving}
        >
          {saving ? "Publicando..." : "Publicar campo"}
        </button>
      </div>
    </form>
  );
}
