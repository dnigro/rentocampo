"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import "@/styles/publication-delete.css";

interface Props { id: string; titulo: string; tipo: "campo" | "servicio"; onDeleted?: () => void; returnTo?: string }
export default function EliminarPublicacion(props: Props) {
  const { country } = useTranslations();
  const t = (es: string, pt: string, en: string) => country === "BR" ? pt : country === "US" ? en : es;
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="btn-action btn-action-danger publication-delete-trigger" onClick={() => setOpen(true)} aria-label={`${t("Eliminar", "Excluir", "Delete")}: ${props.titulo}`}><Trash2 size={15} aria-hidden="true"/>{t("Eliminar", "Excluir", "Delete")}</button>
    {open && createPortal(<Confirmation {...props} close={() => setOpen(false)} />, document.body)}
  </>;
}

function Confirmation({ id, titulo, tipo, onDeleted, returnTo, close }: Props & { close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const router = useRouter();
  const lite = usePathname().startsWith("/lite/");
  const { country } = useTranslations();
  const t = (es: string, pt: string, en: string) => country === "BR" ? pt : country === "US" ? en : es;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    cancel.current?.focus();
    return () => element?.close();
  }, []);
  async function remove() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/${tipo === "campo" ? "campos" : "servicios"}/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true || result.id !== id) {
        setError(response.status === 401 ? t("Tu sesión venció. Ingresá nuevamente.", "Sua sessão expirou. Entre novamente.", "Your session expired. Please sign in again.") : response.status === 404 ? t("La publicación ya no está disponible o no tenés permiso para eliminarla. Actualizá el listado.", "O anúncio não está disponível ou você não tem permissão. Atualize a lista.", "This listing is unavailable or you do not have permission. Refresh the list.") : t("No se pudo eliminar. Intentá nuevamente.", "Não foi possível excluir. Tente novamente.", "Could not delete. Please try again."));
        return;
      }
      onDeleted?.();
      if (returnTo) router.replace(lite ? tipo === "campo" ? "/lite/campos/mis-publicaciones" : "/lite/servicios/mis-publicaciones" : returnTo);
      router.refresh();
      close();
    } catch {
      setError(t("No pudimos conectar. La publicación sigue en tu listado; volvé a intentar.", "Não foi possível conectar. O anúncio continua na lista; tente novamente.", "Connection failed. The listing remains in your list; please retry."));
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <dialog ref={dialog} className="publication-dialog" aria-labelledby="publication-delete-title" aria-describedby="publication-delete-description" onCancel={event => {event.preventDefault(); if (!inFlight.current) close();}}>
    <span className="publication-dialog-icon"><Trash2 size={25} aria-hidden="true"/></span>
    <p className="publication-dialog-eyebrow">RENTOCAMPO</p>
    <h2 id="publication-delete-title">{tipo === "campo" ? t("¿Eliminar este campo?", "Excluir esta terra?", "Delete this field?") : t("¿Eliminar este servicio?", "Excluir este serviço?", "Delete this service?")}</h2>
    <p className="publication-dialog-name">{titulo}</p>
    <p id="publication-delete-description">{t("La publicación dejará de aparecer en el sitio y en tu listado. Esta acción no se puede deshacer.", "O anúncio será removido do site e da sua lista. Esta ação não pode ser desfeita.", "The listing will be removed from the site and your list. This action cannot be undone.")}</p>
    {tipo === "campo" && <p className="publication-dialog-detail">{t("También se eliminan los favoritos y las conversaciones vinculadas a este campo.", "Os favoritos e as conversas vinculadas a esta terra também serão excluídos.", "Saved favorites and conversations linked to this field will also be deleted.")}</p>}
    {error && <p className="publication-dialog-error" role="alert">{error}</p>}
    <div className="publication-dialog-actions">
      <button ref={cancel} type="button" onClick={close} disabled={busy}>{t("Cancelar", "Cancelar", "Cancel")}</button>
      <button type="button" className="publication-dialog-confirm" onClick={remove} disabled={busy}>{busy ? t("Eliminando…", "Excluindo…", "Deleting…") : t("Sí, eliminar", "Sim, excluir", "Yes, delete")}</button>
    </div>
    {busy && <p role="status" className="publication-dialog-detail">{t("Procesando la eliminación…", "Processando a exclusão…", "Deleting the listing…")}</p>}
  </dialog>;
}
