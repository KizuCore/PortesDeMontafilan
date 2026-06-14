import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookies — Les Portes de Montafilan" },
      { name: "description", content: "Gestion des cookies sur le site Les Portes de Montafilan." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <main className="bg-background text-foreground">
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Link to="/" className="label-tiny hover:text-foreground">← {fr ? "Retour à l'accueil" : "Back to home"}</Link>
          <h1 className="mt-6 text-4xl sm:text-5xl">Cookies</h1>
          <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <p>{fr ? "Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement. Aucun cookie publicitaire ni traceur tiers n'est déposé." : "This site only uses cookies strictly necessary for its operation. No advertising cookies or third-party trackers are placed."}</p>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Cookies utilisés" : "Cookies used"}</h2>
              <ul className="mt-3 space-y-2">
                <li>· <strong className="text-foreground">lang</strong> — {fr ? "mémorise votre langue préférée (FR / EN)." : "remembers your preferred language (FR / EN)."}</li>
                <li>· <strong className="text-foreground">cookie-consent-v1</strong> — {fr ? "garde en mémoire votre acceptation de ce bandeau." : "remembers that you acknowledged this banner."}</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Suppression" : "Removal"}</h2>
              <p className="mt-2">{fr ? "Vous pouvez à tout moment effacer ces préférences depuis les paramètres de votre navigateur." : "You can erase these preferences at any time from your browser settings."}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
