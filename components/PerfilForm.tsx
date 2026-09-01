"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { PROVINCIAS_ARG } from "@/types";

interface Props {
  profile: any;
  userId: string;
  email: string;
}

export default function PerfilForm({ profile, userId, email }: Props) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: profile?.nombre ?? "",
    telefono: profile?.telefono ?? "",
    provincia: profile?.provincia ?? "",
    descripcion: profile?.descripcion ?? "",
  });

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [passwords, setPasswords] = useState({
    nueva: "",
    confirmar: "",
  });

  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [successPass, setSuccessPass] = useState("");
  const [error, setError] = useState("");
  const [errorPass, setErrorPass] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      let newAvatarUrl = avatarUrl;

      // Subir avatar si cambió
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${userId}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(path);

        newAvatarUrl = publicUrl;
        setAvatarUrl(newAvatarUrl);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          nombre: form.nombre,
          telefono: form.telefono,
          provincia: form.provincia,
          descripcion: form.descripcion,
          avatar_url: newAvatarUrl || null,
        })
        .eq("id", userId);

      if (error) throw error;
      setSuccessMsg("Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(err.message ?? "Error al guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorPass("");
    setSuccessPass("");

    if (passwords.nueva.length < 6) {
      setErrorPass("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwords.nueva !== passwords.confirmar) {
      setErrorPass("Las contraseñas no coinciden.");
      return;
    }

    setSavingPass(true);
    const { error } = await supabase.auth.updateUser({
      password: passwords.nueva,
    });
    if (error) {
      setErrorPass(error.message);
    } else {
      setSuccessPass("Contraseña actualizada correctamente.");
      setPasswords({ nueva: "", confirmar: "" });
    }
    setSavingPass(false);
  }

  const iniciales = form.nombre
    ? form.nombre
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="perfil-layout">
      {/* Sección: Avatar */}
      <div className="perfil-section">
        <h2 className="perfil-section-title">Foto de perfil</h2>
        <div className="avatar-editor">
          <div
            className="avatar-preview"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" />
            ) : (
              <span className="avatar-initials">{iniciales}</span>
            )}
            <div className="avatar-overlay">
              <span>Cambiar</span>
            </div>
          </div>
          <div className="avatar-info">
            <p className="avatar-hint">JPG o PNG, máximo 2MB</p>
            <button
              type="button"
              className="btn-secondary-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              Elegir foto
            </button>
            {avatarPreview && (
              <button
                type="button"
                className="btn-remove-avatar"
                onClick={() => {
                  setAvatarPreview("");
                  setAvatarFile(null);
                  setAvatarUrl("");
                }}
              >
                Eliminar foto
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>

      {/* Sección: Datos personales */}
      <form className="perfil-section" onSubmit={handleSavePerfil}>
        <h2 className="perfil-section-title">Datos personales</h2>

        {error && <div className="form-error">{error}</div>}
        {successMsg && <div className="form-success">{successMsg}</div>}

        <div className="form-field">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input form-input-disabled"
            value={email}
            disabled
          />
          <span className="form-hint">El email no se puede cambiar</span>
        </div>

        <div className="form-field">
          <label className="form-label">Tipo de cuenta</label>
          <input
            type="text"
            className="form-input form-input-disabled"
            value={
              profile?.tipo === "propietario"
                ? "🏡 Propietario"
                : "🌱 Productor"
            }
            disabled
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Nombre completo</label>
            <input
              name="nombre"
              type="text"
              className="form-input"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Teléfono</label>
            <input
              name="telefono"
              type="tel"
              className="form-input"
              placeholder="Ej: +54 9 11 1234-5678"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Provincia</label>
          <select
            name="provincia"
            className="form-input form-select"
            value={form.provincia}
            onChange={handleChange}
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
          <label className="form-label">
            {profile?.tipo === "propietario"
              ? "Sobre vos / tu empresa"
              : "Sobre vos / tu actividad"}
          </label>
          <textarea
            name="descripcion"
            className="form-input form-textarea"
            placeholder="Contá brevemente quién sos y tu experiencia..."
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary-lg" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Sección: Cambiar contraseña */}
      <form className="perfil-section" onSubmit={handleCambiarPassword}>
        <h2 className="perfil-section-title">Cambiar contraseña</h2>

        {errorPass && <div className="form-error">{errorPass}</div>}
        {successPass && <div className="form-success">{successPass}</div>}

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Nueva contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={passwords.nueva}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, nueva: e.target.value }))
              }
              autoComplete="new-password"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repetí la contraseña"
              value={passwords.confirmar}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, confirmar: e.target.value }))
              }
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-secondary-lg"
            disabled={savingPass}
          >
            {savingPass ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}
