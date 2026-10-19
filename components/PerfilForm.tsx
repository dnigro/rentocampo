"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Profile, type RolPerfil, type ServicioRural } from "@/types";
import { COUNTRIES, COUNTRY_CODES, getCountrySubdivisions, type CountryCode } from "@/data/countries";
import { SERVICIOS_RURALES, servicioLabel } from "@/data/servicios-rurales";
import { regionalText } from "@/lib/i18n/regional";

interface Props {
  profile: Partial<Profile> | null;
  email: string;
}

export default function PerfilForm({ profile, email }: Props) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const servicePhotoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: profile?.nombre ?? "",
    country_code: (profile?.country_code ?? "AR") as CountryCode,
    telefono: profile?.telefono ?? "",
    bio: profile?.bio ?? "",
    roles: profile?.roles?.length
      ? profile.roles
      : ["productor" as const],
    servicios_rurales: profile?.servicios_rurales ?? [],
    zona_servicio: profile?.zona_servicio ?? "",
    provincia_servicio: profile?.provincia_servicio ?? "",
    localidad_servicio: profile?.localidad_servicio ?? "",
  });

  const tt=(es:string,pt:string)=>regionalText(form.country_code,es,pt);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [servicePhotoPreview, setServicePhotoPreview] = useState(profile?.service_photo_url ?? "");
  const [servicePhotoFile, setServicePhotoFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeServicePhoto, setRemoveServicePhoto] = useState(false);

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
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

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
    setRemoveAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleServicePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setServicePhotoFile(file);
    setRemoveServicePhoto(false);
    setServicePhotoPreview(URL.createObjectURL(file));
  }

  function toggleRole(role: RolPerfil) {
    setForm((prev) => {
      const activo = prev.roles.includes(role);
      if (activo && prev.roles.length === 1) return prev;
      return {
        ...prev,
        roles: activo
          ? prev.roles.filter((item) => item !== role)
          : [...prev.roles, role],
      };
    });
  }

  function toggleServicio(servicio: ServicioRural) {
    setForm((prev) => ({
      ...prev,
      servicios_rurales: prev.servicios_rurales.includes(servicio)
        ? prev.servicios_rurales.filter((item) => item !== servicio)
        : [...prev.servicios_rurales, servicio],
    }));
  }

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      // Subir avatar mediante la ruta autenticada y actualizar el perfil.
      if (avatarFile) {
        const body = new FormData();
        body.set("file", avatarFile);
        const response = await fetch("/api/profile/avatar", { method: "POST", body });
        const result = await response.json();
        if (!response.ok || !result.url) {
          throw new Error(result.error ?? "No se pudo subir la foto de perfil");
        }
        setAvatarPreview(result.url);
      }

      if (servicePhotoFile && form.roles.includes("prestador")) {
        const body = new FormData();
        body.set("file", servicePhotoFile);
        const response = await fetch("/api/profile/service-photo", {
          method: "POST",
          body,
        });
        const result = await response.json();
        if (!response.ok || !result.url) {
          throw new Error(result.error ?? "No se pudo subir la foto del servicio");
        }
        setServicePhotoPreview(result.url);
      }

      // Guardar primero los roles mediante la ruta autenticada. Esto permite
      // volver a activar "prestador" antes de persistir sus datos de servicio.
      const roleResponse = await fetch("/api/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: form.roles }),
      });
      const roleResult = await roleResponse.json();
      if (!roleResponse.ok) {
        throw new Error(roleResult.error ?? "No se pudo actualizar el perfil");
      }

      const profileResponse = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roles: form.roles,
          remove_avatar: removeAvatar,
          remove_service_photo: removeServicePhoto,
          nombre: form.nombre,
          country_code: form.country_code,
          telefono: form.telefono,
          bio: form.bio,
          servicios_rurales: form.roles.includes("prestador")
            ? form.servicios_rurales
            : [],
          zona_servicio: form.roles.includes("prestador")
            ? form.zona_servicio
            : null,
          provincia_servicio: form.roles.includes("prestador")
            ? form.provincia_servicio
            : null,
          localidad_servicio: form.roles.includes("prestador")
            ? form.localidad_servicio
            : null,
        }),
      });
      const profileResult = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error(profileResult.error ?? "No se pudieron guardar los datos del perfil");
      }

      setSuccessMsg("Perfil actualizado correctamente.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err &&
              typeof err.message === "string"
            ? err.message
            : "Error al guardar el perfil.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorPass("");
    setSuccessPass("");

    if (passwords.nueva.length < 6) {
      setErrorPass(tt("La contraseña debe tener al menos 6 caracteres.","A senha deve ter pelo menos 6 caracteres."));
      return;
    }
    if (passwords.nueva !== passwords.confirmar) {
      setErrorPass(tt("Las contraseñas no coinciden.","As senhas não coincidem."));
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

  async function handleEliminarCuenta() {
    if (deleteConfirm !== "ELIMINAR") {
      setDeleteError("Escribí ELIMINAR para confirmar.");
      return;
    }

    setDeleting(true);
    setDeleteError("");
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: deleteConfirm }),
    });

    if (!response.ok) {
      setDeleteError(
        "No pudimos eliminar la cuenta. Volvé a intentarlo o contactanos.",
      );
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
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
        <h2 className="perfil-section-title">{tt("Foto de perfil","Foto de perfil")}</h2>
        <div className="avatar-editor">
          <div
            className="avatar-preview"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={80}
                height={80}
                unoptimized={avatarPreview.startsWith("blob:")}
              />
            ) : (
              <span className="avatar-initials">{iniciales}</span>
            )}
            <div className="avatar-overlay">
              <span>{tt("Cambiar","Trocar")}</span>
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
                  setRemoveAvatar(true);
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
        <h2 className="perfil-section-title">{tt("Datos personales","Dados pessoais")}</h2>

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
          <span className="form-hint">{tt("El email no se puede cambiar","O e-mail não pode ser alterado")}</span>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("País","País")}</label>
          <select
            name="country_code"
            className="form-input"
            value={form.country_code}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                country_code: e.target.value as CountryCode,
                zona_servicio: "",
                provincia_servicio: "",
                localidad_servicio: "",
              }))
            }
          >
            {COUNTRY_CODES.map((code) => <option key={code} value={code}>{COUNTRIES[code].flag} {COUNTRIES[code].name}</option>)}
          </select>
          <span className="form-hint">
            {tt("Define tu mercado principal y adapta campos, servicios y ubicaciones.","Defina seu mercado principal para adaptar terras, serviços e localizações.")}
          </span>
        </div>

        <div className="form-field">
          <label className="form-label">{tt("Cómo querés usar RentoCampo","Como deseja usar a RentoCampo")}</label>
          <div className="perfil-role-options">
            <label className="perfil-role-option">
              <input
                type="checkbox"
                checked={form.roles.includes("productor")}
                onChange={() => toggleRole("productor")}
              />
              <span>
                <strong>🌱 {tt("Productor","Produtor")}</strong>
                <small>{tt("Buscar campos, guardar favoritos y consultar.","Buscar terras, salvar favoritos e consultar.")}</small>
              </span>
            </label>
            <label className="perfil-role-option">
              <input
                type="checkbox"
                checked={form.roles.includes("propietario")}
                onChange={() => toggleRole("propietario")}
              />
              <span>
                <strong>🏡 {tt("Propietario","Proprietário")}</strong>
                <small>{tt("Publicar y administrar campos.","Anunciar e gerenciar terras.")}</small>
              </span>
            </label>
            <label className="perfil-role-option">
              <input
                type="checkbox"
                checked={form.roles.includes("prestador")}
                onChange={() => toggleRole("prestador")}
              />
              <span>
                <strong>⚙️ {tt("Servicios rurales","Serviços rurais")}</strong>
                <small>{tt("Ofrecer trabajos, instalaciones y soluciones para el campo.","Oferecer serviços, instalações e soluções rurais.")}</small>
              </span>
            </label>
          </div>
          <span className="form-hint">{tt("Podés elegir uno o varios perfiles.","Você pode selecionar um ou mais perfis.")}</span>
        </div>

        {form.roles.includes("prestador") && (
          <div className="servicios-profile-box" id="mis-servicios-rurales">
            <div>
              <h3>{tt("¿Qué servicios ofrecés?","Quais serviços você oferece?")}</h3>
              <p>{tt("Elegí todos los que correspondan para que puedan encontrarte.","Selecione as categorias necessárias para que encontrem você.")}</p>
            </div>
            <div className="servicios-options">
              {SERVICIOS_RURALES.map((servicio) => (
                <label className="servicio-option" key={servicio.value}>
                  <input
                    type="checkbox"
                    checked={form.servicios_rurales.includes(servicio.value)}
                    onChange={() => toggleServicio(servicio.value)}
                  />
                  <span>{servicioLabel(servicio.value,form.country_code)}</span>
                </label>
              ))}
            </div>
            <div className="form-field">
              <label className="form-label">{tt("Foto de tus servicios","Foto dos seus serviços")}</label>
              <div className="servicio-foto-editor">
                {servicePhotoPreview ? (
                  <Image
                    src={servicePhotoPreview}
                    alt="Foto representativa de tus servicios rurales"
                    width={720}
                    height={420}
                    className="servicio-foto-preview"
                  />
                ) : (
                  <div className="servicio-foto-placeholder">
                    📷 {tt("Subí una foto que represente tu trabajo","Envie uma foto que represente seu trabalho")}
                  </div>
                )}
                <button
                  type="button"
                  className="btn-secondary-lg"
                  onClick={() => servicePhotoInputRef.current?.click()}
                >
                  {servicePhotoPreview ? tt("Cambiar foto","Trocar foto") : tt("Subir foto","Enviar foto")}
                </button>
                {servicePhotoPreview && (
                  <button type="button" className="btn-secondary-lg" onClick={() => {
                    setServicePhotoPreview("");
                    setServicePhotoFile(null);
                    setRemoveServicePhoto(true);
                  }}>{tt("Eliminar foto","Excluir foto")}</button>
                )}
                <input
                  ref={servicePhotoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleServicePhotoChange}
                />
              </div>
              <span className="form-hint">
                {tt("Usá una imagen real y acorde al servicio que ofrecés.","Use uma imagem real que represente o serviço que oferece.")}
              </span>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="zona_servicio">
                {tt("Zona donde trabajás","Área onde você atende")}
              </label>
              <input
                id="zona_servicio"
                name="zona_servicio"
                type="text"
                className="form-input"
                placeholder={tt("Ej: sur de Córdoba y norte de La Pampa","Ex.: interior de São Paulo e região")}
                value={form.zona_servicio}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="provincia_servicio">
                  {`${COUNTRIES[form.country_code].subdivisionLabel} principal`}
                </label>
                <select id="provincia_servicio" name="provincia_servicio" className="form-input" value={form.provincia_servicio} onChange={handleChange}>
                  <option value="">
                    {tt(`Elegí ${COUNTRIES[form.country_code].subdivisionLabel.toLowerCase()}`,`Selecione ${COUNTRIES[form.country_code].subdivisionLabel.toLowerCase()}`)}
                  </option>
                  {getCountrySubdivisions(form.country_code).map((provincia) => <option key={provincia} value={provincia}>{provincia}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="localidad_servicio">{tt("Localidad de referencia","Cidade de referência")}</label>
                <input id="localidad_servicio" name="localidad_servicio" className="form-input" placeholder={tt("Ej: Pergamino","Ex.: Campinas")} value={form.localidad_servicio} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">{tt("Nombre completo","Nome completo")}</label>
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
            <label className="form-label">{tt("Teléfono","Telefone")}</label>
            <input
              name="telefono"
              type="tel"
              className="form-input"
              placeholder={tt("Ej: +54 9 11 1234-5678","Ex.: +55 11 91234-5678")}
              value={form.telefono}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">
            {form.roles.includes("prestador")
              ? tt("Sobre vos / tus servicios","Sobre você / seus serviços")
              : form.roles.includes("propietario")
              ? tt("Sobre vos / tu empresa","Sobre você / sua empresa")
              : tt("Sobre vos / tu actividad","Sobre você / sua atividade")}
          </label>
          <textarea
            name="bio"
            className="form-input form-textarea"
            placeholder={tt("Contá brevemente quién sos y tu experiencia...","Conte brevemente sobre você e sua experiência...")}
            value={form.bio}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary-lg" disabled={saving}>
            {saving ? tt("Guardando...","Salvando...") : tt("Guardar cambios","Salvar alterações")}
          </button>
        </div>
      </form>

      {/* Sección: Cambiar contraseña */}
      <form className="perfil-section" onSubmit={handleCambiarPassword}>
        <h2 className="perfil-section-title">{tt("Cambiar contraseña","Alterar senha")}</h2>

        {errorPass && <div className="form-error">{errorPass}</div>}
        {successPass && <div className="form-success">{successPass}</div>}

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">{tt("Nueva contraseña","Nova senha")}</label>
            <input
              type="password"
              className="form-input"
              placeholder={tt("Mínimo 6 caracteres","Mínimo de 6 caracteres")}
              value={passwords.nueva}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, nueva: e.target.value }))
              }
              autoComplete="new-password"
            />
          </div>
          <div className="form-field">
            <label className="form-label">{tt("Confirmar contraseña","Confirmar senha")}</label>
            <input
              type="password"
              className="form-input"
              placeholder={tt("Repetí la contraseña","Repita a senha")}
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
            {savingPass ? tt("Cambiando...","Alterando...") : tt("Cambiar contraseña","Alterar senha")}
          </button>
        </div>
      </form>

      <section className="perfil-section perfil-danger-zone">
        <h2 className="perfil-section-title">{tt("Eliminar cuenta","Excluir conta")}</h2>
        <p className="perfil-danger-text">
          {tt("Esta acción elimina tu perfil, publicaciones, fotos, favoritos y mensajes. No se puede deshacer.","Esta ação exclui seu perfil, anúncios, fotos, favoritos e mensagens. Não pode ser desfeita.")}
        </p>
        {deleteError && <div className="form-error">{deleteError}</div>}
        <div className="form-field">
          <label className="form-label" htmlFor="delete-confirmation">
            {tt("Para confirmar, escribí","Para confirmar, digite")} <strong>ELIMINAR</strong>
          </label>
          <input
            id="delete-confirmation"
            className="form-input"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn-danger-lg"
            onClick={handleEliminarCuenta}
            disabled={deleting || deleteConfirm !== "ELIMINAR"}
          >
            {deleting ? tt("Eliminando cuenta...","Excluindo conta...") : tt("Eliminar mi cuenta","Excluir minha conta")}
          </button>
        </div>
      </section>
    </div>
  );
}
