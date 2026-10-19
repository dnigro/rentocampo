import Link from "next/link";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { translate } from "@/lib/i18n/messages";
import "@/styles/public.css";
import "@/styles/confirm-email-compact.css";

export default async function ConfirmarEmailPage() {
  const country=resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const t=(key: Parameters<typeof translate>[1]) => translate(country,key);
  return (
    <div className="auth-page rc-email-confirm-page">
      <div className="auth-card rc-email-confirm-card">
        <div className="auth-header">
          <div className="confirm-icon">📬</div>
          <h1 className="auth-title">{t("auth.checkEmail")}</h1>
          <p className="auth-subtitle">
            {t("auth.confirmationSent")}
          </p>
        </div>

        <div className="confirm-pasos">
          <div className="confirm-paso">
            <span className="paso-num">1</span>
            <span className="paso-texto">{t("auth.openInbox")}</span>
          </div>
          <div className="confirm-paso">
            <span className="paso-num">2</span>
            <span className="paso-texto">{t("auth.lookForMail")}</span>
          </div>
          <div className="confirm-paso">
            <span className="paso-num">3</span>
            <span className="paso-texto">
              {t("auth.clickConfirm")}
            </span>
          </div>
        </div>

        <div className="confirm-footer">
          <p>{t("auth.checkSpam")}</p>
          <Link
            href="/login"
            className="btn-submit"
            style={{
              textAlign: "center",
              textDecoration: "none",
              display: "block",
            }}
          >
            {t("auth.confirmedLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
