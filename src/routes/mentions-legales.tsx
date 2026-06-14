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
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <main className="bg-background text-foreground">
      <section className="py-20 sm:py-28">
        <div className="container-x max-w-3xl">
          <Link to="/" className="label-tiny hover:text-foreground">← {fr ? "Retour à l'accueil" : "Back to home"}</Link>
          <h1 className="mt-6 text-4xl sm:text-5xl">{fr ? "Mentions légales" : "Legal notice"}</h1>
          <div className="prose-content mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Éditeur du site" : "Site publisher"}</h2>
              <p className="mt-2">Jocelyne & Christian - Les Portes de Montafilan<br />Corseul, 22130, Côtes-d'Armor, France<br />Téléphone : +33 7 80 71 01 59<br />Email : lesportesdemontafilan@gmail.com</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Hébergement du site" : "Hosting"}</h2>
              <p className="mt-2">{fr ? "Site hébergé sur l'infrastructure Cloudflare Workers." : "This website is hosted on Cloudflare Workers infrastructure."}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Propriété intellectuelle" : "Intellectual property"}</h2>
              <p className="mt-2">
                {fr
                  ? "L'ensemble des contenus présents sur ce site (textes, photographies, identité visuelle) est la propriété exclusive de Les Portes de Montafilan, sauf mentions contraires. Toute reproduction ou diffusion sans autorisation préalable est interdite."
                  : "All content on this site (text, photographs, visual identity) is the exclusive property of Les Portes de Montafilan, unless otherwise stated. Any reproduction or distribution without prior authorisation is prohibited."}
              </p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Crédits photos" : "Photo credits"}</h2>
              <p className="mt-2">{fr ? "Photographies du gîte : Jocelyne & Christian. Photographies des sites touristiques : offices de tourisme partenaires." : "Cottage photographs: Jocelyne & Christian. Tourist site photographs: partner tourism offices."}</p>
            </div>
            <div>
              <h2 className="text-xl text-foreground">{fr ? "Responsabilité" : "Liability"}</h2>
              <p className="mt-2">{fr ? "Les informations diffusées sont données à titre indicatif. Malgré le soin apporté à leur mise à jour, des erreurs ou omissions peuvent subsister. N'hésitez pas à nous contacter pour tout signalement." : "Information provided is for guidance only. Despite our care in keeping it up to date, errors or omissions may remain. Please contact us to report any issue."}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
