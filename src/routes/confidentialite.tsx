import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité - Les Portes de Montafilan" },
      { name: "description", content: "Politique de confidentialité du gîte Les Portes de Montafilan à Corseul." },
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
          <h1 className="mt-6 text-4xl sm:text-5xl">{t("privacy.title")}</h1>
          <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <p>{t("privacy.intro")}</p>
            <div>
              <h2 className="text-xl text-foreground">{t("privacy.dataTitle")}</h2>
              <p className="mt-2">{t("privacy.dataText")}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{t("privacy.purposeTitle")}</h2>
              <p className="mt-2">{t("privacy.purposeText")}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{t("privacy.retentionTitle")}</h2>
              <p className="mt-2">{t("privacy.retentionText")}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{t("privacy.rightsTitle")}</h2>
              <p className="mt-2">{t("privacy.rightsText")}<a href="mailto:lesportesdemontafilan@gmail.com" className="text-terra hover:underline">lesportesdemontafilan@gmail.com</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
