import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const KEY = "cookie-consent-v1";

export function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* localStorage peut etre indisponible en navigation privee. */
    }
  }, []);
  if (!visible) return null;
  const accept = () => {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {
      /* Le consentement reste valable pour la session courante. */
    }
    setVisible(false);
  };
  return (
    <div className="fixed inset-x-3 bottom-3 z-[100] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md">
      <div className="rounded-2xl border border-border bg-card/95 backdrop-blur p-4 shadow-card sm:p-5">
        <p className="text-sm text-foreground/85 leading-relaxed">
          {t("cookies.text")}
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Link
            to="/cookies"
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            {t("cookies.more")}
          </Link>
          <button onClick={accept} className="btn-primary !py-2 !text-[11px]">
            {t("cookies.ok")}
          </button>
        </div>
      </div>
    </div>
  );
}
