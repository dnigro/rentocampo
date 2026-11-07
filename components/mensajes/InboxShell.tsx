"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, MessageSquare, ArrowLeft } from "lucide-react";
import { useTranslations } from "@/lib/i18n/useTranslations";
import MensajesRealtime from "./MensajesRealtime";
import "@/styles/inbox-workspace.css";

interface Profile { id: string; nombre: string; avatar_url: string | null }
interface Thread {
  id: string; contenido: string; created_at: string; remitente_id: string;
  destinatario_id: string; noLeidos: number;
  remitente: Profile | null; destinatario: Profile | null;
  campo: { id: string; titulo: string; fotos: { url: string; orden: number | null }[] } | null;
}

export default function InboxShell({ hilos, userId, children }: {
  hilos: Thread[]; userId: string; children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { country } = useTranslations();
  const en = country === "US", pt = country === "BR";
  const t = (es: string, br: string, us: string) => en ? us : pt ? br : es;
  const base = pathname.startsWith("/lite/") ? "/lite/perfil/mensajes" : "/mensajes";
  const opened = pathname !== base && pathname !== base + "/";
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(false);
  const count = hilos.reduce((sum, thread) => sum + thread.noLeidos, 0);
  const visible = hilos.filter(thread => {
    const other = thread.remitente_id === userId ? thread.destinatario : thread.remitente;
    return (!unread || thread.noLeidos > 0) &&
      `${other?.nombre ?? ""} ${thread.campo?.titulo ?? ""} ${thread.contenido}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  });

  return <section className={`inbox-workspace ${opened ? "inbox-workspace--open" : ""}`} aria-label={t("Mensajes", "Mensagens", "Messages")}>
    <MensajesRealtime userId={userId} />
    <aside className="inbox-sidebar">
      <header className="rc-inbox__header"><div><span className="inbox-eyebrow">RENTOCAMPO</span><h1>{t("Mensajes", "Mensagens", "Messages")}</h1></div><span className="inbox-count">{hilos.length}</span></header>
      <label className="inbox-search"><Search size={19} aria-hidden="true"/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Buscar conversaciones…", "Buscar conversas…", "Search conversations…")} aria-label={t("Buscar conversaciones", "Buscar conversas", "Search conversations")}/></label>
      <div className="inbox-filters" aria-label={t("Filtros", "Filtros", "Filters")}>
        <button type="button" aria-pressed={!unread} onClick={() => setUnread(false)}>{t("Todas", "Todas", "All")}</button>
        <button type="button" aria-pressed={unread} onClick={() => setUnread(true)}>{t("Sin leer", "Não lidas", "Unread")} <span>{count}</span></button>
      </div>
      <nav className="inbox-threads" aria-label={t("Conversaciones", "Conversas", "Conversations")}>
        {visible.map(thread => {
          const other = thread.remitente_id === userId ? thread.destinatario : thread.remitente;
          const href = thread.campo ? `${base}/${thread.campo.id}` : `${base}/direct/${thread.remitente_id === userId ? thread.destinatario_id : thread.remitente_id}`;
          const photo = other?.avatar_url ?? [...(thread.campo?.fotos ?? [])].sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0))[0]?.url;
          return <Link key={thread.id} href={href} aria-current={pathname === href ? "page" : undefined} className={`inbox-thread ${thread.noLeidos ? "inbox-thread--unread" : ""}`}>
            <span className="inbox-avatar">{photo ? <Image src={photo} alt="" width={48} height={48}/> : other?.nombre?.[0]?.toUpperCase() ?? "?"}</span>
            <span className="inbox-thread-body"><span className="inbox-thread-top"><strong>{other?.nombre ?? t("Contacto", "Contato", "Contact")}</strong><time dateTime={thread.created_at}>{new Date(thread.created_at).toLocaleDateString(en ? "en-US" : pt ? "pt-BR" : "es-AR", {day:"numeric",month:"short"})}</time></span>
              <span className="rc-inbox__type">{thread.campo?.titulo ?? t("Servicio / Directo", "Serviço / Direto", "Service / Direct")}</span>
              <span className="inbox-preview">{thread.remitente_id === userId && <b className="rc-inbox__own">{t("Vos: ", "Você: ", "You: ")}</b>}{thread.contenido}</span>
            </span>
            {thread.noLeidos > 0 && <span className="inbox-unread">{thread.noLeidos}<span className="inbox-sr"> {t("sin leer", "não lidas", "unread")}</span></span>}
          </Link>;
        })}
        {visible.length === 0 && <div className="inbox-list-empty"><MessageSquare size={30} aria-hidden="true"/><p>{hilos.length === 0 ? t("Todavía no tenés conversaciones.", "Você ainda não tem conversas.", "No conversations yet.") : t("No hay conversaciones que coincidan.", "Nenhuma conversa encontrada.", "No matching conversations.")}</p></div>}
      </nav>
    </aside>
    <div className="inbox-chat">
      {opened ? <><Link className="inbox-mobile-back" href={base}><ArrowLeft size={18}/>{t("Conversaciones", "Conversas", "Conversations")}</Link>{children}</> : <div className="inbox-welcome"><MessageSquare size={48} aria-hidden="true"/><h2>{t("Tus conversaciones, en un solo lugar", "Suas conversas, em um só lugar", "Your conversations, all in one place")}</h2><p>{t("Elegí un contacto para leer y responder sus mensajes.", "Escolha um contato para ler e responder às mensagens.", "Choose a contact to read and reply to messages.")}</p></div>}
    </div>
  </section>;
}
