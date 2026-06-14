import { createFileRoute, Link } from "@tanstack/react-router";
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

function Page() {
  const { t } = useI18n();
  return (
    <main className="bg-background text-foreground">
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Link to="/" className="label-tiny hover:text-foreground">← {t("footer.back")}</Link>
          <h1 className="mt-6 text-4xl sm:text-5xl">{t("legal.title")}</h1>
          <div className="prose-content mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-xl text-foreground">{t("legal.publisherTitle")}</h2>
              <p className="mt-2 whitespace-pre-line">{t("legal.publisherText")}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{t("legal.hostingTitle")}</h2>
              <p className="mt-2">{t("legal.hostingText")}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{t("legal.ipTitle")}</h2>
              <p className="mt-2">{t("legal.ipText")}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{t("legal.photoTitle")}</h2>
              <p className="mt-2">{t("legal.photoText")}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{t("legal.liabilityTitle")}</h2>
              <p className="mt-2">{t("legal.liabilityText")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
