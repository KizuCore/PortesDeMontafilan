import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

function renderLine(line: string): ReactNode {
  const emailMatch = line.match(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  );
  if (emailMatch) {
    const email = emailMatch[0].replace(/[.,;:!?]+$/, "");
    const prefix = line.slice(0, emailMatch.index).trim();
    const suffix = line.slice((emailMatch.index ?? 0) + email.length).trim();
    return (
      <>
        {prefix ? `${prefix} ` : ""}
        <a href={`mailto:${email}`} className="text-terra hover:underline">
          {email}
        </a>
        {suffix ? `${suffix}` : ""}
      </>
    );
  }

  return line;
}

export function ConfidentialitePage() {
  const { t, tm } = useI18n();
  const blocks = [
    { title: t("privacy.dataTitle"), lines: tm("privacy.dataLines") },
    { title: t("privacy.cookiesTitle"), lines: tm("privacy.cookiesLines") },
  ];

  return (
    <main className="bg-background text-foreground">
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Link to="/" className="label-tiny hover:text-foreground">
            ← {t("footer.back")}
          </Link>
          <h1 className="mt-6 text-4xl sm:text-5xl">{t("privacy.title")}</h1>
          <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <p>{t("privacy.lead")}</p>
            {blocks.map((block) => (
              <div key={block.title}>
                <h2 className="text-xl text-foreground">{block.title}</h2>
                <ul className="mt-3 space-y-2">
                  {block.lines.map((line) => (
                    <li key={line}>· {line}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-xl text-foreground">
                {t("privacy.rightsTitle")}
              </h2>
              <p className="mt-2">{renderLine(t("privacy.rightsBody"))}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">
                {t("privacy.updateTitle")}
              </h2>
              <p className="mt-2">{t("privacy.updateBody")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
