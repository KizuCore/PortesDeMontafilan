import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export function CookiesPage() {
  const { t, tm } = useI18n();
  const policyLines = tm("cookies.policyLines");

  return (
    <main className="bg-background text-foreground">
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Link to="/" className="label-tiny hover:text-foreground">
            ← {t("footer.back")}
          </Link>
          <h1 className="mt-6 text-4xl sm:text-5xl">Cookies</h1>
          <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <p>{t("cookies.pageIntro")}</p>
            <div>
              <h2 className="text-xl text-foreground">
                {t("cookies.usedTitle")}
              </h2>
              <ul className="mt-3 space-y-2">
                <li>
                  · <strong className="text-foreground">lang</strong> -{" "}
                  {t("cookies.langDescription")}
                </li>
                <li>
                  ·{" "}
                  <strong className="text-foreground">cookie-consent-v1</strong>{" "}
                  - {t("cookies.consentDescription")}
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl text-foreground">
                {t("cookies.policyTitle")}
              </h2>
              <ul className="mt-3 space-y-2">
                {policyLines.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl text-foreground">
                {t("cookies.removalTitle")}
              </h2>
              <p className="mt-2">{t("cookies.removalText")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
