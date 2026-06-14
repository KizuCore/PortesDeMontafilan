import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales - Les Portes de Montafilan" },
      { name: "description", content: "Mentions légales du site Les Portes de Montafilan, gîte à Corseul en Bretagne." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function renderLine(line: string): ReactNode {
  const urlMatch = line.match(/https?:\/\/\S+/);
  if (urlMatch) {
    const url = urlMatch[0].replace(/[.,;:!?]+$/, "");
    const prefix = line.slice(0, urlMatch.index).trim();
    const suffix = line.slice((urlMatch.index ?? 0) + url.length).trim();
    return (
      <>
        {prefix ? `${prefix} ` : ""}
        <a href={url} target="_blank" rel="noreferrer" className="text-terra hover:underline">{url}</a>
        {suffix ? ` ${suffix}` : ""}
      </>
    );
  }

  const emailMatch = line.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    const email = emailMatch[0].replace(/[.,;:!?]+$/, "");
    const prefix = line.slice(0, emailMatch.index).trim();
    const suffix = line.slice((emailMatch.index ?? 0) + email.length).trim();
    return (
      <>
        {prefix ? `${prefix} ` : ""}
        <a href={`mailto:${email}`} className="text-terra hover:underline">{email}</a>
        {suffix ? ` ${suffix}` : ""}
      </>
    );
  }

  return line;
}

function Page() {
  const { t, tm } = useI18n();
  const blocks = [
    { title: t("legal.publisherTitle"), lines: tm("legal.publisherLines") },
    { title: t("legal.hostingTitle"), lines: tm("legal.hostingLines") },
    { title: t("legal.contactTitle"), lines: tm("legal.contactLines") },
  ];

  return (
    <main className="bg-background text-foreground">
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Link to="/" className="label-tiny hover:text-foreground">← {t("footer.back")}</Link>
          <h1 className="mt-6 text-4xl sm:text-5xl">{t("legal.title")}</h1>
          <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <p>{t("legal.lead")}</p>
            {blocks.map((block) => (
              <div key={block.title}>
                <h2 className="text-xl text-foreground">{block.title}</h2>
                <ul className="mt-3 space-y-2">
                  {block.lines.map((line) => (
                    <li key={line}>· {renderLine(line)}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="text-xl text-foreground">{t("legal.ipTitle")}</h2>
              <p className="mt-2">{renderLine(t("legal.ipText"))}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
